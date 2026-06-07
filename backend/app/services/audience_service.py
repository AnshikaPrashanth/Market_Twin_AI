from typing import List, Dict, Any

class AudienceService:
    def get_segments(self) -> List[Dict[str, Any]]:
        # Hardcoded demo values per instructions
        return [
          {
            "segment": "High Intent Cart Abandoners",
            "size": 1240,
            "avg_ltv": 4200,
            "avg_intent": 82,
            "avg_churn": 52,
            "avg_fatigue": 34,
            "best_channel": "WhatsApp",
            "revenue_opportunity": 320000,
            "recommended_strategy": "Cart recovery coupon"
          },
          {
            "segment": "Premium Loyalists",
            "size": 420,
            "avg_ltv": 18500,
            "avg_intent": 71,
            "avg_churn": 12,
            "avg_fatigue": 22,
            "best_channel": "Email",
            "revenue_opportunity": 510000,
            "recommended_strategy": "Early access campaign"
          },
          {
            "segment": "Window Shoppers",
            "size": 3450,
            "avg_ltv": 1200,
            "avg_intent": 35,
            "avg_churn": 65,
            "avg_fatigue": 15,
            "best_channel": "Website",
            "revenue_opportunity": 140000,
            "recommended_strategy": "Browsing retargeting"
          },
          {
            "segment": "Deal Seekers",
            "size": 2100,
            "avg_ltv": 2800,
            "avg_intent": 55,
            "avg_churn": 45,
            "avg_fatigue": 40,
            "best_channel": "Push",
            "revenue_opportunity": 220000,
            "recommended_strategy": "Flash sale alerts"
          },
          {
            "segment": "Dormant Customers",
            "size": 8900,
            "avg_ltv": 800,
            "avg_intent": 10,
            "avg_churn": 90,
            "avg_fatigue": 5,
            "best_channel": "Email",
            "revenue_opportunity": 85000,
            "recommended_strategy": "Win-back drip campaign"
          }
        ]

    def get_fatigue_heatmap(self) -> List[Dict[str, Any]]:
        segments = ["High Intent Cart Abandoners", "Premium Loyalists", "Window Shoppers", "Deal Seekers", "Dormant Customers"]
        channels = ["WhatsApp", "Email", "Push", "Website"]
        
        # Generates a visually interesting heatmap distribution for demo
        base_fatigue = {
            "High Intent Cart Abandoners": {"WhatsApp": 62, "Email": 28, "Push": 71, "Website": 15},
            "Premium Loyalists": {"WhatsApp": 35, "Email": 45, "Push": 22, "Website": 12},
            "Window Shoppers": {"WhatsApp": 10, "Email": 20, "Push": 45, "Website": 35},
            "Deal Seekers": {"WhatsApp": 55, "Email": 60, "Push": 85, "Website": 40},
            "Dormant Customers": {"WhatsApp": 5, "Email": 15, "Push": 10, "Website": 5}
        }
        
        results = []
        for seg in segments:
            for ch in channels:
                results.append({
                    "segment": seg,
                    "channel": ch,
                    "fatigue": base_fatigue[seg][ch]
                })
        return results
