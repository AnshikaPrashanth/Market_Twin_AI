import pandas as pd
import random
from typing import List, Dict, Any

class ChannelTrainingGenerator:
    def __init__(self, customers_df: pd.DataFrame, events_df: pd.DataFrame):
        self.customers_df = customers_df
        self.events_df = events_df

    def generate(self) -> pd.DataFrame:
        training_data: List[Dict[str, Any]] = []

        for idx, row in self.customers_df.iterrows():
            customer_id = row['customer_id']
            cust_events = self.events_df[self.events_df['customer_id'] == customer_id]
            
            age = row['age']
            age_group = "18-24" if age < 25 else "25-34" if age < 35 else "35-50" if age <= 50 else "50+"
            
            # Calculate engagement rates
            email_sent = len(cust_events[cust_events['event_type'] == 'email_sent'])
            email_click = len(cust_events[cust_events['event_type'] == 'email_click'])
            email_rate = round(email_click / email_sent, 2) if email_sent > 0 else random.uniform(0, 0.2)
            
            wa_sent = len(cust_events[cust_events['event_type'] == 'whatsapp_sent'])
            wa_click = len(cust_events[cust_events['event_type'] == 'whatsapp_click'])
            wa_rate = round(wa_click / wa_sent, 2) if wa_sent > 0 else random.uniform(0, 0.4)
            
            push_sent = len(cust_events[cust_events['event_type'] == 'push_sent'])
            push_click = len(cust_events[cust_events['event_type'] == 'push_click'])
            push_rate = round(push_click / push_sent, 2) if push_sent > 0 else random.uniform(0, 0.3)
            
            # Derive historical best channel
            rates = {'email': email_rate, 'whatsapp': wa_rate, 'push': push_rate}
            best_channel = max(rates, key=rates.get)
            
            # Add some behavioral correlation noise
            if age_group == "18-24" and best_channel == 'email' and random.random() > 0.3:
                best_channel = 'whatsapp'
            if row['profession'] in ("Manager", "Doctor") and random.random() > 0.4:
                best_channel = 'email'
            
            training_data.append({
                "customer_id": customer_id,
                "age_group": age_group,
                "device_type": "Mobile" if best_channel in ("whatsapp", "push") else "Desktop",
                "activity_time": row['active_hours'],
                "preferred_category": row['preferred_category'],
                "engagement_level": "High" if max(rates.values()) > 0.5 else "Medium" if max(rates.values()) > 0.2 else "Low",
                "email_click_rate": email_rate,
                "whatsapp_click_rate": wa_rate,
                "push_click_rate": push_rate,
                "fatigue_score": random.randint(10, 90),
                "historical_best_channel": best_channel
            })

        return pd.DataFrame(training_data)
