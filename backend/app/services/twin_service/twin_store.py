from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.twin_model import TwinModel
from app.shared.storage import JSONFallbackStore
from app.core.logger import logger


class TwinStore:
    """
    SQLite-backed repository for Digital Twins.

    Responsibilities:
    1. Load an existing twin.
    2. Create a new twin with default counters.
    3. Save updated twin state.
    4. Return all twins for dashboards.
    5. Backup twin state to JSON fallback storage.

    This class is used by TwinService.
    TwinService should not directly query the database.
    """

    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------
    # Read one twin
    # ------------------------------------------------------------------

    def load_twin(self, customer_id: str) -> Optional[TwinModel]:
        """
        Loads the active digital twin for a customer.
        Returns None if the twin does not exist.
        """
        return (
            self.db.query(TwinModel)
            .filter(TwinModel.customer_id == customer_id)
            .first()
        )

    # ------------------------------------------------------------------
    # Create new twin
    # ------------------------------------------------------------------

    def create_twin(self, customer_id: str) -> TwinModel:
        """
        Initializes and registers a new digital twin with default counters.
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

            # messaging / fatigue tracking
            "messages_last_48h": 0,
            "clicks_last_48h": 0,
            "ignored_messages": 0,
            "unsubscribes": 0,

            # value / affinity tracking
            "total_spend": 0.0,
            "channel_affinity": 50,
            "discount_affinity": 50,

            # timestamps
            "last_active_time": now_str,
            "first_seen": now_str,

            # product and channel maps
            "product_views": {},
            "channels_used": {},
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
            raw_counters=default_counters,
        )

        self.db.add(db_twin)
        self.db.commit()
        self.db.refresh(db_twin)

        self._backup_twins_to_json()

        return db_twin

    # ------------------------------------------------------------------
    # Get or create twin
    # ------------------------------------------------------------------

    def get_or_create(self, customer_id: str) -> TwinModel:
        """
        Loads an existing twin or creates one if it does not exist.
        Useful for routes/services that need a guaranteed twin object.
        """
        twin = self.load_twin(customer_id)

        if twin:
            return twin

        return self.create_twin(customer_id)

    # ------------------------------------------------------------------
    # Save twin
    # ------------------------------------------------------------------

    def save_twin(self, twin: TwinModel) -> TwinModel:
        """
        Persists current digital twin state updates.
        """

        self.db.add(twin)
        self.db.commit()
        self.db.refresh(twin)

        self._backup_twins_to_json()

        return twin

    # ------------------------------------------------------------------
    # Read all twins
    # ------------------------------------------------------------------

    def get_all_twins(self) -> List[TwinModel]:
        """
        Returns all digital twins.
        Used by dashboards, segment analytics, and metrics pages.
        """
        return self.db.query(TwinModel).all()

    # ------------------------------------------------------------------
    # JSON fallback backup
    # ------------------------------------------------------------------

    def _backup_twins_to_json(self) -> None:
        """
        Exports active twin states to twins.json as fallback/debug storage.
        """

        try:
            twins = self.db.query(TwinModel).all()

            output = []

            for twin in twins:
                updated_at = None

                if getattr(twin, "updated_at", None):
                    try:
                        updated_at = twin.updated_at.isoformat()
                    except Exception:
                        updated_at = str(twin.updated_at)

                output.append(
                    {
                        "customer_id": twin.customer_id,
                        "journey_stage": twin.journey_stage,
                        "intent_score": twin.intent_score,
                        "churn_risk": twin.churn_risk,
                        "fatigue_score": twin.fatigue_score,
                        "conversion_probability": twin.conversion_probability,
                        "segment": twin.segment,
                        "preferred_channel": twin.preferred_channel,
                        "next_best_action": twin.next_best_action,
                        "raw_counters": twin.raw_counters or {},
                        "updated_at": updated_at,
                    }
                )

            JSONFallbackStore.save("twins.json", output)

        except Exception as e:
            logger.error(f"Failed to backup digital twins: {e}")
