from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import get_db
from app.services.cart_service import CartService
from app.api.dependencies import get_event_service
from app.services.event_service.event_service import EventService
from app.core.logger import logger
from app.models.identity_model import IdentityLinkModel

router = APIRouter()

class CartRequest(BaseModel):
    customer_id: str
    product_id: str = None

def _get_identifiers(db: Session, customer_id: str):
    identity = db.query(IdentityLinkModel).filter(IdentityLinkModel.customer_id == customer_id).first()
    if identity:
        return {identity.identifier_type: identity.identifier_value}
    return {"device_id": "D88"}

@router.get("/{customer_id}")
async def get_cart(customer_id: str):
    return CartService.get_cart(customer_id)

@router.post("/add")
async def add_to_cart(request: CartRequest, db: Session = Depends(get_db), event_service: EventService = Depends(get_event_service)):
    if not request.product_id:
        raise HTTPException(status_code=400, detail="product_id is required")
        
    cart = CartService.add_to_cart(request.customer_id, request.product_id)
    product = CartService.get_product(request.product_id)
    
    identifiers = _get_identifiers(db, request.customer_id)
    
    raw_event = {
        "event_type": "add_to_cart",
        "source": "website",
        "customer_id": request.customer_id,
        "identifiers": identifiers,
        "properties": {
            "product_id": request.product_id,
            "product_name": product["name"] if product else "Unknown Product",
            "price": product["price"] if product else 0,
            "value": product["price"] if product else 0
        }
    }
    
    result = await event_service.process_event(raw_event)
    return {"cart": cart, "event_result": result}

@router.post("/remove")
async def remove_from_cart(request: CartRequest, db: Session = Depends(get_db), event_service: EventService = Depends(get_event_service)):
    if not request.product_id:
        raise HTTPException(status_code=400, detail="product_id is required")
        
    cart = CartService.remove_from_cart(request.customer_id, request.product_id)
    product = CartService.get_product(request.product_id)
    
    identifiers = _get_identifiers(db, request.customer_id)
    
    raw_event = {
        "event_type": "remove_from_cart",
        "source": "website",
        "customer_id": request.customer_id,
        "identifiers": identifiers,
        "properties": {
            "product_id": request.product_id,
            "product_name": product["name"] if product else "Unknown Product",
            "price": product["price"] if product else 0
        }
    }
    
    result = await event_service.process_event(raw_event)
    return {"cart": cart, "event_result": result}

@router.post("/abandon")
async def abandon_cart(request: CartRequest, db: Session = Depends(get_db), event_service: EventService = Depends(get_event_service)):
    cart = CartService.get_cart(request.customer_id)
    if len(cart["items"]) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty. Add an item before abandoning.")
        
    cart = CartService.abandon_cart(request.customer_id)
    
    # Use first item for event context
    first_item = cart["items"][0]
    
    identifiers = _get_identifiers(db, request.customer_id)
    
    raw_event = {
        "event_type": "cart_abandoned",
        "source": "website",
        "customer_id": request.customer_id,
        "identifiers": identifiers,
        "properties": {
            "product_id": first_item["product_id"],
            "product_name": first_item["name"],
            "price": first_item["price"],
            "value": cart["cart_value"]
        }
    }
    
    result = await event_service.process_event(raw_event)
    return {"cart": cart, "event_result": result}

@router.post("/purchase")
async def purchase_cart(request: CartRequest, db: Session = Depends(get_db), event_service: EventService = Depends(get_event_service)):
    cart = CartService.get_cart(request.customer_id)
    if len(cart["items"]) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty. Add an item before purchase.")
        
    purchase_value = cart["cart_value"]
    
    # Process event BEFORE clearing cart
    identifiers = _get_identifiers(db, request.customer_id)
    raw_event = {
        "event_type": "purchase",
        "source": "website",
        "customer_id": request.customer_id,
        "identifiers": identifiers,
        "properties": {
            "value": purchase_value
        }
    }
    result = await event_service.process_event(raw_event)
    
    cart = CartService.purchase_cart(request.customer_id)
    
    return {"cart": cart, "event_result": result}
