import pandas as pd
import random
from typing import List, Dict, Any

class NBATrainingGenerator:
    def __init__(self, conversion_df: pd.DataFrame):
        self.conversion_df = conversion_df
        
    def generate(self) -> pd.DataFrame:
        training_data: List[Dict[str, Any]] = []
        
        ACTIONS = [
            "send_coupon", "send_email", "send_whatsapp", "send_push", 
            "recommend_products", "wait", "do_nothing", "loyalty_reward"
        ]
        
        for idx, row in self.conversion_df.iterrows():
            intent = row['intent_score']
            fatigue = row['fatigue_score']
            stage = row['journey_stage']
            converted = row['converted']
            
            recommended_action = "do_nothing"
            
            # NBA Logic rules to generate realistic ground truth
            if fatigue > 80:
                recommended_action = "do_nothing"
            elif stage == "Cart Active" or row['abandonments'] > 0:
                recommended_action = "send_coupon" if intent > 60 else "send_whatsapp"
            elif stage == "Loyal":
                recommended_action = "loyalty_reward"
            elif stage == "Browsing":
                recommended_action = "recommend_products"
            elif intent > 50 and fatigue < 50:
                recommended_action = "send_" + row['preferred_channel']
                if recommended_action not in ACTIONS:
                    recommended_action = "send_email"
            else:
                recommended_action = "wait"

            # Occasionally add noise so the model actually has to learn probabilistically
            if random.random() > 0.9:
                recommended_action = random.choice(ACTIONS)
                
            channel_used = "none"
            if "email" in recommended_action: channel_used = "email"
            elif "whatsapp" in recommended_action: channel_used = "whatsapp"
            elif "push" in recommended_action: channel_used = "push"
            elif "sms" in recommended_action: channel_used = "sms"
            elif "coupon" in recommended_action: channel_used = row['preferred_channel']

            training_data.append({
                "customer_id": row['customer_id'],
                "intent_score": intent,
                "conversion_probability": row['conversion_probability'],
                "churn_risk": row['churn_risk'],
                "fatigue_score": fatigue,
                "journey_stage": stage,
                "preferred_channel": row['preferred_channel'],
                "recommended_action": recommended_action,
                "channel_used": channel_used,
                "converted": converted
            })
            
        return pd.DataFrame(training_data)
