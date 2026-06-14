from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

from app.models.twin_model import TwinModel
from app.models.event_model import EventModel

from app.services.twin_service.twin_store import TwinStore
from app.services.twin_service.journey_engine import JourneyEngine
from app.services.twin_service.segment_engine import SegmentEngine

from app.services.twin_service.scoring.intent_score import IntentScoreEngine
from app.services.twin_service.scoring.churn_score import ChurnScoreEngine
from app.services.twin_service.scoring.fatigue_score import FatigueScoreEngine
from app.services.twin_service.scoring.conversion_score import ConversionScoreEngine

from app.services.nba_service import NBAEngine, NBAResult
from app.services.consent_service import ConsentEngine

from app.core.logger import logger


# ---------------------------------------------------------------------
# Action → Channel Mapping
# ---------------------------------------------------------------------

ACTION_TO_CHANNEL: Dict[str, str] = {
    "send_email": "email",
    "send_whatsapp": "whatsapp",
    "send_push": "push",
    "send_sms": "sms",

    # Business actions mapped to delivery channels
    "send_coupon": "email",
    "cart_recovery_coupon": "email",
    "invite_to_vip_club": "email",
    "trigger_retargeting_campaign": "email",
    "recommend_checkout": "website",
    "recommend_popular_products": "website",
    "show_website_personalization": "website",
}

NO_CHANNEL_ACTIONS = {
    "cool_down_marketing",
    "do_nothing",
    "reduce_frequency",
}


# ---------------------------------------------------------------------
# Structured Result Returned to API / Frontend
# ---------------------------------------------------------------------

@dataclass
class ProcessingResult:
    customer_id: str
    twin: TwinModel
    nba_result: NBAResult
    final_action: str
    final_channel: Optional[str]
    consent_gate_applied: bool
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "customer_id": self.customer_id,
            "twin": {
                "customer_id": self.twin.customer_id,
                "intent_score": self.twin.intent_score,
                "churn_risk": self.twin.churn_risk,
                "fatigue_score": self.twin.fatigue_score,
                "conversion_probability": self.twin.conversion_probability,
                "journey_stage": self.twin.journey_stage,
                "segment": self.twin.segment,
                "preferred_channel": self.twin.preferred_channel,
                "next_best_action": self.twin.next_best_action,
                "raw_counters": self.twin.raw_counters or {},
            },
            "nba_decision": self.nba_result.to_dict(),
            "final_action": self.final_action,
            "final_channel": self.final_channel,
            "consent_gate_applied": self.consent_gate_applied,
            "timestamp": self.timestamp,
        }


# ---------------------------------------------------------------------
# Twin Service
# ---------------------------------------------------------------------

class TwinService:
    """
    Core orchestrator for MarketTwin AI Digital Twins.

    Main responsibilities:
    1. Load/create customer twin.
    2. Update raw counters from incoming event.
    3. Recalculate intent, churn, fatigue, and conversion scores.
    4. Update journey stage.
    5. Assign customer segment.
    6. Call NBAEngine for next-best-action.
    7. Apply ConsentEngine before final action.
    8. Save and return structured result.

    Final pipeline:
        Event → Twin Update → NBA Engine → Consent Gate → Final Action
    """

    def __init__(self, db: Session):
        self.db = db
        self.store = TwinStore(db)
        self.nba_engine = NBAEngine()
        self.consent_engine = ConsentEngine()

    # -----------------------------------------------------------------
    # Public read method
    # -----------------------------------------------------------------

    def get_twin(self, customer_id: str) -> Optional[TwinModel]:
        """
        Retrieves the digital twin of a customer.
        """
        return self.store.load_twin(customer_id)

    # -----------------------------------------------------------------
    # NBA Retrieval methods
    # -----------------------------------------------------------------

    def _build_nba_input(self, twin: TwinModel) -> Dict[str, Any]:
        """Convert TwinModel into dictionary for NBAEngine."""
        raw = twin.raw_counters or {}
        return {
            "customer_id": twin.customer_id,
            "intent_score": twin.intent_score,
            "fatigue_score": twin.fatigue_score,
            "cart_abandoned": twin.journey_stage == "cart_abandoned" or raw.get("abandonments", 0) > 0,
            "abandonments": raw.get("abandonments", 0),
            "purchases": raw.get("purchases", 0),
            "preferred_channel": twin.preferred_channel,
            "is_converted": twin.journey_stage in ("converted", "loyal"),
        }

    def get_nba_for_customer(self, customer_id: str) -> Dict[str, Any]:
        twin = self.store.load_twin(customer_id)
        if not twin:
            twin = self.store.create_twin(customer_id)
            
        nba_input = self._build_nba_input(twin)
        nba_result = self.nba_engine.get_next_best_action(nba_input)
        
        final_action, final_channel, gate_applied = self._apply_consent_gate(
            customer_id=customer_id,
            nba_result=nba_result,
        )
        
        return {
            "customer_id": customer_id,
            "action": final_action,
            "confidence": nba_result.confidence,
            "reason": nba_result.reason,
            "consent_gate_applied": gate_applied,
            "final_channel": final_channel,
        }

    def get_nba_explanation(self, customer_id: str) -> Dict[str, Any]:
        twin = self.store.load_twin(customer_id)
        if not twin:
            twin = self.store.create_twin(customer_id)
            
        nba_input = self._build_nba_input(twin)
        return self.nba_engine.explain_action(nba_input)

    # -----------------------------------------------------------------
    # Full processing pipeline
    # -----------------------------------------------------------------

    def process_event(self, customer_id: str, event: EventModel) -> ProcessingResult:
        """
        Full event-processing pipeline.

        This should be called by your API route after identity resolution.

        Flow:
            1. Update customer twin from event.
            2. Run NBA engine.
            3. Apply consent/channel fallback.
            4. Save final action.
            5. Return structured result.
        """

        logger.info(
            f"Processing full twin pipeline for customer '{customer_id}' "
            f"on event '{event.event_type}'"
        )

        # Step 1: Update twin state and scores
        twin = self.update_twin(customer_id, event)

        # Step 2: Raw NBA decision before consent
        nba_input = self._build_nba_input(twin)
        nba_result = self.nba_engine.get_next_best_action(nba_input)

        # Step 3: Consent-aware final action
        final_action, final_channel, gate_applied = self._apply_consent_gate(
            customer_id=customer_id,
            nba_result=nba_result,
        )

        # Step 4: Save final action into twin
        twin.next_best_action = final_action
        self.store.save_twin(twin)

        # Step 5: Return frontend-friendly structure
        return ProcessingResult(
            customer_id=customer_id,
            twin=twin,
            nba_result=nba_result,
            final_action=final_action,
            final_channel=final_channel,
            consent_gate_applied=gate_applied,
        )

    # -----------------------------------------------------------------
    # Twin update only
    # -----------------------------------------------------------------

    def update_twin(self, customer_id: str, event: EventModel) -> TwinModel:
        """
        Loads the twin, aggregates counters from the incoming event,
        re-evaluates Intent, Churn, Fatigue, and Conversion probability,
        determines journey transitions, and sets the segment.

        Important:
        This method should not own final NBA decisioning.
        Final decisioning happens in process_event().
        """

        logger.info(
            f"Re-evaluating digital twin for customer '{customer_id}' "
            f"on event '{event.event_type}'"
        )

        # 1. Load or initialize twin state
        twin = self.store.load_twin(customer_id)
        if not twin:
            twin = self.store.create_twin(customer_id)

        raw_counters = dict(twin.raw_counters or {})
        event_type = event.event_type
        props = event.properties or {}

        # Normalize event naming
        if event_type == "cart_abandon":
            event_type = "cart_abandoned"

        # 2. Update contextual inactivity and last active time
        prev_active_str = raw_counters.get("last_active_time")

        event_time = event.timestamp or datetime.now(timezone.utc)
        if event_time.tzinfo is None:
            event_time = event_time.replace(tzinfo=timezone.utc)

        if prev_active_str:
            try:
                prev_active = datetime.fromisoformat(
                    prev_active_str.replace("Z", "+00:00")
                )

                if prev_active.tzinfo is None:
                    prev_active = prev_active.replace(tzinfo=timezone.utc)

                diff = (event_time - prev_active).days
                raw_counters["inactive_days"] = max(0, diff)

            except Exception as e:
                logger.error(
                    f"Error parsing last_active_time '{prev_active_str}': {e}"
                )
                raw_counters["inactive_days"] = 0
        else:
            raw_counters["inactive_days"] = 0

        raw_counters["last_active_time"] = event_time.isoformat()
        raw_counters["recent_activity"] = 1

        # 3. Process event-specific metrics

        if event_type == "product_view":
            raw_counters["views"] = raw_counters.get("views", 0) + 1

            product_id = (
                props.get("product_id")
                or props.get("item_id")
                or props.get("productId")
            )

            if product_id:
                product_views = raw_counters.get("product_views", {})

                if product_id in product_views:
                    product_views[product_id] += 1
                    raw_counters["repeated_views"] = (
                        raw_counters.get("repeated_views", 0) + 1
                    )
                else:
                    product_views[product_id] = 1

                raw_counters["product_views"] = product_views

        elif event_type == "add_to_cart":
            raw_counters["carts"] = raw_counters.get("carts", 0) + 1

        elif event_type == "remove_from_cart":
            raw_counters["carts"] = max(
                0,
                raw_counters.get("carts", 0) - 1,
            )

        elif event_type == "cart_abandoned":
            raw_counters["abandonments"] = (
                raw_counters.get("abandonments", 0) + 1
            )

        elif event_type == "purchase":
            raw_counters["purchases"] = raw_counters.get("purchases", 0) + 1
            raw_counters["carts"] = 0

            price = props.get("price") or props.get("value") or 0.0

            try:
                price = float(price)
            except (TypeError, ValueError):
                price = 0.0

            raw_counters["total_spend"] = (
                raw_counters.get("total_spend", 0.0) + price
            )

        # Message sending metrics
        elif event_type in ("email_sent", "whatsapp_sent", "push_sent"):
            raw_counters["messages_last_48h"] = (
                raw_counters.get("messages_last_48h", 0) + 1
            )

            # Assume ignored until a click/open response arrives
            raw_counters["ignored_messages"] = (
                raw_counters.get("ignored_messages", 0) + 1
            )

        # Engagement clicks/open metrics
        elif event_type in (
            "email_open",
            "email_click",
            "whatsapp_click",
            "push_click",
            "banner_click",
        ):
            raw_counters["clicks_last_48h"] = (
                raw_counters.get("clicks_last_48h", 0) + 1
            )

            raw_counters["ignored_messages"] = max(
                0,
                raw_counters.get("ignored_messages", 0) - 1,
            )

            if "coupon" in props or "discount" in props:
                raw_counters["discount_affinity"] = min(
                    100,
                    raw_counters.get("discount_affinity", 50) + 10,
                )

        elif event_type == "unsubscribe":
            raw_counters["unsubscribes"] = (
                raw_counters.get("unsubscribes", 0) + 1
            )
            raw_counters["messages_last_48h"] = (
                raw_counters.get("messages_last_48h", 0) + 1
            )
            raw_counters["ignored_messages"] = (
                raw_counters.get("ignored_messages", 0) + 1
            )

        # 4. Extract preferred channel and channel affinity

        source = event.source

        if source:
            # Normalize website/storefront as website
            if source in ("storefront", "shopverse"):
                source = "website"

            channels = raw_counters.get("channels_used", {})
            channels[source] = channels.get(source, 0) + 1
            raw_counters["channels_used"] = channels

            preferred = max(channels, key=channels.get)
            twin.preferred_channel = preferred

            total_actions = sum(channels.values())
            if total_actions > 0:
                raw_counters["channel_affinity"] = int(
                    (channels[preferred] / total_actions) * 100
                )
            else:
                raw_counters["channel_affinity"] = 0

        # 5. Save counters back to twin
        twin.raw_counters = raw_counters

        # 6. Run scoring models
        twin.intent_score = IntentScoreEngine.calculate(raw_counters)
        twin.churn_risk = ChurnScoreEngine.calculate(raw_counters)
        twin.fatigue_score = FatigueScoreEngine.calculate(raw_counters)

        twin.conversion_probability = ConversionScoreEngine.calculate(
            twin.intent_score,
            twin.fatigue_score,
            raw_counters,
        )

        # 7. Apply journey transition
        twin.journey_stage = JourneyEngine.transition(
            twin.journey_stage,
            event_type,
            raw_counters,
        )

        # 8. Assign segment
        twin.segment = SegmentEngine.assign_segment(
            twin.intent_score,
            raw_counters,
        )

        # 9. Temporary NBA preview only
        # Final consent-aware action is set in process_event().
        try:
            nba_input = self._build_nba_input(twin)
            nba_result = self.nba_engine.get_next_best_action(nba_input)
            twin.next_best_action = nba_result.action
        except Exception as e:
            logger.error(f"NBA preview failed: {e}")
            twin.next_best_action = "do_nothing"

        # 10. Save updated twin
        return self.store.save_twin(twin)

    # -----------------------------------------------------------------
    # Consent gate
    # -----------------------------------------------------------------

    def _apply_consent_gate(
        self,
        customer_id: str,
        nba_result: NBAResult,
    ) -> tuple[str, Optional[str], bool]:
        """
        Applies consent rules to the NBA decision.

        Returns:
            final_action, final_channel, consent_gate_applied
        """

        action = nba_result.action

        # No-channel actions pass directly
        if action in NO_CHANNEL_ACTIONS:
            return action, None, False

        preferred_channel = getattr(
            nba_result, 
            "channel", 
            None
        ) or ACTION_TO_CHANNEL.get(action)

        if preferred_channel is None:
            logger.warning(
                f"Unknown NBA action '{action}'. Falling back to do_nothing."
            )
            return "do_nothing", None, True

        resolved_channel = self.consent_engine.resolve_channel_with_fallback(
            customer_id=customer_id,
            preferred_channel=preferred_channel,
        )

        # No allowed channel available
        if resolved_channel is None:
            return "do_nothing", None, True

        gate_applied = resolved_channel != preferred_channel

        # If consent did not change the channel, preserve original action
        if not gate_applied:
            return action, resolved_channel, False

        # If consent fallback changed channel, map to canonical action
        channel_action_map = {
            "email": "send_email",
            "whatsapp": "send_whatsapp",
            "push": "send_push",
            "sms": "send_sms",
            "website": "show_website_personalization",
        }

        resolved_action = channel_action_map.get(
            resolved_channel,
            "do_nothing",
        )

        return resolved_action, resolved_channel, True