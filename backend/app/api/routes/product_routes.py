from fastapi import APIRouter
from app.services.cart_service import PRODUCTS

router = APIRouter()

@router.get("")
async def get_products():
    return {"products": PRODUCTS}
