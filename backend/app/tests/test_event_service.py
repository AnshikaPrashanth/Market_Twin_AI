import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.db import Base
from app.services.event_service.event_validator import EventValidator
from app.services.event_service.event_normalizer import EventNormalizer
from app.services.event_service.event_service import EventService
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

def test_event_validation():
    # Valid payload
    event = EventCreate(
        event_type="product_view",
        source="website",
        identifiers=EventIdentifiers(device_id="DEV_88"),
        properties={"product_id": "P101"}
    )
    is_valid, err = EventValidator.validate(event)
    assert is_valid is True
    assert err == ""

    # Invalid Action Type
    invalid_type = EventCreate(
        event_type="add_to_wishlist",  # Not in VALID_EVENTS
        source="website",
        identifiers=EventIdentifiers(device_id="DEV_88"),
        properties={}
    )
    is_valid, err = EventValidator.validate(invalid_type)
    assert is_valid is False
    assert "Invalid event_type" in err

    # Empty Identifiers
    invalid_ids = EventCreate(
        event_type="product_view",
        source="website",
        identifiers=EventIdentifiers(),
        properties={}
    )
    is_valid, err = EventValidator.validate(invalid_ids)
    assert is_valid is False
    assert "At least one identifier" in err

def test_event_normalization():
    raw_payload = {
        "type": "view",
        "device": "DEV_88",
        "email": "John.Doe@Gmail.com",
        "item": "P101",
        "cost": 1500
    }
    normalized = EventNormalizer.normalize(raw_payload)
    
    assert normalized.event_type == "product_view"
    assert normalized.identifiers.device_id == "DEV_88"
    # Verify SHA256 hashing for emails
    expected_hash = "375320dd9ae7ed408002f3768e16cb5f28c861062fd50dff9a3bff62e9dce4ef"
    assert normalized.identifiers.email_hash == expected_hash
    assert normalized.properties.get("product_id") == "P101"
    assert normalized.properties.get("price") == 1500

@pytest.mark.asyncio
async def test_event_processing_flow(db_session):
    service = EventService(db_session)
    raw_event = {
        "event_type": "add_to_cart",
        "source": "website",
        "device_id": "DEV_NEW",
        "item": "P202",
        "price": 3000
    }
    
    response = await service.process_event(raw_event)
    assert response.status == "processed"
    assert response.customer_id is not None
    assert response.updated_twin.intent_score == 35  # carts*20 + recent_activity*15 = 35
    assert response.updated_twin.journey_stage == "cart_active"
