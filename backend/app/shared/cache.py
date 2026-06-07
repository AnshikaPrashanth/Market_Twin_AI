from typing import Any, Optional, Dict
from app.core.logger import logger

class CacheProvider:
    """
    Unified Cache Provider abstraction. By default, it operates as an in-memory
    dictionary. This is ready to be swapped with Redis for clustering or distributed nodes.
    """
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        logger.info("Initialized In-Memory Cache Provider (Redis-ready wrapper)")

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieves a value from the cache.
        """
        return self._cache.get(key)

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Sets a value in the cache. TTL is accepted as a placeholder for Redis integration.
        """
        self._cache[key] = value

    def delete(self, key: str) -> None:
        """
        Removes a key from the cache.
        """
        if key in self._cache:
            del self._cache[key]

    def clear(self) -> None:
        """
        Wipes all entries from the cache.
        """
        self._cache.clear()

# Global cache singleton
cache = CacheProvider()
