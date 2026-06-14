def compare_metrics(baseline: dict, ai: dict) -> dict:
    """
    Compares baseline and AI metrics, returning the absolute values and percentage lift.
    """
    def calc_lift(b_val, a_val):
        if b_val == 0:
            return 100 if a_val > 0 else 0
        return round(((a_val - b_val) / b_val) * 100, 1)

    return {
        "conversion_rate": {
            "baseline": baseline.get("conversion_rate", 0),
            "ai": ai.get("conversion_rate", 0),
            "lift": calc_lift(baseline.get("conversion_rate", 0), ai.get("conversion_rate", 0))
        },
        "cart_recovery": {
            "baseline": baseline.get("cart_recovery", 0),
            "ai": ai.get("cart_recovery", 0),
            "lift": calc_lift(baseline.get("cart_recovery", 0), ai.get("cart_recovery", 0))
        },
        "revenue_recovered": {
            "baseline": baseline.get("revenue_recovered", 0),
            "ai": ai.get("revenue_recovered", 0),
            # "lift" for revenue can be a simple multiplier or percentage
            "lift": calc_lift(baseline.get("revenue_recovered", 0), ai.get("revenue_recovered", 0))
        },
        "whatsapp_ctr": {
            "baseline": baseline.get("whatsapp_ctr", 0),
            "ai": ai.get("whatsapp_ctr", 0),
            "lift": calc_lift(baseline.get("whatsapp_ctr", 0), ai.get("whatsapp_ctr", 0))
        }
    }
