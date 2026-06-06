class IntentScoreEngine:
    """
    Computes buying intent based on page views, cart additions,
    repeated product interactions, and recency of activities.
    Formula: Intent = views*3 + carts*20 + repeated_views*10 + recent_activity*15 (capped at 100)
    """
    @staticmethod
    def calculate(raw_counters: dict) -> int:
        views = raw_counters.get("views", 0)
        carts = raw_counters.get("carts", 0)
        repeated_views = raw_counters.get("repeated_views", 0)
        recent_activity = raw_counters.get("recent_activity", 0)  # Binary indicator (1 if active in last 24h else 0)

        score = (views * 3) + (carts * 20) + (repeated_views * 10) + (recent_activity * 15)
        return min(100, max(0, score))
