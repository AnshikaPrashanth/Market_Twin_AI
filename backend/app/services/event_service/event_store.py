from sqlalchemy.orm import Session
from app.models.event_model import EventModel
from app.schemas.event_schema import EventCreate
from app.shared.storage import JSONFallbackStore
from app.core.logger import logger
from typing import List, Optional

class EventStore:
    """
    Handles persistence operations for events in SQLite via SQLAlchemy
    and keeps a backup in the JSON fallback file.
    """
    def __init__(self, db: Session):
        self.db = db

    def save_event(self, event: EventCreate, resolved_customer_id: Optional[str] = None) -> EventModel:
        """
        Saves a normalized event into SQLite and appends it to the JSON fallback.
        """
        logger.debug(f"Saving event {event.event_id} in SQLite")
        
        db_event = EventModel(
            event_id=event.event_id,
            event_type=event.event_type,
            source=event.source,
            timestamp=event.timestamp,
            identifiers=event.identifiers.model_dump(),
            customer_id=resolved_customer_id or event.customer_id,
            properties=event.properties
        )
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)

        # JSON Fallback backup
        try:
            events_list = JSONFallbackStore.load("sample_events.json", default=[])
            events_list.append({
                "event_id": db_event.event_id,
                "event_type": db_event.event_type,
                "source": db_event.source,
                "timestamp": db_event.timestamp.isoformat(),
                "identifiers": db_event.identifiers,
                "customer_id": db_event.customer_id,
                "properties": db_event.properties,
                "created_at": db_event.created_at.isoformat()
            })
            JSONFallbackStore.save("sample_events.json", events_list)
        except Exception as e:
            logger.error(f"Could not backup event to JSON fallback: {e}")

        return db_event

    def get_events_by_customer(self, customer_id: str) -> List[EventModel]:
        """
        Fetch historical events belonging to a resolved customer ID.
        """
        return (
            self.db.query(EventModel)
            .filter(EventModel.customer_id == customer_id)
            .order_by(EventModel.timestamp.desc())
            .all()
        )

    def get_recent_events(self, limit: int = 100) -> List[EventModel]:
        """
        Fetch most recent events globally.
        """
        return (
            self.db.query(EventModel)
            .order_by(EventModel.timestamp.desc())
            .limit(limit)
            .all()
        )

    def update_resolved_customer(self, event_id: str, customer_id: str) -> Optional[EventModel]:
        """
        Post-updates the customer_id associated with a specific event_id.
        """
        db_event = self.db.query(EventModel).filter(EventModel.event_id == event_id).first()
        if db_event:
            db_event.customer_id = customer_id
            self.db.commit()
            self.db.refresh(db_event)
            return db_event
        return None
