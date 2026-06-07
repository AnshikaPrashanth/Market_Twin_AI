from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.logger import logger

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Inspects application status and database session connection viability.
    """
    try:
        # Perform quick execution to test connection
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "message": "MarketTwin AI Core Engine is operational."
        }
    except Exception as e:
        logger.critical(f"System health check failed: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
