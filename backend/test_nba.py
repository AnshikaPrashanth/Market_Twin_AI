import asyncio
from app.database.session import SessionLocal
from app.services.event_service.event_service import EventService
from app.services.message_service import MessageService
import sys

async def main():
    db = SessionLocal()
    event_service = EventService(db)
    event = {
        "event_type": "cart_abandoned",
        "customer_id": "test_customer",
        "source": "website",
        "properties": {"product_name": "Test Product"}
    }
    res = await event_service.process_event(event)
    print("Event Processed:")
    print("Action:", res.final_action)
    print("Channel:", res.final_channel)
    print("Generated Message in Response:", res.generated_message)
    print("Saved Message:", MessageService.get_latest_message("test_customer"))

if __name__ == "__main__":
    asyncio.run(main())
