from app.core.constants import (
    SEG_HIGH_INTENT_ABANDONER,
    SEG_PREMIUM_LOYALIST,
    SEG_WINDOW_SHOPPER,
    SEG_DORMANT,
    SEG_STANDARD
)

class SegmentEngine:
    """
    Categorizes digital twins into strategic target audience segments based on intent,
    purchase history, activity status, and spend.
    """
    @staticmethod
    def assign_segment(intent_score: int, raw_counters: dict) -> str:
        inactive_days = raw_counters.get("inactive_days", 0)
        purchases = raw_counters.get("purchases", 0)
        views = raw_counters.get("views", 0)
        carts = raw_counters.get("carts", 0)
        total_spend = raw_counters.get("total_spend", 0.0)

        # 1. Dormant Segment
        if inactive_days > 30:
            return SEG_DORMANT

        # 2. Premium Loyalist Segment
        if total_spend > 20000:
            return SEG_PREMIUM_LOYALIST

        # 3. High Intent Cart Abandoner Segment
        if intent_score > 75 and purchases == 0:
            return SEG_HIGH_INTENT_ABANDONER

        # 4. Window Shopper Segment
        if views > 10 and carts <= 1:
            return SEG_WINDOW_SHOPPER

        # 5. Fallback Segment
        return SEG_STANDARD
