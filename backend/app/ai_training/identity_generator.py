import pandas as pd
import random
import uuid
from typing import List, Dict, Any
from .synthetic_profiles import STORY_USERS

class IdentityGenerator:
    def __init__(self, customers_df: pd.DataFrame):
        self.customers_df = customers_df

    def generate(self) -> pd.DataFrame:
        identities: List[Dict[str, Any]] = []

        # 1. Base Identity Generation for all users
        for idx, row in self.customers_df.iterrows():
            customer_id = row['customer_id']
            email_val = f"{row['name'].lower().replace(' ', '')}{random.randint(10, 999)}@gmail.com"
            device_val = f"DEV_{uuid.uuid4().hex[:8].upper()}"
            
            # Primary Email
            identities.append(self._create_record(customer_id, "email", email_val, 1.0, "deterministic"))
            
            # Primary Device
            identities.append(self._create_record(customer_id, "device_id", device_val, 1.0, "deterministic"))
            
            # Phone number (some users)
            if random.random() > 0.3:
                phone_val = f"91{random.randint(7000000000, 9999999999)}"
                identities.append(self._create_record(customer_id, "phone", phone_val, 1.0, "deterministic"))

        # 2. STORY USER EDGE CASES (Specific edge case handling)
        
        # Case 1: Same user multiple devices (Rahul)
        rahul = next((u for u in STORY_USERS if u['name'] == 'Rahul'), None)
        if rahul:
            identities.append(self._create_record(rahul['customer_id'], "email", "rahul@gmail.com", 1.0, "deterministic"))
            identities.append(self._create_record(rahul['customer_id'], "device_id", "DEV_RAHUL_PHONE", 1.0, "deterministic"))
            identities.append(self._create_record(rahul['customer_id'], "device_id", "DEV_RAHUL_LAPTOP", 1.0, "deterministic"))
            identities.append(self._create_record(rahul['customer_id'], "device_id", "DEV_RAHUL_TABLET", 1.0, "deterministic"))
            identities.append(self._create_record(rahul['customer_id'], "email_hash", rahul['email_hash'], 1.0, "deterministic"))
            identities.append(self._create_record(rahul['customer_id'], "phone_hash", rahul['phone_hash'], 1.0, "deterministic"))

        # Case 2: Different users same device (Priya & Arjun sharing DEV_FAMILY_LAPTOP)
        priya = next((u for u in STORY_USERS if u['name'] == 'Priya'), None)
        arjun = next((u for u in STORY_USERS if u['name'] == 'Arjun'), None)
        
        if priya and arjun:
            identities.append(self._create_record(priya['customer_id'], "device_id", "DEV_FAMILY_LAPTOP", 0.6, "probabilistic"))
            identities.append(self._create_record(arjun['customer_id'], "device_id", "DEV_FAMILY_LAPTOP", 0.4, "probabilistic"))
            identities.append(self._create_record(priya['customer_id'], "email", "priya@gmail.com", 1.0, "deterministic"))
            identities.append(self._create_record(arjun['customer_id'], "email", "arjun@gmail.com", 1.0, "deterministic"))
            identities.append(self._create_record(priya['customer_id'], "email_hash", priya['email_hash'], 1.0, "deterministic"))
            identities.append(self._create_record(arjun['customer_id'], "email_hash", arjun['email_hash'], 1.0, "deterministic"))
            identities.append(self._create_record(priya['customer_id'], "phone_hash", priya['phone_hash'], 1.0, "deterministic"))
            identities.append(self._create_record(arjun['customer_id'], "phone_hash", arjun['phone_hash'], 1.0, "deterministic"))


        # Case 3: Anonymous -> Known (Sneha starts as anonymous device, upgrades)
        sneha = next((u for u in STORY_USERS if u['name'] == 'Sneha'), None)
        if sneha:
            identities.append(self._create_record(sneha['customer_id'], "device_id", "DEV_88", 1.0, "deterministic"))
            identities.append(self._create_record(sneha['customer_id'], "email", "sneha@gmail.com", 1.0, "deterministic"))
            identities.append(self._create_record(sneha['customer_id'], "email_hash", sneha['email_hash'], 1.0, "deterministic"))
            identities.append(self._create_record(sneha['customer_id'], "phone_hash", sneha['phone_hash'], 1.0, "deterministic"))

        # Case 4: Weak Probabilistic Matches for random users
        random_customers = self.customers_df.sample(50)
        for _, row in random_customers.iterrows():
            customer_id = row['customer_id']
            # Link a cookie probablistically
            cookie_val = f"COOKIE_{uuid.uuid4().hex[:12].upper()}"
            identities.append(self._create_record(customer_id, "cookie", cookie_val, random.uniform(0.5, 0.8), "probabilistic"))

        return pd.DataFrame(identities)

    def _create_record(self, customer_id: str, id_type: str, id_value: str, confidence: float, matched_by: str) -> Dict[str, Any]:
        return {
            "identity_id": f"ID_{uuid.uuid4().hex[:8].upper()}",
            "customer_id": customer_id,
            "identifier_type": id_type,
            "identifier_value": id_value,
            "device_type": random.choice(["Mobile", "Desktop", "Tablet"]) if id_type == "device_id" else None,
            "browser": random.choice(["Chrome", "Safari", "Edge", "Firefox"]) if id_type in ("device_id", "cookie") else None,
            "ip_region": random.choice(["MH", "DL", "KA", "TN"]),
            "active_hours": random.choice(["Morning", "Afternoon", "Evening", "Night"]),
            "confidence": round(confidence, 2),
            "matched_by": matched_by
        }
