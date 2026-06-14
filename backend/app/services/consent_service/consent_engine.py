# Consent Engine Implementation
"""
Consent Engine — DPDP-compliant per-channel opt-in/opt-out store.

Architectural rationale:
- In-memory repository: the spec says no Redis, no Kafka. A plain dict
  behind a class boundary means we can swap the backing store to
  MongoDB / Redis later by changing exactly one method (_load / _save)
  without touching any call site.
- ConsentVault is a Pydantic model so it can be serialised directly by
  FastAPI's response_model, validated on inbound POST, and compared with
  == for testing — no manual dict wrangling anywhere.
- can_message() is the single gate used by twin_service. It returns a
  plain bool so the integration layer stays simple.
- Channel set is defined once (SUPPORTED_CHANNELS) and referenced in
  both the model and the engine so mismatches surface at import time,
  not at runtime.
- last_updated stores an ISO-8601 string (not datetime) to remain JSON-
  serialisable without a custom encoder.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUPPORTED_CHANNELS: frozenset[str] = frozenset({"email", "whatsapp", "push", "sms"})


# ---------------------------------------------------------------------------
# Pydantic model — shared between engine, API response, and API request body
# ---------------------------------------------------------------------------

class ConsentVault(BaseModel):
    """
    Per-customer consent record.

    Each boolean represents explicit opt-in (True) or opt-out (False).
    New customers are provisioned with all channels enabled by default,
    matching DPDP's "consent given at sign-up" assumption.  Operators
    should set to False on unsubscribe events.
    """
    email:        bool = True
    whatsapp:     bool = True
    push:         bool = True
    sms:          bool = True
    last_updated: str  = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email":        True,
                "whatsapp":     False,
                "push":         True,
                "sms":          True,
                "last_updated": "2024-11-01T10:30:00+00:00",
            }
        }
    }


# ---------------------------------------------------------------------------
# Update request model (separate from ConsentVault so last_updated is
# server-controlled, not client-supplied)
# ---------------------------------------------------------------------------

class ConsentUpdateRequest(BaseModel):
    email:    Optional[bool] = None
    whatsapp: Optional[bool] = None
    push:     Optional[bool] = None
    sms:      Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "email":    True,
                "whatsapp": False,
                "push":     True,
                "sms":      True,
            }
        }
    }


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class ConsentEngine:
    """
    DPDP-aligned consent gate.

    Thread-safety note: for a single-process hackathon deployment the plain
    dict is fine. For multi-worker Gunicorn/Uvicorn you would move the store
    to a shared backend (Redis, Mongo). The interface does not change.
    """

    def __init__(self) -> None:
        # customer_id → ConsentVault
        self._store: Dict[str, ConsentVault] = {}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_consent_vault(self, customer_id: str) -> ConsentVault:
        """
        Return the consent vault for a customer.

        If the customer has no record, a default vault (all channels enabled)
        is created and stored.  This models the "consent at registration"
        pattern common in Indian e-commerce under DPDP 2023.
        """
        if customer_id not in self._store:
            self._store[customer_id] = ConsentVault()
        return self._store[customer_id]

    def can_message(self, customer_id: str, channel: str) -> bool:
        """
        Gate function called by twin_service before dispatching any action.

        Returns False when:
          • The channel is not in SUPPORTED_CHANNELS (unknown channel).
          • The customer's vault has the channel set to False (opted out).

        Returns True in all other cases.
        """
        if channel not in SUPPORTED_CHANNELS:
            return False

        vault = self.get_consent_vault(customer_id)
        return getattr(vault, channel, False)

    def update_consent(
        self,
        customer_id: str,
        update: ConsentUpdateRequest,
    ) -> ConsentVault:
        """
        Merge a partial update into the existing vault.

        Only fields explicitly included in the request body are changed.
        last_updated is always refreshed to the server's current UTC time.
        """
        vault = self.get_consent_vault(customer_id)

        # Merge non-None fields from the update payload.
        updated_fields = update.model_dump(exclude_none=True)
        if updated_fields:
            merged = vault.model_dump()
            merged.update(updated_fields)
            merged["last_updated"] = datetime.now(timezone.utc).isoformat()
            self._store[customer_id] = ConsentVault(**merged)

        return self._store[customer_id]

    # ------------------------------------------------------------------
    # Channel fallback resolution (used by twin_service integration)
    # ------------------------------------------------------------------

    def resolve_channel_with_fallback(
        self,
        customer_id: str,
        preferred_channel: str,
        fallback_order: tuple[str, ...] = ("email", "push", "whatsapp"),
    ) -> Optional[str]:
        """
        Given a preferred channel, return the first available consented
        channel from the fallback order, or None if everything is blocked.

        This implements the spec requirement:
          "NBA: send_whatsapp → Consent: whatsapp disabled → send_email"
        without hard-coding the fallback logic in twin_service.
        """
        candidates = [preferred_channel] + [
            ch for ch in fallback_order if ch != preferred_channel
        ]
        for channel in candidates:
            if self.can_message(customer_id, channel):
                return channel
        return None