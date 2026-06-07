import asyncio
from typing import Callable, Dict, List, Any
from app.core.logger import logger

class EventBus:
    """
    In-memory asynchronous event bus to handle internal service decoupling.
    Allows modules to subscribe to topics (like 'event_ingested', 'twin_updated')
    and execute tasks concurrently.
    """
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, topic: str, callback: Callable) -> None:
        """
        Subscribes a callable (sync or async) to a topic.
        """
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(callback)
        logger.info(f"Subscribed handler {callback.__name__} to topic: {topic}")

    async def publish(self, topic: str, data: Any) -> None:
        """
        Publishes data to all topic subscribers asynchronously.
        """
        if topic not in self._subscribers:
            return
        
        logger.debug(f"Publishing to topic '{topic}': {data}")
        tasks = []
        for callback in self._subscribers[topic]:
            try:
                if asyncio.iscoroutinefunction(callback):
                    tasks.append(asyncio.create_task(callback(data)))
                else:
                    # Execute synchronous handler inside the default executor
                    loop = asyncio.get_running_loop()
                    tasks.append(loop.run_in_executor(None, callback, data))
            except RuntimeError:
                # In case there's no running event loop (e.g. during some direct sync tests)
                try:
                    callback(data)
                except Exception as e:
                    logger.error(f"Error in sync callback {callback.__name__} (no running loop): {e}")

        if tasks:
            # Gather tasks and log any exceptions that occurred
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, Exception):
                    logger.error(f"Error executing callback on topic '{topic}': {res}", exc_info=res)

# Global singleton event bus
event_bus = EventBus()
