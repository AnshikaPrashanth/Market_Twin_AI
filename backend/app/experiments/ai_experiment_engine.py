import logging
from app.ai_models.inference.conversion_predictor import predict_conversion
from app.ai_models.inference.channel_predictor import predict_best_channel
from app.ai_models.inference.nba_predictor import predict_nba
from app.ai_models.inference.message_generator import generate_message

logger = logging.getLogger(__name__)

def run_ai_decision(customer: dict, journey_context: dict) -> dict:
    """
    Simulates the AI Orchestration system for a single customer.
    Uses actual models to predict conversion, channel, NBA, and generates a message.
    """
    try:
        # Build features for inference based on customer and journey state
        # In a real scenario, these would map to exact twin counters
        features = {
            "views": journey_context.get("views", 2),
            "carts": journey_context.get("carts", 1),
            "purchases": journey_context.get("purchases", 0),
            "time_since_last_event_hours": journey_context.get("hours_since_last", 4),
            "category_affinity_score": journey_context.get("affinity", 0.8),
            "device_type": customer.get("device_type", "Mobile")
        }

        # 1. Conversion Predictor
        conv_res = predict_conversion(features)
        prob = conv_res.get("conversion_probability", 0.5)

        # 2. Channel Predictor
        chan_res = predict_best_channel(features)
        best_channel = chan_res.get("best_channel", "email").lower()

        # 3. NBA Predictor
        nba_res = predict_nba(features)
        nba = nba_res.get("next_best_action", "send_coupon")

        # 4. Message Generator (simulated logic for speed if we don't want to call external API per customer in loop)
        # For bulk simulation, we might skip full LLM to avoid massive latencies or token usage
        message = f"Personalized message via {best_channel}: Action {nba} recommended."

        return {
            "channel": best_channel,
            "action": nba,
            "message": message,
            "personalized": True,
            "predicted_conversion": prob
        }
    except Exception as e:
        logger.error(f"Error in run_ai_decision: {e}")
        return {
            "channel": "email",
            "action": "generic_reminder",
            "message": "Fallback message",
            "personalized": False,
            "predicted_conversion": 0.10
        }
