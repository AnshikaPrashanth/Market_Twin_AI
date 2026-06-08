from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.customer_schema import CustomerRegister, CustomerLogin, CustomerProfileResponse
from app.models.customer_model import CustomerModel
from app.models.identity_model import IdentityLinkModel
from app.core.utils import hash_identifier
from app.core.logger import logger
import uuid

router = APIRouter()

@router.post("/register", response_model=CustomerProfileResponse)
async def register(payload: CustomerRegister, db: Session = Depends(get_db)):
    """
    Registers a new user, hashes their identifiers, creates identity links, and returns their profile.
    """
    try:
        # Check if email or phone already exists
        email_hash = hash_identifier(payload.email)
        phone_hash = hash_identifier(payload.phone)

        existing_id = db.query(IdentityLinkModel).filter(
            IdentityLinkModel.identifier_value.in_([email_hash, phone_hash])
        ).first()

        if existing_id:
            raise HTTPException(status_code=400, detail="User with this email or phone already exists.")

        # Generate a new CUST_XXX id based on current count
        count = db.query(CustomerModel).count()
        customer_id = f"CUST_{count + 1:03d}"
        loyalty_id = f"L{count + 1:03d}"

        # Insert customer profile
        new_customer = CustomerModel(
            customer_id=customer_id,
            name=payload.name,
            password=payload.password, # Note: using plaintext password for hackathon demo
            email_hash=email_hash,
            phone_hash=phone_hash,
            loyalty_id=loyalty_id,
            city=payload.city,
            device_type="Web",
            active_hours=[9, 12, 18],
            preferred_categories=[],
            consent=payload.consent
        )
        db.add(new_customer)
        
        # Insert identity links
        # Device
        db.add(IdentityLinkModel(
            identifier_type="device_id", identifier_value=payload.device_id,
            customer_id=customer_id, confidence_score=100, matched_by="deterministic_registration"
        ))
        # Email
        db.add(IdentityLinkModel(
            identifier_type="email_hash", identifier_value=email_hash,
            customer_id=customer_id, confidence_score=100, matched_by="deterministic_registration"
        ))
        # Phone
        db.add(IdentityLinkModel(
            identifier_type="phone_hash", identifier_value=phone_hash,
            customer_id=customer_id, confidence_score=100, matched_by="deterministic_registration"
        ))

        # Create default twin
        from app.models.twin_model import TwinModel
        default_twin = TwinModel(
            customer_id=customer_id,
            journey_stage="awareness",
            churn_risk=10,
            preferred_channel="email"
        )
        db.add(default_twin)

        db.commit()
        db.refresh(new_customer)
        
        logger.info(f"Successfully registered {customer_id}")
        return CustomerProfileResponse.model_validate(new_customer)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=CustomerProfileResponse)
async def login(payload: CustomerLogin, db: Session = Depends(get_db)):
    """
    Logs in a user via email or phone and password.
    """
    identifier_hash = hash_identifier(payload.identifier)
    
    # Find identity link
    identity = db.query(IdentityLinkModel).filter(
        IdentityLinkModel.identifier_value == identifier_hash
    ).first()

    if not identity:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    customer = db.query(CustomerModel).filter(CustomerModel.customer_id == identity.customer_id).first()
    
    if not customer or customer.password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    logger.info(f"Successfully logged in {customer.customer_id}")
    return CustomerProfileResponse.model_validate(customer)
