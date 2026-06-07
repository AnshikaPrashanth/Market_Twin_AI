from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.metrics_service import MetricsService
from app.database.session import get_db

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    service = MetricsService(db)
    return service.get_summary()

@router.get("/cohort-drift")
def get_cohort_drift():
    service = MetricsService()
    return service.get_cohort_drift()
