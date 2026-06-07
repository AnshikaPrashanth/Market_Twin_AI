from sqlalchemy.orm import Session
from app.schemas.event_schema import EventCreate
from app.services.identity_service.identity_store import IdentityStore
from app.services.identity_service.deterministic_matcher import DeterministicMatcher
from app.services.identity_service.probabilistic_matcher import ProbabilisticMatcher
from app.services.identity_service.identity_graph import IdentityGraph
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

    def resolve_customer(self, event: EventCreate) -> dict:
        """
        Orchestrates identity resolution steps:
        1. Attempt deterministic match on input identifiers.
        2. If unmatched, attempt probabilistic scoring comparison.
        3. If unmatched, create a brand-new customer profile.
        4. Link all incoming identifiers to the resolved customer ID (and merge if necessary).
        5. Save/enrich demographic attributes on the profile for future comparisons.
        6. Return resolution metadata details.
        """
        logger.info(f"Resolving customer ID for event: '{event.event_id}'")

        match = None
        # 0. Explicit Customer ID
        if event.customer_id:
            match = {
                "customer_id": event.customer_id,
                "matched_by": "explicit_id",
                "confidence": 100
            }

        # 1. Deterministic Match
        if not match:
            match = self.deterministic_matcher.deterministic_match(event.identifiers)

        # 2. Probabilistic Match
        if not match:
            match = self.probabilistic_matcher.probabilistic_match(event)

        # 3. Provision New Profile
        if not match:
            customer_id = generate_customer_id()
            logger.info(f"Failed to match identity. Provisioned new Customer ID: '{customer_id}'")
            match = {
                "customer_id": customer_id,
                "matched_by": "new_profile",
                "confidence": 100
            }
        
        customer_id = match["customer_id"]

        # 4. Update Identity Graph and link all identifiers
        identifiers_dict = event.identifiers.model_dump()
        self.identity_graph.add_link_and_merge(identifiers_dict, customer_id)

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
            customer_id=customer_id,
            city=city,
            device_type=device,
            active_hours=[hour] if hour is not None else None,
            preferred_categories=categories if categories else None
        )

        return match
