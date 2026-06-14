from typing import Dict, List, Optional
from app.services.identity_service.identity_store import IdentityStore
from app.core.logger import logger

class ConflictDetector:
    """
    Detects if attempting to map an event to a customer profile would cause
    a collision of strong identifiers (e.g. merging two different real people
    just because they used the same device).
    """
    def __init__(self, store: IdentityStore):
        self.store = store

    def has_conflicting_strong_identifier(self, new_identifiers: dict, existing_customer_id: str) -> bool:
        """
        Returns True if new_identifiers contains a strong identifier that 
        differs from the strong identifiers already attached to existing_customer_id.
        """
        strong_types = ["email", "phone", "login_id", "email_hash", "phone_hash", "loyalty_id"]
        
        # Get all identifiers currently linked to this customer
        existing_links = self.store.get_all_identifiers_for_customer(existing_customer_id)
        
        # Build a map of their existing strong identifiers
        existing_strong = {
            link.identifier_type: link.identifier_value 
            for link in existing_links 
            if link.identifier_type in strong_types
        }
        
        for id_type, id_val in new_identifiers.items():
            if not id_val or not str(id_val).strip():
                continue
            if id_type in strong_types:
                # If the customer already has this type of strong identifier and it's DIFFERENT, it's a conflict
                if id_type in existing_strong and existing_strong[id_type] != id_val:
                    logger.warning(
                        f"[Conflict Detector] Conflict found! Existing {id_type}='{existing_strong[id_type]}', "
                        f"New {id_type}='{id_val}'. Preventing merge."
                    )
                    return True
                    
        return False
