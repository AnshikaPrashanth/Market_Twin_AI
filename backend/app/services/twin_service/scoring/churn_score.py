class ChurnScoreEngine:
    """
    Computes user churn risk using inactivity days, ignored communications,
    shopping cart abandonment events, offset by purchase conversions.
    Formula: Churn = inactive_days*2 + ignored_messages*10 + abandonments*15 - purchases*20 (0-100)
    """
    @staticmethod
    def calculate(raw_counters: dict) -> int:
        inactive_days = raw_counters.get("inactive_days", 0)
        ignored_messages = raw_counters.get("ignored_messages", 0)
        abandonments = raw_counters.get("abandonments", 0)
        purchases = raw_counters.get("purchases", 0)

        score = (inactive_days * 2) + (ignored_messages * 10) + (abandonments * 15) - (purchases * 20)
        return min(100, max(0, score))
