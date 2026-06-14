from typing import List

# Dictionary to map technical feature names to human-readable strings
HUMAN_READABLE_FEATURES = {
    "intent_score": "Purchase Intent",
    "churn_risk": "Churn Risk",
    "fatigue_score": "Communication Fatigue",
    "product_views": "Product Views",
    "cart_count": "Cart Interactions",
    "abandonments": "Cart Abandonments",
    "cart_value": "Cart Value",
    "engagement_score": "Engagement Score",
    "cart_abandon_rate": "Cart Abandonment Rate",
    "email_click_rate": "Email Engagement",
    "whatsapp_click_rate": "WhatsApp Engagement",
    "push_click_rate": "Push Notification Engagement",
    "max_click_rate": "Highest Channel Engagement",
    "is_highly_engaged": "High Engagement User",
    "same_city": "Matching City Location",
    "same_browser": "Matching Browser",
    "same_device_type": "Matching Device Type",
    "same_active_hours": "Matching Active Hours",
    "same_ip_region": "Matching IP Region",
    "journey_stage": "Journey Stage",
    "preferred_channel": "Preferred Channel",
}

def format_top_factors(importances: List[tuple], input_data: dict, top_n: int = 3) -> List[str]:
    """
    Formats the top N driving factors for a specific prediction based on the input data.
    """
    reasons = []
    
    for feat, imp in importances[:top_n]:
        val = input_data.get(feat)
        human_name = HUMAN_READABLE_FEATURES.get(feat, feat)
        
        # Add basic context to the reason
        if isinstance(val, (int, float)):
            if val > 75 and 'score' in feat:
                reasons.append(f"High {human_name}")
            elif val < 30 and 'score' in feat:
                reasons.append(f"Low {human_name}")
            else:
                reasons.append(f"{human_name}")
        else:
             reasons.append(f"{human_name}")
            
    return reasons
