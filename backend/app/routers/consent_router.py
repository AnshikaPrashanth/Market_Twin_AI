"""
Consent Router — /api/consent endpoints.

GET  /api/consent/{customer_id}  → return current consent vault
POST /api/consent/{customer_id}  → partial update to consent preferences

Architectural rationale:
- POST accepts a partial payload (ConsentUpdateRequest) rather than a full
  replacement.  This means a mobile app updating only "whatsapp: false" does
  not need to know the current value of "email" and "push" — it sends only
  what changed.  The engine merges the delta, preventing accidental resets.
- Response always returns the full updated vault so the client can refresh
  its local state in a single round-trip.
- 404 is intentionally NOT raised when a customer has no vault; we create a
  default vault on first access.  DPDP assumes consent at registration.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.dependencies import get_consent_engine
from app.services.consent_service import ConsentEngine
from app.services.consent_service.consent_engine import (
    ConsentVault,
    ConsentUpdateRequest,
)


router = APIRouter(prefix="/api/consent", tags=["Consent"])


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/{customer_id}",
    response_model=ConsentVault,
    summary="Retrieve the consent vault for a customer",
)
def get_consent_vault(
    customer_id: str,
    consent_engine: ConsentEngine = Depends(get_consent_engine),
) -> ConsentVault:
    """
    Returns the current per-channel consent state for a customer.

    If the customer has no existing record, a default vault with all
    channels enabled is created and returned (DPDP § opt-in at registration).
    """
    return consent_engine.get_consent_vault(customer_id)


@router.post(
    "/{customer_id}",
    response_model=ConsentVault,
    status_code=status.HTTP_200_OK,
    summary="Update consent preferences for a customer",
)
def update_consent(
    customer_id: str,
    body: ConsentUpdateRequest,
    consent_engine: ConsentEngine = Depends(get_consent_engine),
) -> ConsentVault:
    """
    Partially updates the consent vault.  Only fields present in the
    request body are changed; omitted fields retain their current value.

    Example — disable WhatsApp only:
    ```json
    { "whatsapp": false }
    ```
    The response contains the full updated vault with a refreshed
    last_updated timestamp.
    """
    return consent_engine.update_consent(customer_id, body)


@router.get(
    "/{customer_id}/channel/{channel}",
    summary="Check if a specific channel is consented for a customer",
)
def check_channel_consent(
    customer_id: str,
    channel: str,
    consent_engine: ConsentEngine = Depends(get_consent_engine),
) -> dict:
    """
    Lightweight consent gate check — useful for downstream services
    that need to verify a single channel without fetching the full vault.
    """
    allowed = consent_engine.can_message(customer_id, channel)
    return {
        "customer_id": customer_id,
        "channel":     channel,
        "allowed":     allowed,
    }