from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import get_db
from app.services.message_service import MessageService
from app.api.dependencies import get_event_service
from app.services.event_service.event_service import EventService
from app.core.logger import logger

router = APIRouter()

class ReactionRequest(BaseModel):
    customer_id: str
    reaction: str

@router.get("/latest/{customer_id}")
async def get_latest_message(customer_id: str):
    message = MessageService.get_latest_message(customer_id)
    return {
        "customer_id": customer_id,
        "generated_message": message
    }

@router.get("/history/{customer_id}")
async def get_message_history(customer_id: str):
    history = MessageService.get_message_history(customer_id)
    return {
        "customer_id": customer_id,
        "history": history
    }

@router.post("/react")
async def react_to_message(request: ReactionRequest, db: Session = Depends(get_db), event_service: EventService = Depends(get_event_service)):
    message = MessageService.get_latest_message(request.customer_id)
    if not message:
        raise HTTPException(status_code=404, detail="No latest message found to react to.")
        
    channel = message.get("channel")
    if not channel:
        raise HTTPException(status_code=400, detail="Latest message has no channel.")
        
    event_type = ""
    source = channel
    
    if request.reaction == "clicked":
        if channel == "email":
            event_type = "email_click"
        elif channel == "whatsapp":
            event_type = "whatsapp_click"
        elif channel == "push":
            event_type = "push_click"
        elif channel == "sms":
            event_type = "sms_click"
        elif channel == "website":
            event_type = "banner_click"
    elif request.reaction == "ignored":
        event_type = "session_end"
    elif request.reaction == "unsubscribed":
        event_type = "unsubscribe"
    elif request.reaction == "purchased":
        event_type = "purchase"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported reaction: {request.reaction}")
        
    from app.models.identity_model import IdentityLinkModel
    identity = db.query(IdentityLinkModel).filter(IdentityLinkModel.customer_id == request.customer_id).first()
    identifiers = {}
    if identity:
        identifiers[identity.identifier_type] = identity.identifier_value
        
    if not identifiers:
        identifiers = {"device_id": "D88"}

    # Construct an event to send to the ingestion pipeline
    raw_event = {
        "event_type": event_type,
        "source": source,
        "customer_id": request.customer_id,
        "identifiers": identifiers,
        "properties": {}
    }
    
    logger.info(f"Processing reaction {request.reaction} as event {event_type} for {request.customer_id}. Identifiers: {identifiers}")
    result = await event_service.process_event(raw_event)
    return {"status": "success", "event_result": result}
