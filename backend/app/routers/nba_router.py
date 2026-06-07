"""
NBA Router — /api/nba endpoints.

GET  /api/nba/{customer_id}         → current NBA decision (consent-gated)
GET  /api/nba/{customer_id}/explain → verbose explanation for ops dashboard
POST /api/nba/{customer_id}/event   → process an event and return new NBA

Architectural rationale:
- Routers are thin: they validate HTTP contracts and delegate to TwinService.
  No business logic lives here.
- Response models are Pydantic so FastAPI auto-generates OpenAPI docs and
  validates outbound payloads — no manual serialisation needed.
- The /explain endpoint is deliberately separate from the main endpoint so
  lightweight clients (mobile apps) get a small payload and dashboards get
  the verbose one without a query-param flag.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_twin_service
from app.services.twin_service import TwinService


router = APIRouter(prefix="/api/nba", tags=["Next Best Action"])


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class NBAResponse(BaseModel):
    customer_id:          str
    action:               str
    confidence:           float = Field(ge=0.0, le=1.0)
    reason:               str
    consent_gate_applied: bool
    final_channel:        Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "customer_id":          "cust_abc123",
                "action":               "send_coupon",
                "confidence":           0.91,
                "reason":               "Customer abandoned cart with intent score 87 and fatigue score 12",
                "consent_gate_applied": False,
                "final_channel":        "email",
            }
        }


class EventPayload(BaseModel):
    type: Optional[str] = None
    event_type: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    properties: Dict[str, Any] = Field(default_factory=dict)
    source: Optional[str] = None

    class Config:
        extra = "allow"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/{customer_id}",
    response_model=NBAResponse,
    summary="Get next best action for a customer",
)
def get_nba(
    customer_id: str,
    twin_service: TwinService = Depends(get_twin_service),
) -> NBAResponse:
    """
    Returns the consent-gated next best action for the given customer.

    The action has already been filtered through the consent engine —
    if the preferred channel is blocked, the response reflects the
    fallback action (or do_nothing if all channels are blocked).
    """
    result = twin_service.get_nba_for_customer(customer_id)
    return NBAResponse(**result)


@router.get(
    "/{customer_id}/explain",
    summary="Verbose NBA explanation for ops/audit dashboards",
)
def explain_nba(
    customer_id: str,
    twin_service: TwinService = Depends(get_twin_service),
) -> Dict[str, Any]:
    """
    Returns the full NBA explanation including input snapshot and
    threshold values used in the decision.  Intended for internal
    dashboards and model audits, not customer-facing APIs.
    """
    return twin_service.get_nba_explanation(customer_id)


@router.post(
    "/{customer_id}/event",
    summary="Process an event and return the updated NBA decision",
    status_code=status.HTTP_200_OK,
)
def process_event(
    customer_id: str,
    payload: EventPayload,
    twin_service: TwinService = Depends(get_twin_service),
) -> Dict[str, Any]:
    """
    Runs the full pipeline:
      Event → Twin Update → NBA Engine → Consent Gate → Final Action

    Use this endpoint to push raw behavioural events and immediately
    receive the updated recommended action.
    """
    import uuid
    from datetime import datetime, timezone
    from app.models.event_model import EventModel

    event_type = payload.type or payload.event_type or "unknown"
    props = payload.properties if payload.properties else payload.metadata

    event = EventModel(
        event_id=str(uuid.uuid4()),
        event_type=event_type,
        source=payload.source or props.get("source", "website"),
        timestamp=datetime.now(timezone.utc),
        identifiers={},
        customer_id=customer_id,
        properties=props
    )
    
    result = twin_service.process_event(customer_id, event)
    return result.to_dict()