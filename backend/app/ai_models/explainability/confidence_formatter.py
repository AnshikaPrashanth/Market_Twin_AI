def format_confidence(probability: float) -> dict:
    """
    Converts a raw probability [0, 1] to a percentage and assigns a qualitative confidence tier.
    """
    confidence_pct = round(probability * 100, 1)
    
    if confidence_pct >= 85:
        tier = "High"
    elif confidence_pct >= 60:
        tier = "Medium"
    else:
        tier = "Low"
        
    return {
        "score": probability,
        "percentage": confidence_pct,
        "tier": tier
    }
