from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.creative_service import CreativeEngine

router = APIRouter()
engine = CreativeEngine()

class CreativeRequest(BaseModel):
    customer_id: str
    action: str
    channel: str
    properties: Optional[Dict[str, Any]] = None

@router.post("/generate")
def generate_creative(request: CreativeRequest):
    message = engine.generate(
        customer_id=request.customer_id,
        action=request.action,
        channel=request.channel,
        properties=request.properties
    )
    return {"generated_message": message}
