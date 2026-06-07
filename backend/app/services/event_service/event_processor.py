from app.shared.event_bus import event_bus
from app.core.logger import logger

class EventProcessor:
    """
    Listens to in-memory Event Bus messages to handle asynchronous
    side-effects (e.g., triggering campaign actions, push alerts, or webhooks).
    """
    def __init__(self):
        # Subscribe methods to event bus topics
        event_bus.subscribe("event_ingested", self.on_event_ingested)
        event_bus.subscribe("twin_updated", self.on_twin_updated)
        logger.info("EventProcessor registered listeners on the Event Bus.")

    async def on_event_ingested(self, data: dict) -> None:
        """
        Triggered when a new event has been successfully saved to store.
        """
        logger.info(
            f"[Event Bus Listener] Ingested Event '{data.get('event_id')}' "
            f"of type '{data.get('event_type')}' for customer '{data.get('customer_id')}'."
        )

    async def on_twin_updated(self, data: dict) -> None:
        """
        Triggered when a digital twin state is recalculated and saved.
        """
        logger.info(
            f"[Event Bus Listener] Twin updated for '{data.get('customer_id')}'. "
            f"Stage: '{data.get('journey_stage')}', Intent: {data.get('intent_score')}, "
            f"Churn: {data.get('churn_risk')}, Fatigue: {data.get('fatigue_score')}, "
            f"Segment: '{data.get('segment')}'. Action: '{data.get('next_best_action')}'."
        )

# Instantiate to register subscriptions during import
event_processor = EventProcessor()
