import pandas as pd
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from .journey_generator import JourneyGenerator

class EventGenerator:
    def __init__(self, customers_df: pd.DataFrame, identities_df: pd.DataFrame):
        self.customers_df = customers_df
        self.identities_df = identities_df

    def generate(self) -> pd.DataFrame:
        events: List[Dict[str, Any]] = []
        base_time = datetime.now(timezone.utc) - timedelta(days=90) # 3 months of data
        
        for idx, row in self.customers_df.iterrows():
            customer_id = row['customer_id']
            segment = row['customer_segment']
            pref_category = row['preferred_category']
            
            # Find a device ID for the user
            user_identities = self.identities_df[self.identities_df['customer_id'] == customer_id]
            devices = user_identities[user_identities['identifier_type'] == 'device_id']['identifier_value'].tolist()
            device_id = devices[0] if devices else f"DEV_{uuid.uuid4().hex[:8].upper()}"
            
            # Generate 1 to 5 journeys for each customer
            num_journeys = random.randint(1, 5)
            customer_time = base_time + timedelta(days=random.randint(0, 30))
            
            for _ in range(num_journeys):
                journey = JourneyGenerator.generate_journey(segment, pref_category)
                
                cart_value = 0.0
                converted = False
                current_stage = "anonymous"
                
                for step in journey:
                    event_type = step["type"]
                    category = step.get("category", pref_category)
                    
                    price = round(random.uniform(10.0, 500.0), 2) if "product" in event_type else 0.0
                    
                    if event_type == "add_to_cart":
                        cart_value += price
                        current_stage = "cart_active"
                    elif event_type == "cart_abandon":
                        current_stage = "cart_abandoned"
                    elif event_type == "purchase":
                        converted = True
                        current_stage = "converted"
                        
                    channel = "website"
                    if "email" in event_type: channel = "email"
                    elif "whatsapp" in event_type: channel = "whatsapp"
                    elif "push" in event_type: channel = "push"
                    elif "sms" in event_type: channel = "sms"
                    
                    events.append({
                        "event_id": f"EVT_{uuid.uuid4().hex[:8].upper()}",
                        "customer_id": customer_id,
                        "timestamp": customer_time.isoformat(),
                        "device_id": device_id,
                        "channel": channel,
                        "event_type": event_type,
                        "product_category": category if event_type in ("product_view", "add_to_cart", "purchase") else None,
                        "product_id": f"PROD_{random.randint(100, 999)}" if event_type in ("product_view", "add_to_cart", "purchase") else None,
                        "price": price if price > 0 else None,
                        "session_duration": random.randint(10, 300) if event_type == "session_start" else None,
                        "cart_value": cart_value if cart_value > 0 else None,
                        "journey_stage": current_stage,
                        "converted": converted
                    })
                    
                    # Advance time between events in the journey (minutes to hours)
                    customer_time += timedelta(minutes=random.randint(1, 120))
                
                # Advance time between journeys (days)
                customer_time += timedelta(days=random.randint(1, 15))

        # Sort by timestamp
        df = pd.DataFrame(events)
        df = df.sort_values(by="timestamp").reset_index(drop=True)
        return df
