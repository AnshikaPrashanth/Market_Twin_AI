from app.database.db import SessionLocal
from app.models.customer_model import CustomerModel
from app.services.identity_service.identity_store import IdentityStore
from app.services.twin_service.twin_store import TwinStore
from app.core.utils import hash_identifier
from app.core.logger import logger

def seed_initial_data():
    """
    Checks if profiles exist, and if empty, populates the SQLite database
    with test customer profiles, identity graph linkages, and initial digital twins.
    Automatically triggers backup updates to local JSON data files.
    """
    db = SessionLocal()
    try:
        # Check if database has already been seeded
        if db.query(CustomerModel).count() > 0:
            logger.info("Database already seeded. Skipping initialization.")
            return

        logger.info("Database is empty. Seeding initial test datasets...")

        # 1. Initialize DB Stores
        id_store = IdentityStore(db)
        twin_store = TwinStore(db)

        # 2. Add customer profiles
        # Mumbai mobile user active in mornings/evenings interested in audio/electronics
        id_store.save_customer_profile(
            customer_id="CUST_001",
            city="Mumbai",
            device_type="Mobile",
            active_hours=[8, 9, 10, 19, 20, 21],
            preferred_categories=["Headphones", "Electronics"]
        )

        # Bengaluru desktop user active in afternoons interested in laptops/books
        id_store.save_customer_profile(
            customer_id="CUST_002",
            city="Bengaluru",
            device_type="Desktop",
            active_hours=[14, 15, 16],
            preferred_categories=["Laptops", "Books"]
        )

        # 3. Create identity links
        # Link DEV_88, EMAIL_991, PHONE_771, COOKIE_ABC to CUST_001
        id_store.create_identity_link("device_id", "DEV_88", "CUST_001", confidence=100, matched_by="deterministic")
        id_store.create_identity_link("email_hash", hash_identifier("EMAIL_991"), "CUST_001", confidence=100, matched_by="deterministic")
        id_store.create_identity_link("phone_hash", hash_identifier("PHONE_771"), "CUST_001", confidence=100, matched_by="deterministic")
        id_store.create_identity_link("cookie_id", "COOKIE_ABC", "CUST_001", confidence=100, matched_by="deterministic")

        # Link DEV_99, EMAIL_CUST2 to CUST_002
        id_store.create_identity_link("device_id", "DEV_99", "CUST_002", confidence=100, matched_by="deterministic")
        id_store.create_identity_link("email_hash", hash_identifier("EMAIL_CUST2"), "CUST_002", confidence=100, matched_by="deterministic")

        # 4. Initialize Digital Twins
        twin_store.create_twin("CUST_001")
        twin_store.create_twin("CUST_002")

        # 5. Populate CUST_001 Twin with mock active metrics for intent simulation
        twin1 = twin_store.load_twin("CUST_001")
        if twin1:
            raw = dict(twin1.raw_counters)
            raw["views"] = 6
            raw["carts"] = 2
            raw["repeated_views"] = 1
            raw["recent_activity"] = 1
            raw["total_spend"] = 2999.0

            from app.services.twin_service.scoring.intent_score import IntentScoreEngine
            from app.services.twin_service.scoring.churn_score import ChurnScoreEngine
            from app.services.twin_service.scoring.fatigue_score import FatigueScoreEngine
            from app.services.twin_service.scoring.conversion_score import ConversionScoreEngine
            
            twin1.raw_counters = raw
            twin1.intent_score = IntentScoreEngine.calculate(raw)
            twin1.churn_risk = ChurnScoreEngine.calculate(raw)
            twin1.fatigue_score = FatigueScoreEngine.calculate(raw)
            twin1.conversion_probability = ConversionScoreEngine.calculate(twin1.intent_score, twin1.fatigue_score, raw)
            twin1.journey_stage = "cart_active"
            twin1.segment = "High Intent Cart Abandoner"
            twin1.preferred_channel = "Mobile"
            twin1.next_best_action = "send_coupon"

            twin_store.save_twin(twin1)

        logger.info("Database seeding completed. SQLite and fallback JSON mappings are synced.")
    except Exception as e:
        logger.error(f"Error seeding database records: {e}", exc_info=True)
    finally:
        db.close()
