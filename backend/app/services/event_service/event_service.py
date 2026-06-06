import asyncio
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.event_schema import EventCreate
from app.schemas.response_schema import EventIngestionResponse
from app.services.event_service.event_validator import EventValidator
from app.services.event_service.event_normalizer import EventNormalizer
from app.services.event_service.event_store import EventStore
from app.services.identity_service.identity_service import IdentityService
from app.services.twin_service.twin_service import TwinService
from app.shared.event_bus import event_bus
from app.core.logger import logger

class EventService:
    """
    Main ingestion engine orchestrating the customer event ingestion stream.
    Applies validation rules, maps identifiers to a single customer identity,
    records transactions, and re-computes behavioral state parameters on a digital twin.
    """
    def __init__(self, db: Session):
        self.db = db
        self.validator = EventValidator()
        self.normalizer = EventNormalizer()
        self.store = EventStore(db)
        self.identity_service = IdentityService(db)
        self.twin_service = TwinService(db)

    async def process_event(self, raw_event: dict) -> EventIngestionResponse:
        """
        Orchestrates event processing flow:
        1. Validate event structure & fields.
        2. Normalize fields (types, aliases, and unhashed privacy identifiers).
        3. Persist raw event record in SQLite DB.
        4. Resolve customer ID via Identity Resolution Service.
        5. Map customer ID back to event store record.
        6. Apply event impact to Digital Twin Service state.
        7. Broadcast transaction asynchronously to active listeners.
        8. Return the processed state and digital twin payload.
        """
        logger.info(f"Ingesting raw event stream: {raw_event.get('event_id') or 'NEW'}")

        # 1. Normalize Event Payload
        try:
            normalized_event = self.normalizer.normalize(raw_event)
        except Exception as e:
            logger.error(f"Event normalization error: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to normalize event payload: {str(e)}"
            )

        # 2. Validate Normalized Event
        is_valid, error_msg = self.validator.validate(normalized_event)
        if not is_valid:
            logger.warning(f"Event validation failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Event validation failed: {error_msg}"
            )

        # 3. Save Raw Event Record
        db_event = self.store.save_event(normalized_event)

        # 4. Resolve Fragmented Identity Mapping
        identity_response = self.identity_service.resolve_customer(normalized_event)
        customer_id = identity_response["customer_id"]

        # 5. Link Customer ID to Event
        self.store.update_resolved_customer(db_event.event_id, customer_id)

        # 6. Apply behavioral metrics to Digital Twin
        updated_twin = self.twin_service.update_twin(customer_id, db_event)

        # 7. Asynchronously trigger side-effect callbacks
        event_dict = {
            "event_id": db_event.event_id,
            "event_type": db_event.event_type,
            "customer_id": customer_id,
            "properties": db_event.properties,
            "timestamp": db_event.timestamp.isoformat()
        }
        twin_dict = {
            "customer_id": customer_id,
            "journey_stage": updated_twin.journey_stage,
            "intent_score": updated_twin.intent_score,
            "churn_risk": updated_twin.churn_risk,
            "fatigue_score": updated_twin.fatigue_score,
            "segment": updated_twin.segment,
            "next_best_action": updated_twin.next_best_action
        }
        asyncio.create_task(event_bus.publish("event_ingested", event_dict))
        asyncio.create_task(event_bus.publish("twin_updated", twin_dict))

        # 8. Compile and return response
        from app.schemas.twin_schema import TwinStateResponse
        return EventIngestionResponse(
            status="processed",
            event_id=db_event.event_id,
            customer_id=customer_id,
            updated_twin=TwinStateResponse.model_validate(updated_twin)
        )
