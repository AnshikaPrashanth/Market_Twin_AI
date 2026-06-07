from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
from app.database.db import Base

class CustomerModel(Base):
    __tablename__ = "customer_profiles"

    customer_id = Column(String, primary_key=True, index=True)
    city = Column(String, nullable=True)
    device_type = Column(String, nullable=True)
    active_hours = Column(JSON, nullable=True)  # List of hours: [9, 14, 21]
    preferred_categories = Column(JSON, nullable=True)  # List of categories: ["Headphones", "Laptops"]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
