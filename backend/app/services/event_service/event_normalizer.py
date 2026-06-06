import re
from app.schemas.event_schema import EventCreate, EventIdentifiers
from app.core.utils import hash_identifier, generate_event_id, get_current_utc_time
from app.core.logger import logger

class EventNormalizer:
    """
    Standardizes event fields and values across multiple input formats
    (e.g., mapping 'type' to 'event_type', 'item' to 'product_id', and
    converting raw email/phone variables to privacy-safe hashes).
    """
    SHA256_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")

    @classmethod
    def _is_sha256(cls, val: str) -> bool:
        return bool(cls.SHA256_REGEX.match(val))

    @classmethod
    def normalize(cls, raw_data: dict) -> EventCreate:
        """
        Maps a loose raw dictionary representation of an event into the
        standardized EventCreate Pydantic schema.
        """
        logger.debug(f"Normalizing raw event: {raw_data}")

        # 1. Normalize Event Type
        event_type = raw_data.get("event_type") or raw_data.get("type") or "session_start"
        type_mapping = {
            "view": "product_view",
            "product-view": "product_view",
            "add": "add_to_cart",
            "cart": "add_to_cart",
            "remove": "remove_from_cart",
            "checkout": "purchase",
            "buy": "purchase",
            "abandon": "cart_abandon",
            "click": "banner_click"
        }
        event_type = type_mapping.get(event_type.lower(), event_type)

        # 2. Extract and Normalize Identifiers
        ids_dict = raw_data.get("identifiers") or {}
        device_id = ids_dict.get("device_id") or raw_data.get("device_id") or raw_data.get("device")
        email = ids_dict.get("email_hash") or raw_data.get("email") or raw_data.get("mail")
        phone = ids_dict.get("phone_hash") or raw_data.get("phone") or raw_data.get("mobile")
        cookie_id = ids_dict.get("cookie_id") or raw_data.get("cookie")
        loyalty_id = ids_dict.get("loyalty_id") or raw_data.get("loyalty")

        # Automate privacy hashing for raw inputs
        if email and not cls._is_sha256(email):
            email = hash_identifier(email)
        if phone and not cls._is_sha256(phone):
            phone = hash_identifier(phone)

        identifiers = EventIdentifiers(
            device_id=device_id,
            email_hash=email,
            phone_hash=phone,
            cookie_id=cookie_id,
            loyalty_id=loyalty_id
        )

        # 3. Standardize properties
        properties = raw_data.get("properties") or {}
        if not properties:
            # Flatten top level keys that are not core attributes into properties
            core_keys = {
                "event_id", "event_type", "type", "source", "timestamp",
                "identifiers", "device_id", "device", "email", "mail",
                "phone", "mobile", "cookie", "loyalty", "customer_id"
            }
            properties = {k: v for k, v in raw_data.items() if k not in core_keys}

        normalized_props = {}
        for k, v in properties.items():
            if k in ("item", "product"):
                normalized_props["product_id"] = v
            elif k in ("cost", "val"):
                normalized_props["price"] = v
            else:
                normalized_props[k] = v

        # 4. Finalize IDs and Timestamps
        event_id = raw_data.get("event_id") or generate_event_id()
        source = raw_data.get("source") or "unknown"
        
        timestamp = raw_data.get("timestamp")
        if not timestamp:
            timestamp = get_current_utc_time()
        elif isinstance(timestamp, str):
            from app.core.utils import parse_iso_datetime
            timestamp = parse_iso_datetime(timestamp)

        return EventCreate(
            event_id=event_id,
            event_type=event_type,
            source=source,
            timestamp=timestamp,
            identifiers=identifiers,
            customer_id=raw_data.get("customer_id"),
            properties=normalized_props
        )
