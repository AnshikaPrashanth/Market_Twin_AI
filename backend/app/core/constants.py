# Valid events supported by the ingestion layer
VALID_EVENTS = [
    "product_view",
    "add_to_cart",
    "remove_from_cart",
    "cart_abandoned",
    "cart_abandon",
    "purchase",
    "email_sent",
    "email_open",
    "email_click",
    "whatsapp_sent",
    "whatsapp_click",
    "sms_click",
    "push_sent",
    "push_click",
    "banner_click",
    "session_start",
    "session_end",
    "unsubscribe"
]
# Identity confidence engine scoring details
CONFIDENCE_WEIGHT_CITY = 15
CONFIDENCE_WEIGHT_DEVICE = 30
CONFIDENCE_WEIGHT_CATEGORY = 25
CONFIDENCE_WEIGHT_TIME_PATTERN = 20
CONFIDENCE_THRESHOLD = 70

# Digital Twin journey stages
STAGE_ANONYMOUS = "anonymous"
STAGE_BROWSING = "browsing"
STAGE_INTERESTED = "interested"
STAGE_CART_ACTIVE = "cart_active"
STAGE_CART_ABANDONED = "cart_abandoned"
STAGE_RE_ENGAGED = "re_engaged"
STAGE_CONVERTED = "converted"
STAGE_LOYAL = "loyal"
STAGE_DORMANT = "dormant"
STAGE_CHURN_RISK = "churn_risk"

# Digital Twin segmentation categories
SEG_HIGH_INTENT_ABANDONER = "High Intent Cart Abandoner"
SEG_PREMIUM_LOYALIST = "Premium Loyalist"
SEG_WINDOW_SHOPPER = "Window Shopper"
SEG_DORMANT = "Dormant Customer"
SEG_STANDARD = "Standard Customer"
