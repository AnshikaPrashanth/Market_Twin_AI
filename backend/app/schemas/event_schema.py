from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class EventIdentifiers(BaseModel):
    device_id: Optional[str] = None
    email_hash: Optional[str] = None
    phone_hash: Optional[str] = None
    cookie_id: Optional[str] = None
    loyalty_id: Optional[str] = None

class EventCreate(BaseModel):
    event_id: Optional[str] = None
    event_type: str
    source: str
    timestamp: Optional[datetime] = None
    identifiers: EventIdentifiers
    customer_id: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class EventResponse(BaseModel):
    event_id: str
    event_type: str
    source: str
    timestamp: datetime
    identifiers: EventIdentifiers
    customer_id: Optional[str] = None
    properties: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
