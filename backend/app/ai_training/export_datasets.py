import os
import json
import pandas as pd
from typing import Dict, Any, List

class DatasetExporter:
    def __init__(self, output_dir: str = "e:/epsilon/market_twin_ai/backend/data"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            
    def export_csv(self, df: pd.DataFrame, filename: str):
        filepath = os.path.join(self.output_dir, filename)
        df.to_csv(filepath, index=False)
        print(f"Exported {len(df)} rows to {filepath}")
        
    def export_message_samples(self):
        # Generate personalized message samples based on the story users
        samples = [
            {
                "customer_name": "Rahul",
                "journey_stage": "cart_abandoned",
                "preferred_channel": "whatsapp",
                "product": "Sony Noise Cancelling Headphones",
                "generated_message": "Hey Rahul! We noticed you left the Sony Headphones in your cart. They are selling out fast—complete your purchase now and we'll apply a 10% discount. 🎧"
            },
            {
                "customer_name": "Priya",
                "journey_stage": "Loyal",
                "preferred_channel": "email",
                "product": "Zara Summer Collection",
                "generated_message": "Hi Priya, as a Platinum member, we're giving you 24-hour early access to our exclusive Summer Collection. Check out the latest styles curated just for you!"
            },
            {
                "customer_name": "Arjun",
                "journey_stage": "Browsing",
                "preferred_channel": "push",
                "product": "PS5 Controller",
                "generated_message": "🎮 Level up, Arjun! The PS5 Controller you were looking at is back in stock. Tap to view."
            },
            {
                "customer_name": "Sneha",
                "journey_stage": "Churn Risk",
                "preferred_channel": "email",
                "product": "Indoor Plants",
                "generated_message": "We miss you, Sneha! 🌱 It's been a while. Here is a 20% off coupon for your next purchase of indoor plants to bring some green into your home."
            }
        ]
        
        filepath = os.path.join(self.output_dir, "message_personalization_samples.json")
        with open(filepath, 'w') as f:
            json.dump(samples, f, indent=4)
        print(f"Exported message personalization samples to {filepath}")
