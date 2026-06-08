from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CustomerProfileBase(BaseModel):
    name: Optional[str] = None
    email_hash: Optional[str] = None
    phone_hash: Optional[str] = None
    loyalty_id: Optional[str] = None
    city: Optional[str] = None
    device_type: Optional[str] = None
    active_hours: List[int] = Field(default_factory=list)
    preferred_categories: List[str] = Field(default_factory=list)
    consent: Optional[dict] = None

class CustomerProfileCreate(CustomerProfileBase):
    customer_id: str
    password: Optional[str] = None

class CustomerRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    city: str
    consent: dict
    device_id: str

class CustomerLogin(BaseModel):
    identifier: str  # email or phone
    password: str

class CustomerProfileResponse(CustomerProfileBase):
    customer_id: str
    created_at: datetime

    class Config:
        from_attributes = True
