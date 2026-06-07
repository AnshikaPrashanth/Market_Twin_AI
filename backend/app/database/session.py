from typing import Generator
from app.database.db import SessionLocal

def get_db() -> Generator:
    """
    Dependency helper to retrieve a database session.
    Automatically closes the session after the request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
