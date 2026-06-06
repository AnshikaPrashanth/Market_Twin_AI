from sqlalchemy.orm import Session
from app.models.twin_model import TwinModel
from app.shared.storage import JSONFallbackStore
from app.core.logger import logger
from typing import Optional
from datetime import datetime, timezone

class TwinStore:
    """
    Manages SQLite database storage for Digital Twins.
    Also exports all active twins to 'twins.json' as fallback.
    """
    def __init__(self, db: Session):
        self.db = db

    def load_twin(self, customer_id: str) -> Optional[TwinModel]:
        """
        Loads the active twin state for a customer.
        """
        return self.db.query(TwinModel).filter(TwinModel.customer_id == customer_id).first()

    def create_twin(self, customer_id: str) -> TwinModel:
        """
        Initializes and registers a new Digital Twin with default counters.
        """
        now_str = datetime.now(timezone.utc).isoformat()
        default_counters = {
            "views": 0,
            "carts": 0,
            "repeated_views": 0,
            "recent_activity": 1,
            "purchases": 0,
            "abandonments": 0,
            "inactive_days": 0,
            "messages_last_48h": 0,
            "clicks_last_48h": 0,
            "ignored_messages": 0,
            "total_spend": 0.0,
            "channel_affinity": 50,
            "discount_affinity": 50,
            "last_active_time": now_str,
            "first_seen": now_str,
            "product_views": {},  # Maps product_id -> view_count
            "channels_used": {}   # Maps channel_name -> event_count
        }

        db_twin = TwinModel(
            customer_id=customer_id,
            journey_stage="anonymous",
            intent_score=0,
            churn_risk=0,
            fatigue_score=0,
            conversion_probability=0,
            segment="Standard Customer",
            preferred_channel=None,
            next_best_action=None,
            raw_counters=default_counters
        )
        self.db.add(db_twin)
        self.db.commit()
        self.db.refresh(db_twin)

        self._backup_twins_to_json()
        return db_twin

    def save_twin(self, twin: TwinModel) -> TwinModel:
        """
        Persists current digital twin state updates.
        """
        self.db.add(twin)
        self.db.commit()
        self.db.refresh(twin)

        self._backup_twins_to_json()
        return twin

    def _backup_twins_to_json(self):
        try:
            twins = self.db.query(TwinModel).all()
            output = [
                {
                    "customer_id": t.customer_id,
                    "journey_stage": t.journey_stage,
                    "intent_score": t.intent_score,
                    "churn_risk": t.churn_risk,
                    "fatigue_score": t.fatigue_score,
                    "conversion_probability": t.conversion_probability,
                    "segment": t.segment,
                    "preferred_channel": t.preferred_channel,
                    "next_best_action": t.next_best_action,
                    "raw_counters": t.raw_counters,
                    "updated_at": t.updated_at.isoformat()
                }
                for t in twins
            ]
            JSONFallbackStore.save("twins.json", output)
        except Exception as e:
            logger.error(f"Failed to backup digital twins: {e}")
            
    def get_all_twins(self):
        return self.db.query(TwinModel).all()
