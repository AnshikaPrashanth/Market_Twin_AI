# Definition of base personas and fixed frontend story-driven users.
import random

# Core frontend demo users
STORY_USERS = [
    {
        "customer_id": "CUST_STORY_RAHUL",
        "name": "Rahul",
        "age": 28,
        "gender": "Male",
        "city": "Bangalore",
        "profession": "Software Engineer",
        "income_group": "High",
        "preferred_category": "Electronics",
        "active_hours": "Evening",
        "preferred_channel": "whatsapp",
        "loyalty_level": "Gold",
        "signup_source": "Instagram",
        "customer_segment": "High Intent",
        "email_hash": "rahul_demo_hash",
        "phone_hash": "rahul_phone_hash",
    },
    {
        "customer_id": "CUST_STORY_PRIYA",
        "name": "Priya",
        "age": 34,
        "gender": "Female",
        "city": "Mumbai",
        "profession": "Marketing Manager",
        "income_group": "Medium",
        "preferred_category": "Fashion",
        "active_hours": "Morning",
        "preferred_channel": "email",
        "loyalty_level": "Platinum",
        "signup_source": "Google",
        "customer_segment": "Loyal",
        "email_hash": "priya_demo_hash",
        "phone_hash": "priya_phone_hash",
    },
    {
        "customer_id": "CUST_STORY_ARJUN",
        "name": "Arjun",
        "age": 22,
        "gender": "Male",
        "city": "Delhi",
        "profession": "Student",
        "income_group": "Low",
        "preferred_category": "Gaming",
        "active_hours": "Night",
        "preferred_channel": "push",
        "loyalty_level": "Silver",
        "signup_source": "Twitch",
        "customer_segment": "Browsing",
        "email_hash": "arjun_demo_hash",
        "phone_hash": "arjun_phone_hash",
    },
    {
        "customer_id": "CUST_STORY_SNEHA",
        "name": "Sneha",
        "age": 45,
        "gender": "Female",
        "city": "Chennai",
        "profession": "Doctor",
        "income_group": "High",
        "preferred_category": "Home & Garden",
        "active_hours": "Afternoon",
        "preferred_channel": "email",
        "loyalty_level": "Bronze",
        "signup_source": "Facebook",
        "customer_segment": "Dormant",
        "email_hash": "sneha_demo_hash",
        "phone_hash": "sneha_phone_hash",
    }
]

# Distribution configurations for random generation
GENDERS = ["Male", "Female", "Non-binary"]
GENDER_WEIGHTS = [0.55, 0.40, 0.05]

CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
CITY_WEIGHTS = [0.2, 0.15, 0.2, 0.1, 0.1, 0.05, 0.1, 0.1]

PROFESSIONS = ["Engineer", "Doctor", "Teacher", "Student", "Manager", "Artist", "Business Owner", "Consultant"]
INCOME_GROUPS = ["Low", "Medium", "High", "Ultra-High"]

CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Gaming", "Sports", "Beauty", "Books"]
ACTIVE_HOURS = ["Morning", "Afternoon", "Evening", "Night"]

CHANNELS = ["email", "whatsapp", "push", "sms"]
LOYALTY_LEVELS = ["Bronze", "Silver", "Gold", "Platinum"]
SIGNUP_SOURCES = ["Google", "Facebook", "Instagram", "Twitter", "Organic", "Referral", "Twitch"]
SEGMENTS = ["Anonymous", "Browsing", "Interested", "Cart Active", "High Intent", "Loyal", "Churn Risk", "Dormant"]

def generate_age():
    return int(random.triangular(18, 65, 28))

def generate_income_group(age, profession):
    if profession in ("Student",): return "Low"
    if age > 40 and profession in ("Doctor", "Business Owner", "Consultant"): return random.choice(["High", "Ultra-High"])
    return random.choice(INCOME_GROUPS)

def generate_preferred_channel(age, profession, active_hours):
    if age < 25: return random.choice(["whatsapp", "push", "sms"])
    if profession in ("Manager", "Doctor", "Consultant"): return random.choice(["email", "whatsapp"])
    if active_hours == "Night": return random.choice(["push", "sms", "whatsapp"])
    return random.choice(CHANNELS)
