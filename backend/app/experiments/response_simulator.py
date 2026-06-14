import random

def simulate_response(decision: dict, customer: dict, journey_context: dict) -> dict:
    """
    Simulates if a customer will convert or respond based on the quality of the decision.
    """
    # Base probability
    prob = 0.10
    
    # AI logic: personalized and channel specific optimizations
    if decision.get("personalized"):
        prob += 0.20
        
    # Example logic: if preferred channel matches
    preferred_channel = customer.get("preferred_channel", "email").lower()
    if decision.get("channel") == preferred_channel:
        prob += 0.25
        
    # NBA impact based on journey
    stage = journey_context.get("journey_stage", "browsing")
    action = decision.get("action", "")
    
    if stage == "cart_abandoned" and "coupon" in action:
        prob += 0.15
        
    if stage == "browsing" and "recommend" in action:
        prob += 0.10
        
    # High conversion prediction
    predicted_conv = decision.get("predicted_conversion", 0)
    if predicted_conv > 0.6:
        prob += 0.15
        
    # Randomly cap prob between 0 and 1
    prob = min(max(prob, 0.0), 0.95)
    
    converted = random.random() < prob
    
    # Calculate revenue if converted
    revenue = 0
    if converted:
        # random cart value or journey cart value
        revenue = journey_context.get("cart_value", random.randint(500, 5000))
        
    return {
        "converted": converted,
        "revenue": revenue,
        "response_time_minutes": random.randint(5, 120) if converted else None,
        "probability_used": prob
    }
