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
            # For demo purposes, we will clear ALL events and twins.
            db.query(EventModel).delete()
            
            # Reset Twins
            twin_store = TwinStore(db)
            db.query(TwinModel).delete()
            
            # Clear all messages
            from app.services.message_service import MessageService
            MessageService._latest_messages.clear()

            # Clear carts
            from app.services.cart_service import CartService
            CartService.carts.clear()
            
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
                "twin": None,
                "cart": {"items": [], "cart_value": 0, "status": "active"}
            }
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reset demo: {e}")
        return {"status": "error", "message": str(e)}
