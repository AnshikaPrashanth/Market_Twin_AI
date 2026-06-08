from typing import Dict, Any, Optional

class CreativeEngine:
    """
    Generates template-based contextual messages based on the finalized
    consent-aware action and delivery channel.
    """
    
    def generate(self, customer_id: str, action: str, channel: str, properties: Optional[Dict[str, Any]] = None, event_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not action or action in ("do_nothing", "cool_down_marketing"):
            return None
            
        if not channel:
            return None

        # Fallbacks for properties
        props = properties or {}
        product_name = props.get("product_name") or props.get("product_id") or "your selected item"
        
        # Message generation based on action and channel
        is_recovery = action in ("cart_recovery_coupon", "send_coupon") or event_type in ("cart_abandoned", "cart_abandon")
        
        if is_recovery:
            return self._generate_coupon_message(channel, product_name)
        elif action in ("send_email", "send_whatsapp", "send_push", "show_website_personalization"):
            return self._generate_nurture_message(channel, product_name)
        else:
            return None

    def _generate_coupon_message(self, channel: str, product_name: str) -> Dict[str, Any]:
        if channel == "whatsapp":
            return {
                "channel": "whatsapp",
                "message": f"Hey Rahul, your {product_name} are still in your cart. Complete your order today and get 10% off.",
                "cta": "Return to cart"
            }
        elif channel == "email":
            return {
                "channel": "email",
                "subject": "Your cart is waiting",
                "body": f"Hi Rahul, your {product_name} are still in your cart. Complete your purchase today and get 10% off.",
                "cta": "Complete purchase"
            }
        elif channel == "push":
            return {
                "channel": "push",
                "title": "Your cart is waiting",
                "body": "Get 10% off today on your selected item.",
                "cta": "Open cart"
            }
        elif channel == "website":
            return {
                "channel": "website",
                "banner": f"Welcome back Rahul! Your {product_name} are waiting with 10% off.",
                "cta": "Return to cart"
            }
        return {}

    def _generate_nurture_message(self, channel: str, product_name: str) -> Dict[str, Any]:
        if channel == "whatsapp":
            return {
                "channel": "whatsapp",
                "message": f"Hey, still interested in {product_name}? Let us know if you have any questions!",
                "cta": "View product"
            }
        elif channel == "email":
            return {
                "channel": "email",
                "subject": f"We saved {product_name} for you",
                "body": f"Hi! We noticed you were looking at {product_name}. Check out what others are saying about it.",
                "cta": "View details"
            }
        elif channel == "push":
            return {
                "channel": "push",
                "title": "Still interested?",
                "body": f"Take another look at {product_name}.",
                "cta": "View product"
            }
        elif channel == "website":
            return {
                "channel": "website",
                "banner": f"Still thinking about {product_name}? Click here to view details.",
                "cta": "View product"
            }
        return {}
