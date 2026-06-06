from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLite connection configuration (allow access from multiple threads)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """
    Imports all SQLAlchemy models to register them on the Base metadata
    and creates database tables if they do not exist.
    """
    # Import models locally to avoid circular dependencies
    from app.models.event_model import EventModel
    from app.models.customer_model import CustomerModel
    from app.models.twin_model import TwinModel
    from app.models.identity_model import IdentityLinkModel
    
    Base.metadata.create_all(bind=engine)
