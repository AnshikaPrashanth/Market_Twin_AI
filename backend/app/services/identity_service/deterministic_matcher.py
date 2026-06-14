from typing import Optional
from app.services.identity_service.identity_store import IdentityStore
from app.schemas.event_schema import EventIdentifiers
from app.core.logger import logger

class DeterministicMatcher:
    """
    Checks incoming non-empty identifiers for exact match lookups
    in the identities mapping table. Obeys identifier trust priority.
    """
    def __init__(self, store: IdentityStore):
        self.store = store

    def deterministic_match(self, identifiers: EventIdentifiers) -> Optional[dict]:
        """
        Performs sequential lookups on available identifiers based on priority.
        Returns matching details if a link exists, otherwise None.
        Priority: email (100) > phone (95) > login_id (90) > device_id (60) > cookie_id (50) > browser_id (40)
        """
        # Ordered by priority
        id_priority = [
            ("email", identifiers.email or identifiers.email_hash, 100),
            ("phone", identifiers.phone or identifiers.phone_hash, 95),
            ("login_id", identifiers.login_id or identifiers.loyalty_id, 90),
            ("device_id", identifiers.device_id, 60),
            ("cookie_id", identifiers.cookie_id, 50),
            ("browser_id", identifiers.browser_id, 40)
        ]

        for id_type, id_val, confidence in id_priority:
            if id_val and id_val.strip():
                logger.debug(f"Performing exact deterministic lookup for '{id_type}': {id_val}")
                customer_id = self.store.get_customer_by_identifier(id_type, id_val)
                if customer_id:
                    logger.info(f"Deterministic link resolved: '{id_type}' matched customer '{customer_id}'")
                    return {
                        "customer_id": customer_id,
                        "matched_by": f"deterministic_{id_type}",
                        "confidence": confidence,
                        "resolution_type": "deterministic"
                    }
        return None
