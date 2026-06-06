from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_event_service
from app.services.event_service.event_service import EventService
from app.schemas.response_schema import EventIngestionResponse
from app.core.logger import logger

router = APIRouter()

@router.post("/event", response_model=EventIngestionResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(raw_event: dict, service: EventService = Depends(get_event_service)):
    """
    Primary ingestion endpoint. Processes incoming customer actions, merges identities,
    triggers behavioral updates, and outputs the updated digital twin.
    """
    logger.info("POST /api/event ingestion endpoint called.")
    response = await service.process_event(raw_event)
    return response
