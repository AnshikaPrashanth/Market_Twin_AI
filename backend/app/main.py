from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import logger
from app.database.db import init_db
from app.database.seed import seed_initial_data

# Import routes individually to ensure clean namespaces
from app.api.routes.health_routes import router as health_router
from app.api.routes.event_routes import router as event_router
from app.api.routes.customer_routes import router as customer_router

# Import event_processor to register in-memory event bus subscribers
import app.services.event_service.event_processor

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="MarketTwin AI - Real-Time Omnichannel Customer Intelligence and Digital Twin Platform"
)

# CORS middleware for cross-origin client consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints under '/api' prefix
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(event_router, prefix="/api", tags=["Events"])
app.include_router(customer_router, prefix="/api", tags=["Customers"])

@app.on_event("startup")
def startup_event():
    logger.info("Initializing MarketTwin AI Core Backend System...")
    # Initialize SQLite database and compile schemas
    init_db()
    # Seed base profiles and twins
    seed_initial_data()
    logger.info("MarketTwin AI Core Engine startup finished successfully.")

@app.get("/")
def read_root():
    """
    Standard landing route directing clients to documentation/health specs.
    """
    return {
        "application": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "docs_url": "/docs",
        "health_check_url": "/api/health"
    }
