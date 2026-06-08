from typing import Dict, Any, List, Optional

PRODUCTS = [
  {
    "product_id": "P101",
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 2499,
    "image": "🎧"
  },
  {
    "product_id": "P102",
    "name": "Running Shoes",
    "category": "Fashion",
    "price": 3499,
    "image": "👟"
  },
  {
    "product_id": "P103",
    "name": "Smart Watch",
    "category": "Electronics",
    "price": 5999,
    "image": "⌚"
  },
  {
    "product_id": "P104",
    "name": "Backpack",
    "category": "Fashion",
    "price": 1999,
    "image": "🎒"
  }
]

class CartService:
    _carts: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_product(cls, product_id: str) -> Optional[Dict[str, Any]]:
        for p in PRODUCTS:
            if p["product_id"] == product_id:
                return p
        return None

    @classmethod
    def get_cart(cls, customer_id: str) -> Dict[str, Any]:
        if customer_id not in cls._carts:
            cls._carts[customer_id] = {
                "customer_id": customer_id,
                "items": [],
                "cart_value": 0,
                "status": "empty"
            }
        return cls._carts[customer_id]

    @classmethod
    def reset_cart(cls, customer_id: str) -> Dict[str, Any]:
        cls._carts[customer_id] = {
            "customer_id": customer_id,
            "items": [],
            "cart_value": 0,
            "status": "empty"
        }
        return cls._carts[customer_id]

    @classmethod
    def add_to_cart(cls, customer_id: str, product_id: str) -> Dict[str, Any]:
        cart = cls.get_cart(customer_id)
        product = cls.get_product(product_id)
        if not product:
            return cart

        # Check if item exists
        found = False
        for item in cart["items"]:
            if item["product_id"] == product_id:
                item["quantity"] += 1
                found = True
                break
        
        if not found:
            cart_item = product.copy()
            cart_item["quantity"] = 1
            cart["items"].append(cart_item)

        cart["status"] = "active"
        cart["cart_value"] = sum(item["price"] * item["quantity"] for item in cart["items"])
        return cart

    @classmethod
    def remove_from_cart(cls, customer_id: str, product_id: str) -> Dict[str, Any]:
        cart = cls.get_cart(customer_id)
        
        for item in cart["items"]:
            if item["product_id"] == product_id:
                item["quantity"] -= 1
                if item["quantity"] <= 0:
                    cart["items"].remove(item)
                break
                
        cart["cart_value"] = sum(item["price"] * item["quantity"] for item in cart["items"])
        if len(cart["items"]) == 0:
            cart["status"] = "empty"
            
        return cart

    @classmethod
    def abandon_cart(cls, customer_id: str) -> Dict[str, Any]:
        cart = cls.get_cart(customer_id)
        if len(cart["items"]) > 0:
            cart["status"] = "abandoned"
        return cart

    @classmethod
    def purchase_cart(cls, customer_id: str) -> Dict[str, Any]:
        cart = cls.get_cart(customer_id)
        if len(cart["items"]) > 0:
            cart["purchased_value"] = cart["cart_value"]
            cart["items"] = []
            cart["cart_value"] = 0
            cart["status"] = "purchased"
        return cart
