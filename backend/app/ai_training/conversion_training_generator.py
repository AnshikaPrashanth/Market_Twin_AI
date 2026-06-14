import pandas as pd
import random
from typing import List, Dict, Any

class ConversionTrainingGenerator:
    def __init__(self, customers_df: pd.DataFrame, events_df: pd.DataFrame):
        self.customers_df = customers_df
        self.events_df = events_df

    def generate(self) -> pd.DataFrame:
        training_data: List[Dict[str, Any]] = []

        # We create training examples by looking at the customer's state
        # right before a conversion (positive example) or churn (negative example)
        
        for idx, row in self.customers_df.iterrows():
            customer_id = row['customer_id']
            cust_events = self.events_df[self.events_df['customer_id'] == customer_id].copy()
            
            if cust_events.empty:
                continue

            # Calculate some basic behavioral aggregations
            product_views = len(cust_events[cust_events['event_type'] == 'product_view'])
            cart_count = len(cust_events[cust_events['event_type'] == 'add_to_cart'])
            abandonments = len(cust_events[cust_events['event_type'] == 'cart_abandon'])
            converted = len(cust_events[cust_events['event_type'] == 'purchase']) > 0
            
            # Base Intent Score (simplified calculation for synthetic data)
            intent_score = 10 + (product_views * 5) + (cart_count * 15)
            if converted:
                intent_score += 30
            intent_score = min(100, intent_score)
            
            # Base Fatigue Score
            messages_sent = len(cust_events[cust_events['event_type'].str.endswith('_sent')])
            messages_clicked = len(cust_events[cust_events['event_type'].str.endswith('_click')])
            fatigue_score = 10 + (messages_sent * 15) - (messages_clicked * 20)
            fatigue_score = max(0, min(100, fatigue_score))
            
            # Churn risk
            churn_risk = 50 + (abandonments * 15) - (cart_count * 5) + (fatigue_score * 0.2)
            churn_risk = max(0, min(100, churn_risk))
            
            # Conversion probability (Ground truth approximation for training)
            # High intent + low fatigue -> High conversion
            conversion_prob = (intent_score * 0.6) - (fatigue_score * 0.3) - (churn_risk * 0.1) + 20
            conversion_prob = max(0.0, min(100.0, conversion_prob)) / 100.0
            
            # Force converted flag to align somewhat with high probability
            if converted and conversion_prob < 0.5:
                conversion_prob = random.uniform(0.6, 0.95)
            if not converted and conversion_prob > 0.8:
                conversion_prob = random.uniform(0.1, 0.4)

            training_data.append({
                "customer_id": customer_id,
                "intent_score": intent_score,
                "churn_risk": round(churn_risk, 2),
                "fatigue_score": fatigue_score,
                "product_views": product_views,
                "cart_count": cart_count,
                "abandonments": abandonments,
                "cart_value": cust_events['cart_value'].max() if not pd.isna(cust_events['cart_value'].max()) else 0.0,
                "journey_stage": row['customer_segment'], # Approximation
                "preferred_channel": row['preferred_channel'],
                "active_hour": row['active_hours'],
                "days_since_last_purchase": random.randint(1, 100) if converted else None,
                "conversion_probability": round(conversion_prob, 4),
                "converted": converted
            })

        return pd.DataFrame(training_data)
