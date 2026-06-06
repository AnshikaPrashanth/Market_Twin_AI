from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database.db import Base

class IdentityLinkModel(Base):
    __tablename__ = "identities"

    id = Column(Integer, primary_key=True, index=True)
    identifier_type = Column(String, index=True, nullable=False)  # e.g., "device_id", "email_hash"
    identifier_value = Column(String, index=True, nullable=False)  # e.g., "DEV_88"
    customer_id = Column(String, index=True, nullable=False)  # Resolved CUST_XXX
    confidence_score = Column(Integer, nullable=False, default=100)  # 100 for deterministic
    matched_by = Column(String, nullable=False)  # e.g., "deterministic_email", "probabilistic_city"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
