def calculate_metrics(results: list) -> dict:
    """
    Calculates aggregate metrics from a list of simulated results.
    Each result contains data from outcome_tracker.
    """
    total = len(results)
    if total == 0:
        return {}

    converted_count = sum(1 for r in results if r.get("converted"))
    recovered_carts = sum(1 for r in results if r.get("converted") and r.get("journey_stage") == "cart_abandoned")
    abandoned_carts = sum(1 for r in results if r.get("journey_stage") == "cart_abandoned")
    
    revenue = sum(r.get("revenue", 0) for r in results)
    
    # AI specific stats (not applicable to baseline, but we can compute them anyway)
    ai_actions = sum(1 for r in results if r.get("personalized"))
    successful_ai_actions = sum(1 for r in results if r.get("personalized") and r.get("converted"))
    
    whatsapp_sent = sum(1 for r in results if r.get("channel") == "whatsapp")
    whatsapp_converted = sum(1 for r in results if r.get("channel") == "whatsapp" and r.get("converted"))
    
    return {
        "conversion_rate": round((converted_count / total) * 100, 1),
        "cart_recovery": round((recovered_carts / abandoned_carts * 100) if abandoned_carts > 0 else 0, 1),
        "revenue_recovered": revenue,
        "nba_success_rate": round((successful_ai_actions / ai_actions * 100) if ai_actions > 0 else 0, 1),
        "whatsapp_ctr": round((whatsapp_converted / whatsapp_sent * 100) if whatsapp_sent > 0 else 0, 1)
    }
