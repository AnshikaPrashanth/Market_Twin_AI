from typing import Dict, Any, List, Optional

PRODUCTS = [
    # Electronics (8)
    {"product_id": "P101", "name": "Wireless Headphones", "category": "Electronics", "price": 2499, "image": "🎧", "stock_status": "in_stock", "popularity_score": 95, "margin": 30},
    {"product_id": "P102", "name": "Smart Watch", "category": "Electronics", "price": 5999, "image": "⌚", "stock_status": "low_stock", "popularity_score": 92, "margin": 25},
    {"product_id": "P103", "name": "Bluetooth Speaker", "category": "Electronics", "price": 1299, "image": "🔊", "stock_status": "in_stock", "popularity_score": 82, "margin": 35},
    {"product_id": "P104", "name": "Laptop Stand", "category": "Electronics", "price": 899, "image": "💻", "stock_status": "in_stock", "popularity_score": 65, "margin": 60},
    {"product_id": "P105", "name": "Mechanical Keyboard", "category": "Electronics", "price": 3999, "image": "⌨️", "stock_status": "in_stock", "popularity_score": 94, "margin": 30},
    {"product_id": "P106", "name": "Gaming Mouse", "category": "Electronics", "price": 1499, "image": "🖱️", "stock_status": "in_stock", "popularity_score": 88, "margin": 40},
    {"product_id": "P107", "name": "Power Bank", "category": "Electronics", "price": 999, "image": "🔋", "stock_status": "in_stock", "popularity_score": 85, "margin": 45},
    {"product_id": "P108", "name": "Tablet Sleeve", "category": "Electronics", "price": 499, "image": "📱", "stock_status": "in_stock", "popularity_score": 75, "margin": 55},

    # Fashion (8)
    {"product_id": "P201", "name": "Running Shoes", "category": "Fashion", "price": 3499, "image": "👟", "stock_status": "in_stock", "popularity_score": 88, "margin": 45},
    {"product_id": "P202", "name": "Backpack", "category": "Fashion", "price": 1999, "image": "🎒", "stock_status": "in_stock", "popularity_score": 75, "margin": 50},
    {"product_id": "P203", "name": "Hoodie", "category": "Fashion", "price": 2499, "image": "🧥", "stock_status": "low_stock", "popularity_score": 89, "margin": 40},
    {"product_id": "P204", "name": "Sunglasses", "category": "Fashion", "price": 1499, "image": "🕶️", "stock_status": "in_stock", "popularity_score": 78, "margin": 55},
    {"product_id": "P205", "name": "Denim Jacket", "category": "Fashion", "price": 3999, "image": "👕", "stock_status": "in_stock", "popularity_score": 83, "margin": 35},
    {"product_id": "P206", "name": "Cap", "category": "Fashion", "price": 499, "image": "🧢", "stock_status": "in_stock", "popularity_score": 60, "margin": 70},
    {"product_id": "P207", "name": "Sneakers", "category": "Fashion", "price": 2999, "image": "👟", "stock_status": "in_stock", "popularity_score": 90, "margin": 40},
    {"product_id": "P208", "name": "Watch Strap", "category": "Fashion", "price": 299, "image": "⌚", "stock_status": "in_stock", "popularity_score": 65, "margin": 75},

    # Home/Lifestyle (8)
    {"product_id": "P301", "name": "Coffee Maker", "category": "Home/Lifestyle", "price": 4999, "image": "☕", "stock_status": "out_of_stock", "popularity_score": 91, "margin": 20},
    {"product_id": "P302", "name": "Desk Lamp", "category": "Home/Lifestyle", "price": 799, "image": "💡", "stock_status": "in_stock", "popularity_score": 72, "margin": 50},
    {"product_id": "P303", "name": "Water Bottle", "category": "Home/Lifestyle", "price": 499, "image": "💧", "stock_status": "in_stock", "popularity_score": 85, "margin": 65},
    {"product_id": "P304", "name": "Yoga Mat", "category": "Home/Lifestyle", "price": 1299, "image": "🧘", "stock_status": "low_stock", "popularity_score": 80, "margin": 45},
    {"product_id": "P305", "name": "Air Purifier", "category": "Home/Lifestyle", "price": 8999, "image": "🌬️", "stock_status": "in_stock", "popularity_score": 86, "margin": 25},
    {"product_id": "P306", "name": "Notebook Set", "category": "Home/Lifestyle", "price": 399, "image": "📓", "stock_status": "in_stock", "popularity_score": 70, "margin": 60},
    {"product_id": "P307", "name": "Travel Mug", "category": "Home/Lifestyle", "price": 599, "image": "🥤", "stock_status": "in_stock", "popularity_score": 81, "margin": 55},
    {"product_id": "P308", "name": "Organizer", "category": "Home/Lifestyle", "price": 899, "image": "🗃️", "stock_status": "in_stock", "popularity_score": 76, "margin": 50}
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
