class FatigueScoreEngine:
    """
    Computes communication fatigue risk using messages sent vs. link clicks
    recorded in the last 48 hours.
    Formula: Fatigue = messages_last_48h*20 - clicks_last_48h*10 (0-100)
    """
    @staticmethod
    def calculate(raw_counters: dict) -> int:
        messages_last_48h = raw_counters.get("messages_last_48h", 0)
        clicks_last_48h = raw_counters.get("clicks_last_48h", 0)

        score = (messages_last_48h * 20) - (clicks_last_48h * 10)
        return min(100, max(0, score))
