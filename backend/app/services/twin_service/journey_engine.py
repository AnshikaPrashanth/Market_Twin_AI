from app.core.constants import (
    STAGE_ANONYMOUS, STAGE_BROWSING, STAGE_INTERESTED, STAGE_CART_ACTIVE,
    STAGE_CART_ABANDONED, STAGE_RE_ENGAGED, STAGE_CONVERTED, STAGE_LOYAL,
    STAGE_DORMANT, STAGE_CHURN_RISK
)

class JourneyEngine:
    """
    Main state machine determining transitions between customer stages based on event
    types and historical counts.
    """
    @staticmethod
    def transition(current_stage: str, event_type: str, raw_counters: dict) -> str:
        inactive_days = raw_counters.get("inactive_days", 0)
        purchases = raw_counters.get("purchases", 0)
        views = raw_counters.get("views", 0)
        carts = raw_counters.get("carts", 0)

        # 1. Dormancy rules override regular event-based rules
        if inactive_days > 30:
            return STAGE_DORMANT
        if inactive_days > 14:
            return STAGE_CHURN_RISK

        # 2. Sequential triggers
        if event_type == "purchase":
            if purchases >= 3:
                return STAGE_LOYAL
            return STAGE_CONVERTED

        if event_type == "cart_abandon":
            return STAGE_CART_ABANDONED

        if event_type == "add_to_cart":
            return STAGE_CART_ACTIVE

        # Re-engaged if they return from an inactive/abandoned stage via a marketing click
        marketing_clicks = ("email_click", "whatsapp_click", "push_click", "banner_click")
        if event_type in marketing_clicks and current_stage in (STAGE_CART_ABANDONED, STAGE_DORMANT, STAGE_CHURN_RISK):
            return STAGE_RE_ENGAGED

        if event_type == "product_view":
            if carts > 0:
                # If they have items in cart, keep them in cart active stage
                return STAGE_CART_ACTIVE
            if views > 5:
                return STAGE_INTERESTED
            return STAGE_BROWSING

        return current_stage or STAGE_ANONYMOUS
