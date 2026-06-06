from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.event_service.event_service import EventService
from app.services.identity_service.identity_service import IdentityService
from app.services.twin_service.twin_service import TwinService

def get_event_service(db: Session = Depends(get_db)) -> EventService:
    """
    Dependency provider returning an EventService instance linked to the current DB session.
    """
    return EventService(db)

def get_identity_service(db: Session = Depends(get_db)) -> IdentityService:
    """
    Dependency provider returning an IdentityService instance linked to the current DB session.
    """
    return IdentityService(db)

def get_twin_service(db: Session = Depends(get_db)) -> TwinService:
    """
    Dependency provider returning a TwinService instance linked to the current DB session.
    """
    return TwinService(db)
