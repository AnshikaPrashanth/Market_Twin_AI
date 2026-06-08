from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import logger
from app.database.db import init_db
from app.database.seed import seed_initial_data

# Existing routers
from app.api.routes.health_routes import router as health_router
from app.api.routes.event_routes import router as event_router
from app.api.routes.customer_routes import router as customer_router

# New routers
from app.api.routes.auth_routes import router as auth_router
from app.routers.nba_router import router as nba_router
from app.routers.consent_router import router as consent_router
from app.api.routes.creative_routes import router as creative_router
from app.api.routes.predictive_routes import router as predictive_router
from app.api.routes.audience_routes import router as audience_router
from app.api.routes.metrics_routes import router as metrics_router
from app.api.routes.message_routes import router as message_router
from app.api.routes.product_routes import router as product_router
from app.api.routes.cart_routes import router as cart_router

# Import event_processor to register in-memory event bus subscribers
import app.services.event_service.event_processor


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description=(
        "MarketTwin AI - Real-Time Omnichannel Customer Intelligence, "
        "Digital Twin, NBA Decisioning, and Consent-Aware Activation Platform"
    ),
)

# CORS middleware for frontend/backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api prefix
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(event_router, prefix="/api", tags=["Events"])
app.include_router(customer_router, prefix="/api", tags=["Customers"])
app.include_router(nba_router, tags=["Next Best Action"])
app.include_router(consent_router, tags=["Consent"])
app.include_router(creative_router, prefix="/api/creative", tags=["Creative Generation"])
app.include_router(predictive_router, prefix="/api/predictive", tags=["Predictive Twin"])
app.include_router(audience_router, prefix="/api/audience", tags=["Audience Intelligence"])
app.include_router(metrics_router, prefix="/api/metrics", tags=["Measurement Metrics"])
app.include_router(message_router, prefix="/api/messages", tags=["Messages"])
app.include_router(product_router, prefix="/api/products", tags=["Products"])
app.include_router(cart_router, prefix="/api/cart", tags=["Cart"])


@app.on_event("startup")
def startup_event():
    """
    Initializes database schema, seed data, and in-memory subscribers.
    """
    logger.info("Initializing MarketTwin AI Core Backend System...")

    init_db()
    seed_initial_data()

    logger.info("MarketTwin AI Core Engine startup finished successfully.")


@app.get("/")
def read_root():
    """
    Standard landing route directing clients to documentation and health check.
    """
    return {
        "application": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "version": "2.0.0",
        "docs_url": "/docs",
        "health_check_url": "/api/health",
        "available_modules": [
            "Health",
            "Events",
            "Customers",
            "Next Best Action",
            "Consent",
        ],
    }