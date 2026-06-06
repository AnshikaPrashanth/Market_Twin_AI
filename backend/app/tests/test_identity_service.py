import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.db import Base
from app.services.identity_service.identity_service import IdentityService
from app.schemas.event_schema import EventCreate, EventIdentifiers

# Setup in-memory database for testing isolation
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_deterministic_matching(db_session):
    service = IdentityService(db_session)
    
    # Bind an identifier
    service.store.create_identity_link("device_id", "DEV_88", "CUST_001")
    
    # Send event containing that identifier
    event = EventCreate(
        event_type="product_view",
        source="website",
        identifiers=EventIdentifiers(device_id="DEV_88")
    )
    
    res = service.resolve_customer(event)
    assert res["customer_id"] == "CUST_001"
    assert res["matched_by"] == "device_id"
    assert res["confidence"] == 100

def test_probabilistic_matching(db_session):
    service = IdentityService(db_session)
    
    # Create profile with known context variables
    service.store.save_customer_profile(
        customer_id="CUST_001",
        city="Mumbai",
        device_type="Mobile",
        active_hours=[9, 10],
        preferred_categories=["Headphones"]
    )
    
    # Send event containing matching context but a NEW device_id
    event = EventCreate(
        event_type="product_view",
        source="website",
        identifiers=EventIdentifiers(device_id="DEV_NEW"),
        properties={
            "city": "Mumbai",
            "device_type": "Mobile",
            "category": "Headphones"
        }
    )
    event.timestamp = datetime(2026, 6, 6, 9, 0, 0, tzinfo=timezone.utc)
    
    res = service.resolve_customer(event)
    assert res["customer_id"] == "CUST_001"
    assert "probabilistic" in res["matched_by"]
    assert res["confidence"] >= 70

def test_identity_merging(db_session):
    service = IdentityService(db_session)
    
    # Bind identifiers to two separate customers
    service.store.create_identity_link("device_id", "DEV_A", "CUST_A")
    service.store.create_identity_link("email_hash", "EMAIL_B", "CUST_B")
    
    # Send event containing BOTH identifiers (DEV_A resolves CUST_A, EMAIL_B triggers merge of CUST_B to CUST_A)
    event = EventCreate(
        event_type="product_view",
        source="website",
        identifiers=EventIdentifiers(device_id="DEV_A", email_hash="EMAIL_B")
    )
    
    res = service.resolve_customer(event)
    assert res["customer_id"] == "CUST_B"
    
    # Verify that DEV_A has been merged and re-linked to CUST_B
    resolved_owner = service.store.get_customer_by_identifier("device_id", "DEV_A")
    assert resolved_owner == "CUST_B"
