from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class TwinStateResponse(BaseModel):
    customer_id: str
    journey_stage: str
    intent_score: int
    churn_risk: int
    fatigue_score: int
    conversion_probability: int
    segment: str
    preferred_channel: Optional[str] = None
    next_best_action: Optional[str] = None
    raw_counters: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime

    class Config:
        from_attributes = True
