from sqlalchemy import Column, String, DateTime, JSON, Integer
from datetime import datetime, timezone
from app.database.db import Base

class CustomerModel(Base):
    __tablename__ = "customer_profiles"

    customer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    password = Column(String, nullable=True)
    email_hash = Column(String, nullable=True)
    phone_hash = Column(String, nullable=True)
    loyalty_id = Column(String, nullable=True)
    city = Column(String, nullable=True)
    device_type = Column(String, nullable=True)
    active_hours = Column(JSON, nullable=True)  # List of hours: [9, 14, 21]
    preferred_categories = Column(JSON, nullable=True)  # List of categories: ["Headphones", "Laptops"]
    consent = Column(JSON, nullable=True) # e.g. {"email": True, "whatsapp": True, "push": False}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, nullable=True)
    profile_confidence = Column(Integer, default=100)
    status = Column(String, default="active")
