import pandas as pd
import random
import uuid
from typing import List, Dict, Any

from faker import Faker

from .synthetic_profiles import (
    STORY_USERS, GENDERS, GENDER_WEIGHTS, CITIES, CITY_WEIGHTS, PROFESSIONS,
    CATEGORIES, ACTIVE_HOURS, LOYALTY_LEVELS, SIGNUP_SOURCES, SEGMENTS,
    generate_age, generate_income_group, generate_preferred_channel
)

fake = Faker('en_IN')

class CustomerGenerator:
    def __init__(self, num_customers: int = 1000):
        self.num_customers = num_customers
        
    def generate(self) -> pd.DataFrame:
        customers: List[Dict[str, Any]] = []
        
        # 1. Add Story-driven users
        for user in STORY_USERS:
            customers.append({
                "customer_id": user["customer_id"],
                "name": user["name"],
                "age": user["age"],
                "gender": user["gender"],
                "city": user["city"],
                "profession": user["profession"],
                "income_group": user["income_group"],
                "preferred_category": user["preferred_category"],
                "active_hours": user["active_hours"],
                "preferred_channel": user["preferred_channel"],
                "loyalty_level": user["loyalty_level"],
                "signup_source": user["signup_source"],
                "customer_segment": user["customer_segment"]
            })
            
        # 2. Add random users
        remaining = self.num_customers - len(STORY_USERS)
        
        for _ in range(remaining):
            gender = random.choices(GENDERS, weights=GENDER_WEIGHTS)[0]
            if gender == "Male":
                name = fake.first_name_male()
            elif gender == "Female":
                name = fake.first_name_female()
            else:
                name = fake.first_name()
                
            age = generate_age()
            profession = random.choice(PROFESSIONS)
            active_hours = random.choice(ACTIVE_HOURS)
            
            customers.append({
                "customer_id": f"CUST_{uuid.uuid4().hex[:8].upper()}",
                "name": name,
                "age": age,
                "gender": gender,
                "city": random.choices(CITIES, weights=CITY_WEIGHTS)[0],
                "profession": profession,
                "income_group": generate_income_group(age, profession),
                "preferred_category": random.choice(CATEGORIES),
                "active_hours": active_hours,
                "preferred_channel": generate_preferred_channel(age, profession, active_hours),
                "loyalty_level": random.choice(LOYALTY_LEVELS),
                "signup_source": random.choice(SIGNUP_SOURCES),
                "customer_segment": random.choice(SEGMENTS)
            })
            
        return pd.DataFrame(customers)
