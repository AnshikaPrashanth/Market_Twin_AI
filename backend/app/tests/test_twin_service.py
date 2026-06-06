import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.db import Base
from app.models.event_model import EventModel
from app.services.twin_service.twin_service import TwinService

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

def test_twin_scoring_and_transitions(db_session):
    service = TwinService(db_session)
    customer_id = "CUST_TEST"

    # 1. Dispatch Product View Event
    event1 = EventModel(
        event_id="EVT_1",
        event_type="product_view",
        source="website",
        timestamp=datetime.now(timezone.utc),
        identifiers={"device_id": "DEV_88"},
        customer_id=customer_id,
        properties={"product_id": "P101", "category": "Headphones"}
    )
    twin = service.update_twin(customer_id, event1)
    # views=1 (3 pts) + recent_activity=1 (15 pts) = 18 pts
    assert twin.intent_score == 18
    assert twin.journey_stage == "browsing"
    assert twin.segment == "Standard Customer"
    assert twin.next_best_action == "recommend_popular_products"

    # 2. Dispatch Cart Add Event
    event2 = EventModel(
        event_id="EVT_2",
        event_type="add_to_cart",
        source="website",
        timestamp=datetime.now(timezone.utc),
        identifiers={"device_id": "DEV_88"},
        customer_id=customer_id,
        properties={"product_id": "P101"}
    )
    twin = service.update_twin(customer_id, event2)
    # views=1 (3) + carts=1 (20) + recent_activity=1 (15) = 38 pts
    assert twin.intent_score == 38
    assert twin.journey_stage == "cart_active"
    assert twin.next_best_action == "recommend_checkout"

    # 3. Dispatch Cart Abandon Event
    event3 = EventModel(
        event_id="EVT_3",
        event_type="cart_abandon",
        source="website",
        timestamp=datetime.now(timezone.utc),
        identifiers={"device_id": "DEV_88"},
        customer_id=customer_id,
        properties={}
    )
    twin = service.update_twin(customer_id, event3)
    assert twin.journey_stage == "cart_abandoned"

    # 4. Dispatch Email Sent Event (marketing contact) -> increases fatigue
    event4 = EventModel(
        event_id="EVT_4",
        event_type="email_sent",
        source="marketing_agent",
        timestamp=datetime.now(timezone.utc),
        identifiers={"device_id": "DEV_88"},
        customer_id=customer_id,
        properties={}
    )
    twin = service.update_twin(customer_id, event4)
    # messages_last_48h = 1 (20 pts) - clicks = 0 = 20 pts
    assert twin.fatigue_score == 20

    # 5. Dispatch Purchase Event -> increments spent and transitions segment
    event5 = EventModel(
        event_id="EVT_5",
        event_type="purchase",
        source="website",
        timestamp=datetime.now(timezone.utc),
        identifiers={"device_id": "DEV_88"},
        customer_id=customer_id,
        properties={"price": 25000.0}
    )
    twin = service.update_twin(customer_id, event5)
    assert twin.journey_stage == "converted"
    assert twin.segment == "Premium Loyalist"
    assert twin.next_best_action == "invite_to_vip_club"
