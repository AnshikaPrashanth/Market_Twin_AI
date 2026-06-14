def run_baseline_decision(customer: dict, journey_context: dict) -> dict:
    """
    Simulates a traditional/static marketing system decision.
    All customers receive a generic email with the same timing and action,
    regardless of intent, segment, or channel affinity.
    """
    return {
        "channel": "email",
        "action": "generic_reminder",
        "message": "Complete your purchase now.",
        "personalized": False,
        "predicted_conversion": 0.10  # Static baseline probability
    }
