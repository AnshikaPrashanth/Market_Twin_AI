from app.core.constants import VALID_EVENTS
from app.schemas.event_schema import EventCreate
from typing import Tuple

class EventValidator:
    """
    Validates incoming event payloads to ensure they meet the structural
    and business requirements of the ingestion layer.
    """
    @staticmethod
    def validate(event: EventCreate) -> Tuple[bool, str]:
        """
        Validates event properties.
        Returns a tuple of (is_valid: bool, error_reason: str).
        """
        # 1. Validate Event Type
        if event.event_type not in VALID_EVENTS:
            return False, f"Invalid event_type '{event.event_type}'. Must be one of {VALID_EVENTS}"
            
        # 2. Validate Source
        if not event.source or not isinstance(event.source, str) or not event.source.strip():
            return False, "Source is required and must be a non-empty string."
            
        # 3. Validate Identifiers
        ids = event.identifiers
        if not ids:
            return False, "Identifiers model is required."
            
        # Check that at least one identifier has a non-empty value
        has_identifier = any([
            ids.device_id and ids.device_id.strip(),
            ids.email_hash and ids.email_hash.strip(),
            ids.phone_hash and ids.phone_hash.strip(),
            ids.cookie_id and ids.cookie_id.strip(),
            ids.loyalty_id and ids.loyalty_id.strip()
        ])
        
        if not has_identifier:
            return False, "At least one identifier (device_id, email_hash, phone_hash, cookie_id, or loyalty_id) must be provided."
            
        return True, ""
