from pydantic import BaseModel
from typing import Optional
from app.schemas.twin_schema import TwinStateResponse

class EventIngestionResponse(BaseModel):
    status: str = "processed"
    event_id: str
    customer_id: str
    updated_twin: TwinStateResponse
