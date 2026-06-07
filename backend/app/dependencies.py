from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.session import get_db

from app.services.nba_service import NBAEngine
from app.services.consent_service import ConsentEngine
from app.services.twin_service import TwinService

# ── Singletons ────────────────────────────────────────────────────────────
_nba_engine     = NBAEngine()
_consent_engine = ConsentEngine()

# ── Providers (used with FastAPI Depends) ─────────────────────────────────

def get_consent_engine() -> ConsentEngine:
    return _consent_engine

def get_nba_engine() -> NBAEngine:
    return _nba_engine

def get_twin_service(db: Session = Depends(get_db)) -> TwinService:
    # TwinService is instantiated per request so it gets a fresh DB session
    service = TwinService(db)
    # Inject singleton engines to preserve state
    service.nba_engine = _nba_engine
    service.consent_engine = _consent_engine
    return service