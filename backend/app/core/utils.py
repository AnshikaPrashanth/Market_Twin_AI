import hashlib
import uuid
from datetime import datetime, timezone

def hash_identifier(value: str) -> str:
    """
    Computes a SHA-256 hash of a string identifier (e.g., email or phone)
    to maintain privacy and consistent matching.
    """
    if not value:
        return ""
    # Normalize input (lowercase, strip whitespace)
    normalized = value.strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def generate_customer_id() -> str:
    """
    Generates a unique Customer ID.
    """
    # Use part of UUID for readability in a hackathon setting
    suffix = uuid.uuid4().hex[:8].upper()
    return f"CUST_{suffix}"

def generate_event_id() -> str:
    """
    Generates a unique Event ID.
    """
    suffix = uuid.uuid4().hex[:8].upper()
    return f"EVT_{suffix}"

def get_current_utc_time() -> datetime:
    """
    Returns the current UTC timezone-aware datetime.
    """
    return datetime.now(timezone.utc)

def parse_iso_datetime(dt_str: str) -> datetime:
    """
    Parses an ISO 8601 datetime string. Supports both timezone-naive and timezone-aware formats.
    """
    try:
        # Standard isoformat parsing
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except ValueError:
        # Fallback to current time if parsing fails
        return get_current_utc_time()
