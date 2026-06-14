from sqlalchemy.orm import Session
from app.schemas.event_schema import EventCreate
from app.services.identity_service.identity_store import IdentityStore
from app.services.identity_service.deterministic_matcher import DeterministicMatcher
from app.services.identity_service.probabilistic_matcher import ProbabilisticMatcher
from app.services.identity_service.identity_graph import IdentityGraph
from app.services.identity_service.conflict_detector import ConflictDetector
from app.services.identity_service.identity_explainer import IdentityExplainer
from app.core.utils import generate_customer_id
from app.core.logger import logger

class IdentityService:
    """
    Main Identity Resolution Service orchestrator. Handles merging identities,
    maintaining links, and matching customers deterministically or probabilistically.
    """
    def __init__(self, db: Session):
        self.db = db
        self.store = IdentityStore(db)
        self.deterministic_matcher = DeterministicMatcher(self.store)
        self.probabilistic_matcher = ProbabilisticMatcher(self.store)
        self.identity_graph = IdentityGraph(self.store)
        self.conflict_detector = ConflictDetector(self.store)

    def resolve_customer(self, event: EventCreate) -> dict:
        """
        Orchestrates identity resolution steps:
        1. Extract identifiers.
        2. Attempt deterministic match on input identifiers.
        3. Check for strong identifier conflicts.
        4. Check for Anonymous -> Known upgrade.
        5. If unmatched, attempt probabilistic scoring comparison.
        6. If unmatched, create a brand-new customer profile.
        7. Link all incoming identifiers to the resolved customer ID.
        8. Save/enrich demographic attributes on the profile.
        9. Return explanation.
        """
        logger.info(f"Resolving customer ID for event: '{event.event_id}'")

        match = None
        identifiers_dict = event.identifiers.model_dump()
        
        # 0. Explicit Customer ID
        if event.customer_id:
            match = {
                "customer_id": event.customer_id,
                "matched_by": "explicit_id",
                "confidence": 100,
                "resolution_type": "explicit"
            }

        # 1. Deterministic Match
        if not match:
            match = self.deterministic_matcher.deterministic_match(event.identifiers)
            
            if match:
                target_customer_id = match["customer_id"]
                # Conflict Detection
                if self.conflict_detector.has_conflicting_strong_identifier(identifiers_dict, target_customer_id):
                    logger.warning(f"[IDENTITY] Conflict detected for {target_customer_id}. Rejecting deterministic match.")
                    match = None
                else:
                    logger.info(f"[IDENTITY] Strong match accepted: {target_customer_id}")
                    # Check for Anonymous -> Known upgrade
                    weak_types = ["device_id", "cookie_id", "browser_id"]
                    strong_types = ["email", "phone", "login_id", "email_hash", "phone_hash", "loyalty_id"]
                    
                    for id_type in weak_types:
                        id_val = identifiers_dict.get(id_type)
                        if id_val:
                            existing_owner = self.store.get_customer_by_identifier(id_type, id_val)
                            if existing_owner and existing_owner != target_customer_id:
                                # Check if existing owner is purely anonymous
                                owner_links = self.store.get_all_identifiers_for_customer(existing_owner)
                                owner_has_strong = any(link.identifier_type in strong_types for link in owner_links)
                                
                                if not owner_has_strong:
                                    logger.info(f"[IDENTITY] Anonymous -> Known upgrade detected!")
                                    self.identity_graph.merge_customers(existing_owner, target_customer_id)

        # 2. Probabilistic Match
        if not match:
            prob_match = self.probabilistic_matcher.probabilistic_match(event)
            if prob_match:
                target_customer_id = prob_match["customer_id"]
                if self.conflict_detector.has_conflicting_strong_identifier(identifiers_dict, target_customer_id):
                    logger.warning(f"[IDENTITY] Conflict detected. Rejecting probabilistic match.")
                else:
                    logger.info(f"[IDENTITY] Probable customer match accepted: {target_customer_id} (Score: {prob_match['confidence']})")
                    match = prob_match

        # 3. Provision New Profile
        if not match:
            logger.info(f"[IDENTITY] No strong match found.")
            customer_id = generate_customer_id()
            logger.info(f"[IDENTITY] Provisioned new Customer ID: '{customer_id}'")
            match = {
                "customer_id": customer_id,
                "matched_by": "new_profile",
                "confidence": 100,
                "resolution_type": "creation"
            }
        
        target_customer_id = match["customer_id"]

        # 4. Update Identity Graph and link all identifiers
        self.identity_graph.attach_identifiers(target_customer_id, identifiers_dict)

        # 5. Enrich customer profile with metadata
        city = event.properties.get("city") or event.properties.get("location")
        device = event.properties.get("device_type") or event.properties.get("device")
        
        category = event.properties.get("category")
        categories = [category] if category else []
        if not categories:
            custom_cats = event.properties.get("categories")
            if isinstance(custom_cats, list):
                categories = custom_cats
                
        hour = event.timestamp.hour if event.timestamp else None

        self.store.save_customer_profile(
            customer_id=target_customer_id,
            city=city,
            device_type=device,
            active_hours=[hour] if hour is not None else None,
            preferred_categories=categories if categories else None
        )

        # 6. Explainability
        return IdentityExplainer.format_explanation(
            target_customer_id,
            match["confidence"],
            match["matched_by"],
            match.get("resolution_type", "deterministic")
        )
