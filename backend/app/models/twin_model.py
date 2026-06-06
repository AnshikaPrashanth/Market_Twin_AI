from sqlalchemy import Column, String, Integer, DateTime, JSON
from datetime import datetime, timezone
from app.database.db import Base

class TwinModel(Base):
    __tablename__ = "twins"

    customer_id = Column(String, primary_key=True, index=True)
    journey_stage = Column(String, nullable=False, default="anonymous")
    intent_score = Column(Integer, nullable=False, default=0)
    churn_risk = Column(Integer, nullable=False, default=0)
    fatigue_score = Column(Integer, nullable=False, default=0)
    conversion_probability = Column(Integer, nullable=False, default=0)
    segment = Column(String, nullable=False, default="Standard Customer")
    preferred_channel = Column(String, nullable=True)
    next_best_action = Column(String, nullable=True)
    # Map storing metrics like:
    # {"views": 0, "carts": 0, "purchases": 0, "ignored_messages": 0, "messages_last_48h": 0, "clicks_last_48h": 0, ...}
    raw_counters = Column(JSON, nullable=False, default=dict)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
