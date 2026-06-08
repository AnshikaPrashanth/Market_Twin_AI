from fastapi import APIRouter
from app.services.audience_service import AudienceService

router = APIRouter()
service = AudienceService()

@router.get("/segments")
def get_segments():
    return service.get_segments()

@router.get("/fatigue-heatmap")
def get_fatigue_heatmap():
    return service.get_fatigue_heatmap()
