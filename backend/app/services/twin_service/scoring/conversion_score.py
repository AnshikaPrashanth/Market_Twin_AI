class ConversionScoreEngine:
    """
    Computes overall conversion probability combining intent, channel affinities,
    discount responses, discounted by message fatigue.
    Formula: Conversion = 0.4*intent_score + 0.3*channel_affinity + 0.2*discount_affinity - 0.1*fatigue_score (0-100)
    """
    @staticmethod
    def calculate(intent_score: int, fatigue_score: int, raw_counters: dict) -> int:
        channel_affinity = raw_counters.get("channel_affinity", 50)  # Default average affinity
        discount_affinity = raw_counters.get("discount_affinity", 50)  # Default average affinity

        score = (0.4 * intent_score) + (0.3 * channel_affinity) + (0.2 * discount_affinity) - (0.1 * fatigue_score)
        return min(100, max(0, int(score)))
