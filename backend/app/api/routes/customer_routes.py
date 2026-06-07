from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.api.dependencies import get_identity_service, get_twin_service, get_event_service
from app.services.identity_service.identity_service import IdentityService
from app.services.twin_service.twin_service import TwinService
from app.services.event_service.event_service import EventService
from app.schemas.customer_schema import CustomerProfileResponse
from app.schemas.twin_schema import TwinStateResponse
from app.schemas.event_schema import EventResponse
from app.core.logger import logger

router = APIRouter()

@router.get("/customers", response_model=List[CustomerProfileResponse])
def get_all_customers(identity_service: IdentityService = Depends(get_identity_service)):
    """
    Retrieves all customer profiles stored in the system.
    """
    logger.info("GET /api/customers called.")
    profiles = identity_service.store.get_all_profiles()
    return [CustomerProfileResponse.model_validate(p) for p in profiles]

@router.get("/customer/{customer_id}", response_model=CustomerProfileResponse)
def get_customer_profile(customer_id: str, identity_service: IdentityService = Depends(get_identity_service)):
    """
    Retrieves demographics and features associated with a customer ID.
    """
    logger.info(f"GET /api/customer/{customer_id} called.")
    profile = identity_service.store.get_customer_profile(customer_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer profile with ID '{customer_id}' was not found."
        )
    return CustomerProfileResponse.model_validate(profile)

@router.get("/customer/{customer_id}/twin", response_model=TwinStateResponse)
def get_customer_twin(customer_id: str, twin_service: TwinService = Depends(get_twin_service)):
    """
    Retrieves the active behavior digital twin state for a customer ID.
    """
    logger.info(f"GET /api/customer/{customer_id}/twin called.")
    twin = twin_service.get_twin(customer_id)
    if not twin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Digital Twin for customer ID '{customer_id}' was not found."
        )
    return TwinStateResponse.model_validate(twin)

@router.get("/customer/{customer_id}/events", response_model=List[EventResponse])
def get_customer_events(customer_id: str, event_service: EventService = Depends(get_event_service)):
    """
    Retrieves a list of all historical events associated with a customer ID.
    """
    logger.info(f"GET /api/customer/{customer_id}/events called.")
    events = event_service.store.get_events_by_customer(customer_id)
    return [EventResponse.model_validate(e) for e in events]
