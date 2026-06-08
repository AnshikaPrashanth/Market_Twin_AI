from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from app.schemas.twin_schema import TwinStateResponse

class EventIngestionResponse(BaseModel):
    status: str = "processed"
    event_id: str
    event_type: str
    source: str
    customer_id: str
    timestamp: str
    updated_twin: TwinStateResponse
    nba_decision: Optional[Dict[str, Any]] = None
    final_action: Optional[str] = None
    final_channel: Optional[str] = None
    consent_gate_applied: Optional[bool] = None
    generated_message: Optional[Dict[str, Any]] = None
    identity_resolution: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="allow")
