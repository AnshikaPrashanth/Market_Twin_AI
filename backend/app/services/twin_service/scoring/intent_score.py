class IntentScoreEngine:
    """
    Computes buying intent based on page views, cart additions,
    repeated product interactions, abandonments, and recency of activities.
    """
    @staticmethod
    def calculate(raw_counters: dict) -> int:
        views = raw_counters.get("views", 0)
        carts = raw_counters.get("carts", 0)
        repeated_views = raw_counters.get("repeated_views", 0)
        abandonments = raw_counters.get("abandonments", 0)
        purchases = raw_counters.get("purchases", 0)
        recent_activity = raw_counters.get("recent_activity", 0)

        score = 0

        # Weak signal
        score += views * 5

        # Strong signal
        score += carts * 25

        # Stronger than normal view because user returned to same item
        score += repeated_views * 8

        # Very strong commercial signal
        score += abandonments * 15

        # Recent live activity boost
        if recent_activity:
            score += 10

        # Purchase means maximum realized intent
        if purchases > 0:
            score += 30

        return max(0, min(100, int(score)))
