from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone

from app.models.twin_model import TwinModel
from app.models.event_model import EventModel
from app.services.twin_service.twin_store import TwinStore
from app.services.twin_service.journey_engine import JourneyEngine
from app.services.twin_service.segment_engine import SegmentEngine
from app.services.twin_service.scoring.intent_score import IntentScoreEngine
from app.services.twin_service.scoring.churn_score import ChurnScoreEngine
from app.services.twin_service.scoring.fatigue_score import FatigueScoreEngine
from app.services.twin_service.scoring.conversion_score import ConversionScoreEngine
from app.core.logger import logger

class TwinService:
    """
    Core orchestrator for Digital Twins. Manages loading, updating metric counters,
    re-running score computations, checking journey state rules, and mapping next best action tags.
    """
    def __init__(self, db: Session):
        self.db = db
        self.store = TwinStore(db)

    def get_twin(self, customer_id: str) -> Optional[TwinModel]:
        """
        Retrieves the digital twin of a customer.
        """
        return self.store.load_twin(customer_id)

    def update_twin(self, customer_id: str, event: EventModel) -> TwinModel:
        """
        Loads the twin, aggregates counters from the incoming event,
        re-evaluates Intent, Churn, Fatigue, and Conversion probability,
        determines journey transitions, sets the segment, and suggests the Next Best Action.
        """
        logger.info(f"Re-evaluating digital twin for customer '{customer_id}' on event '{event.event_type}'")

        # 1. Load or Initialize Twin State
        twin = self.store.load_twin(customer_id)
        if not twin:
            twin = self.store.create_twin(customer_id)

        raw_counters = dict(twin.raw_counters)
        event_type = event.event_type
        props = event.properties or {}

        # 2. Update Contextual Inactivity & Last Active Times
        prev_active_str = raw_counters.get("last_active_time")
        event_time = event.timestamp.replace(tzinfo=timezone.utc) if event.timestamp.tzinfo is None else event.timestamp
        
        if prev_active_str:
            try:
                prev_active = datetime.fromisoformat(prev_active_str.replace("Z", "+00:00"))
                if prev_active.tzinfo is None:
                    prev_active = prev_active.replace(tzinfo=timezone.utc)
                diff = (event_time - prev_active).days
                raw_counters["inactive_days"] = max(0, diff)
            except Exception as e:
                logger.error(f"Error parsing last_active_time '{prev_active_str}': {e}")
                raw_counters["inactive_days"] = 0
        else:
            raw_counters["inactive_days"] = 0

        # Update active timestamps
        raw_counters["last_active_time"] = event_time.isoformat()
        raw_counters["recent_activity"] = 1  # Active right now

        # 3. Process event-specific metrics
        if event_type == "product_view":
            raw_counters["views"] = raw_counters.get("views", 0) + 1
            
            # Check for repeated views of specific products
            product_id = props.get("product_id")
            if product_id:
                product_views = raw_counters.get("product_views", {})
                if product_id in product_views:
                    product_views[product_id] += 1
                    raw_counters["repeated_views"] = raw_counters.get("repeated_views", 0) + 1
                else:
                    product_views[product_id] = 1
                raw_counters["product_views"] = product_views

        elif event_type == "add_to_cart":
            raw_counters["carts"] = raw_counters.get("carts", 0) + 1

        elif event_type == "remove_from_cart":
            raw_counters["carts"] = max(0, raw_counters.get("carts", 0) - 1)

        elif event_type == "cart_abandon":
            raw_counters["abandonments"] = raw_counters.get("abandonments", 0) + 1

        elif event_type == "purchase":
            raw_counters["purchases"] = raw_counters.get("purchases", 0) + 1
            raw_counters["carts"] = 0  # Checkout resets cart count
            price = props.get("price") or props.get("value") or 0.0
            raw_counters["total_spend"] = raw_counters.get("total_spend", 0.0) + float(price)

        # Message sending metrics
        elif event_type in ("email_sent", "whatsapp_sent", "push_sent"):
            raw_counters["messages_last_48h"] = raw_counters.get("messages_last_48h", 0) + 1
            raw_counters["ignored_messages"] = raw_counters.get("ignored_messages", 0) + 1

        # Engagement clicks reset messaging ignore count
        elif event_type in ("email_open", "email_click", "whatsapp_click", "push_click", "banner_click"):
            raw_counters["clicks_last_48h"] = raw_counters.get("clicks_last_48h", 0) + 1
            raw_counters["ignored_messages"] = max(0, raw_counters.get("ignored_messages", 0) - 1)
            
            # Update discount affinity if engaging with discount attributes
            if "coupon" in props or "discount" in props:
                raw_counters["discount_affinity"] = min(100, raw_counters.get("discount_affinity", 50) + 10)

        # 4. Extract preferred channels and calculate channel affinity
        source = event.source
        if source:
            channels = raw_counters.get("channels_used", {})
            channels[source] = channels.get(source, 0) + 1
            raw_counters["channels_used"] = channels

            # Preferred channel is the channel with the most events
            preferred = max(channels, key=channels.get)
            twin.preferred_channel = preferred
            
            # Channel affinity percentage
            total_actions = sum(channels.values())
            raw_counters["channel_affinity"] = int((channels[preferred] / total_actions) * 100)

        # Save raw counters dictionary back to digital twin model
        twin.raw_counters = raw_counters

        # 5. Run scoring models
        twin.intent_score = IntentScoreEngine.calculate(raw_counters)
        twin.churn_risk = ChurnScoreEngine.calculate(raw_counters)
        twin.fatigue_score = FatigueScoreEngine.calculate(raw_counters)
        twin.conversion_probability = ConversionScoreEngine.calculate(
            twin.intent_score, twin.fatigue_score, raw_counters
        )

        # 6. Apply stage transition machine
        twin.journey_stage = JourneyEngine.transition(twin.journey_stage, event_type, raw_counters)

        # 7. Apply rule-based segments
        twin.segment = SegmentEngine.assign_segment(twin.intent_score, raw_counters)

        # 8. Determine Next Best Action
        if twin.fatigue_score > 70:
            twin.next_best_action = "cool_down_marketing"
        elif twin.segment == "Premium Loyalist":
            twin.next_best_action = "invite_to_vip_club"
        elif twin.segment == "High Intent Cart Abandoner":
            twin.next_best_action = "send_coupon"
        elif twin.journey_stage == "churn_risk":
            twin.next_best_action = "trigger_retargeting_campaign"
        elif twin.journey_stage == "cart_active":
            twin.next_best_action = "recommend_checkout"
        else:
            twin.next_best_action = "recommend_popular_products"

        # 9. Commit changes to store
        return self.store.save_twin(twin)
