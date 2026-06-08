from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.dependencies import get_event_service
from app.services.event_service.event_service import EventService
from app.schemas.response_schema import EventIngestionResponse
from app.core.logger import logger
from app.models.event_model import EventModel
from app.models.twin_model import TwinModel
from app.models.identity_model import IdentityLinkModel
from sqlalchemy import text

router = APIRouter()

@router.post("/event", response_model=EventIngestionResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(raw_event: dict, service: EventService = Depends(get_event_service)):
    """
    Primary ingestion endpoint. Processes incoming customer actions, merges identities,
    triggers behavioral updates, and outputs the updated digital twin.
    """
    logger.info("POST /api/event ingestion endpoint called.")
    response = await service.process_event(raw_event)
    return response

@router.post("/demo/reset")
async def reset_demo(db: Session = Depends(get_db)):
    """
    Safely resets the demo customer session data (associated with device_id: 'D88').
    """
    from app.services.twin_service.twin_store import TwinStore
    from app.schemas.twin_schema import TwinStateResponse

    logger.info("POST /api/demo/reset called.")
    try:
        identity = db.query(IdentityLinkModel).filter(IdentityLinkModel.identifier_value == 'D88').first()
        if identity:
            customer_id = identity.customer_id
            # Delete events
            db.query(EventModel).filter(EventModel.customer_id == customer_id).delete()
            
            # Reset Twin
            twin_store = TwinStore(db)
            reset_twin = twin_store.reset_twin_to_default(customer_id)
            
            # Set default preferred channel
            if reset_twin:
                reset_twin.preferred_channel = "email"
            
            # Clear latest message
            from app.services.message_service import MessageService
            MessageService.clear_message(customer_id)

            # Clear cart
            from app.services.cart_service import CartService
            reset_cart = CartService.reset_cart(customer_id)
            
            db.commit()
            
            return {
                "status": "reset", 
                "customer": {
                    "customer_id": "CUST_DEMO_001",
                    "name": "Rahul Sharma",
                    "device_id": "D88",
                    "email_hash": "E991",
                    "phone_hash": "P554",
                    "loyalty_id": "L230"
                },
                "twin": TwinStateResponse.model_validate(reset_twin).model_dump() if reset_twin else None,
                "cart": reset_cart
            }
            
        return {"status": "success", "message": "No demo data found to clear."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reset demo: {e}")
        return {"status": "error", "message": str(e)}
