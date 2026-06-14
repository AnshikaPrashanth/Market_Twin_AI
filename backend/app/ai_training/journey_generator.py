import random
from typing import List, Dict, Any

class JourneyGenerator:
    """
    Generates realistic sequence of events for a customer based on their segment and intent.
    """
    
    @staticmethod
    def generate_journey(segment: str, preferred_category: str) -> List[Dict[str, Any]]:
        journeys = []
        
        # 1. High Intent / Loyal: Smooth conversion path
        if segment in ("High Intent", "Loyal"):
            path_type = random.choices(["direct_purchase", "multi_session_purchase"], weights=[0.4, 0.6])[0]
            if path_type == "direct_purchase":
                journeys = [
                    {"type": "session_start"},
                    {"type": "product_view", "category": preferred_category},
                    {"type": "product_view", "category": preferred_category},
                    {"type": "add_to_cart", "category": preferred_category},
                    {"type": "purchase"}
                ]
            else:
                journeys = [
                    {"type": "session_start"},
                    {"type": "product_view", "category": preferred_category},
                    {"type": "add_to_cart", "category": preferred_category},
                    {"type": "cart_abandon"},
                    {"type": "email_open"},
                    {"type": "session_start"},
                    {"type": "purchase"}
                ]
                
        # 2. Cart Active / Interested: Abandonment and recovery
        elif segment in ("Cart Active", "Interested"):
            path_type = random.choices(["abandon_only", "abandon_and_recover"], weights=[0.7, 0.3])[0]
            if path_type == "abandon_only":
                journeys = [
                    {"type": "session_start"},
                    {"type": "product_view", "category": preferred_category},
                    {"type": "add_to_cart", "category": preferred_category},
                    {"type": "cart_abandon"}
                ]
            else:
                journeys = [
                    {"type": "session_start"},
                    {"type": "product_view", "category": preferred_category},
                    {"type": "add_to_cart", "category": preferred_category},
                    {"type": "cart_abandon"},
                    {"type": "whatsapp_click"},
                    {"type": "purchase"}
                ]
                
        # 3. Browsing / Anonymous: High bounce, no cart
        elif segment in ("Browsing", "Anonymous"):
            journeys = [
                {"type": "session_start"},
                {"type": "product_view", "category": random.choice([preferred_category, "Other"])},
                {"type": "product_view", "category": preferred_category},
            ]
            if random.random() > 0.8:
                journeys.append({"type": "add_to_cart", "category": preferred_category})
                journeys.append({"type": "cart_abandon"})
                
        # 4. Churn Risk / Dormant: Inactive or ignoring messages
        elif segment in ("Churn Risk", "Dormant"):
            journeys = [
                {"type": "email_sent"},
                {"type": "email_sent"},
                {"type": "push_sent"}
            ]
            if random.random() > 0.8:
                journeys.append({"type": "unsubscribe"})
        
        else:
            journeys = [
                {"type": "session_start"},
                {"type": "product_view", "category": preferred_category}
            ]
            
        return journeys
