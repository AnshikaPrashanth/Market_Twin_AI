from fastapi import APIRouter, Depends, HTTPException
from app.services.predictive_service import PredictiveTwinEngine
from app.api.dependencies import get_db
from app.services.twin_service.twin_service import TwinService
from sqlalchemy.orm import Session

router = APIRouter()
engine = PredictiveTwinEngine()

@router.get("/{customer_id}")
def get_predictive_twin(customer_id: str, db: Session = Depends(get_db)):
    twin_service = TwinService(db)
    twin = twin_service.get_twin(customer_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Customer twin not found")
        
    return engine.simulate(twin)
