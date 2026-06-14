from typing import Optional
from app.services.identity_service.identity_store import IdentityStore
from app.services.identity_service.confidence_engine import ConfidenceEngine
from app.schemas.event_schema import EventCreate
from app.core.logger import logger

class ProbabilisticMatcher:
    """
    Evaluates contextual details of incoming events (like city, hour, category, browser)
    against registered profile historical stats to resolve identities.
    """
    def __init__(self, store: IdentityStore):
        self.store = store
        self.engine = ConfidenceEngine()

    def probabilistic_match(self, event: EventCreate) -> Optional[dict]:
        """
        Iterates over all customer profiles, scores similarity, and returns
        the highest scoring profile if it clears the threshold.
        """
        # Extract location, device, category, hour, and browser metrics
        city = event.properties.get("city") or event.properties.get("location")
        device = event.properties.get("device_type") or event.properties.get("device")
        browser = event.identifiers.browser_id
        
        category = event.properties.get("category")
        categories = [category] if category else []
        if not categories:
            custom_cats = event.properties.get("categories")
            if isinstance(custom_cats, list):
                categories = custom_cats
                
        hour = event.timestamp.hour if event.timestamp else None

        # Short-circuit if there are no features to calculate scoring
        if not any([city, device, categories, hour is not None, browser]):
            logger.debug("No contextual parameters found on event for probabilistic matching.")
            return None

        profiles = self.store.get_all_profiles()
        best_match = None
        max_score = 0

        for profile in profiles:
            score = self.engine.calculate_score(
                event_city=city,
                event_device=device,
                event_categories=categories,
                event_hour=hour,
                event_browser=browser,
                profile=profile
            )

            # If same browser, add 10 since profile doesn't have it explicitly stored yet, we can check identities graph
            if browser:
                browser_links = self.store.get_all_identifiers_for_customer(profile.customer_id)
                has_browser = any(link.identifier_type == "browser_id" and link.identifier_value == browser for link in browser_links)
                if has_browser:
                    score += 10

            if score > max_score:
                max_score = score
                best_match = profile

        if max_score > 70 and best_match:
            logger.info(
                f"Probabilistic match success: '{best_match.customer_id}' "
                f"(score={max_score}, threshold=70)"
            )
            return {
                "customer_id": best_match.customer_id,
                "matched_by": "probabilistic_engine",
                "confidence": max_score,
                "resolution_type": "probabilistic"
            }

        logger.debug(f"No profile satisfied probabilistic threshold. Max score: {max_score}")
        return None
