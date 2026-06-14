import asyncio
from app.database.session import SessionLocal
from app.services.event_service.event_service import EventService

async def main():
    db = SessionLocal()
    svc = EventService(db)
    
    event = {
        "event_type": "cart_abandoned",
        "source": "website",
        "identifiers": {"device_id": "TEST_D"},
        "properties": {"product_id": "P123", "product_name": "Test Product", "price": 99.99}
    }
    
    res = await svc.process_event(event)
    print("NBA RESULT:")
    print(res.nba_decision)
    print("FINAL ACTION:")
    print(res.final_action)
    print("FINAL CHANNEL:")
    print(res.final_channel)
    print("GENERATED MSG:")
    print(res.generated_message)

if __name__ == "__main__":
    asyncio.run(main())
