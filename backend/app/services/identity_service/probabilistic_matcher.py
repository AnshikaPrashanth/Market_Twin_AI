from typing import Optional
from app.services.identity_service.identity_store import IdentityStore
from app.services.identity_service.confidence_engine import ConfidenceEngine
from app.schemas.event_schema import EventCreate
from app.core.constants import CONFIDENCE_THRESHOLD
from app.core.logger import logger

class ProbabilisticMatcher:
    """
    Evaluates contextual details of incoming events (like city, hour, category)
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
        # Extract location, device, category, and hour metrics
        city = event.properties.get("city") or event.properties.get("location")
        device = event.properties.get("device_type") or event.properties.get("device")
        
        category = event.properties.get("category")
        categories = [category] if category else []
        if not categories:
            custom_cats = event.properties.get("categories")
            if isinstance(custom_cats, list):
                categories = custom_cats
                
        hour = event.timestamp.hour if event.timestamp else None

        # Short-circuit if there are no features to calculate scoring
        if not any([city, device, categories, hour is not None]):
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
                profile=profile
            )

            if score > max_score:
                max_score = score
                best_match = profile

        if max_score >= CONFIDENCE_THRESHOLD and best_match:
            logger.info(
                f"Probabilistic match success: '{best_match.customer_id}' "
                f"(score={max_score}, threshold={CONFIDENCE_THRESHOLD})"
            )
            return {
                "customer_id": best_match.customer_id,
                "matched_by": "probabilistic_engine",
                "confidence": max_score
            }

        logger.debug(f"No profile satisfied probabilistic threshold. Max score: {max_score}")
        return None
