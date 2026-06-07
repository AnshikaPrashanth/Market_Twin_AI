from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime, timezone
from app.database.db import Base

class EventModel(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)
    source = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    identifiers = Column(JSON, nullable=False)  # Map: {"device_id": "DEV_88", ...}
    customer_id = Column(String, index=True, nullable=True)  # Resolved Customer ID
    properties = Column(JSON, nullable=False)  # Custom properties payload
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
