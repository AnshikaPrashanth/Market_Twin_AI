from typing import Optional
from app.services.identity_service.identity_store import IdentityStore
from app.schemas.event_schema import EventIdentifiers
from app.core.logger import logger

class DeterministicMatcher:
    """
    Checks incoming non-empty identifiers for exact match lookups
    in the identities mapping table.
    """
    def __init__(self, store: IdentityStore):
        self.store = store

    def deterministic_match(self, identifiers: EventIdentifiers) -> Optional[dict]:
        """
        Performs sequential lookups on available identifiers.
        Returns matching details if a link exists, otherwise None.
        """
        # Dictionary of fields to inspect
        id_fields = {
            "email_hash": identifiers.email_hash,
            "phone_hash": identifiers.phone_hash,
            "device_id": identifiers.device_id,
            "cookie_id": identifiers.cookie_id,
            "loyalty_id": identifiers.loyalty_id
        }

        for id_type, id_val in id_fields.items():
            if id_val and id_val.strip():
                logger.debug(f"Performing exact deterministic lookup for '{id_type}': {id_val}")
                customer_id = self.store.get_customer_by_identifier(id_type, id_val)
                if customer_id:
                    logger.info(f"Deterministic link resolved: '{id_type}' matched customer '{customer_id}'")
                    return {
                        "customer_id": customer_id,
                        "matched_by": id_type,
                        "confidence": 100
                    }
        return None
