import json
import os
from google import genai
from typing import Dict, Any

# Configure Gemini
API_KEY = "AIzaSyAl4otAvbB9K_2n2y_iU7g-BqADoEM7yrI"
client = genai.Client(api_key=API_KEY)

def generate_message(payload: Dict[str, Any]) -> Dict[str, Any]:
    customer_name = payload.get("customer_name", "Valued Customer")
    product = payload.get("product", "our products")
    journey_stage = payload.get("journey_stage", "Browsing")
    best_action = payload.get("best_action", "do_nothing")
    preferred_channel = payload.get("preferred_channel", "email")
    segment = payload.get("customer_segment", "Anonymous")

    prompt = f"""
    You are an AI enterprise marketing copywriter for MarketTwin AI.
    Generate a highly contextual, personalized, and conversion-oriented message for the following customer.
    
    Customer Profile:
    - Name: {customer_name}
    - Segment: {segment}
    - Journey Stage: {journey_stage}
    - Interested Product: {product}
    - Delivery Channel: {preferred_channel}
    - Next Best Action derived by ML: {best_action}
    
    Rules:
    1. If the channel is WhatsApp or SMS, keep it short, friendly, and use emojis.
    2. If the channel is Email, provide a compelling subject line and body.
    3. If the channel is Push, make it urgent and extremely brief.
    4. Focus on the 'Next Best Action' (e.g. if send_coupon, include a discount offer).
    5. ONLY output valid JSON format with no markdown wrappers or backticks.
    
    Output Format Example:
    {{
      "channel": "{preferred_channel}",
      "message": "The generated text",
      "subject": "The subject line (only if email)",
      "tone": "friendly/urgent/professional",
      "personalization_used": ["name", "product", "discount_based_on_action"]
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip()
        
        # Clean potential markdown wrapping
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
        
    except Exception as e:
        print(f"LLM Generation failed, using intelligent template fallback. Error: {e}")
        return _fallback_generator(payload)

def _fallback_generator(payload: Dict[str, Any]) -> Dict[str, Any]:
    customer_name = payload.get("customer_name", "there")
    product = payload.get("product", "your items")
    channel = payload.get("preferred_channel", "email")
    action = payload.get("best_action", "")
    
    msg = ""
    if "coupon" in action:
        msg = f"Hey {customer_name}! Complete your purchase of {product} today and enjoy a 10% discount on us."
    elif "loyalty" in action:
        msg = f"Hi {customer_name}, as a loyal customer, we've reserved {product} just for you with early access!"
    else:
        msg = f"Hey {customer_name}, still thinking about {product}? We think you'll love it."
        
    return {
        "channel": channel,
        "message": msg,
        "tone": "helpful fallback",
        "personalization_used": ["name", "product", "action"]
    }
