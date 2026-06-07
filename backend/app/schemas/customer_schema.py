from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CustomerProfileBase(BaseModel):
    city: Optional[str] = None
    device_type: Optional[str] = None
    active_hours: List[int] = Field(default_factory=list)
    preferred_categories: List[str] = Field(default_factory=list)

class CustomerProfileCreate(CustomerProfileBase):
    customer_id: str

class CustomerProfileResponse(CustomerProfileBase):
    customer_id: str
    created_at: datetime

    class Config:
        from_attributes = True
