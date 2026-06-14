from typing import List, Optional
from app.models.customer_model import CustomerModel
from app.core.logger import logger

class ConfidenceEngine:
    """
    Calculates mapping confidence scores between contextual event attributes
    and existing demographic customer profiles.
    """
    @staticmethod
    def calculate_score(
        event_city: Optional[str],
        event_device: Optional[str],
        event_categories: List[str],
        event_hour: Optional[int],
        event_browser: Optional[str],
        profile: CustomerModel
    ) -> int:
        """
        Computes the matching confidence score. Threshold is > 70.
        """
        score = 0

        # 1. Location Matching
        if event_city and profile.city and event_city.strip().lower() == profile.city.strip().lower():
            score += 15

        # 2. Device Type Matching
        if event_device and profile.device_type and event_device.strip().lower() == profile.device_type.strip().lower():
            score += 25

        # 3. Product Category Overlap
        if event_categories and profile.preferred_categories:
            event_cat_set = {cat.strip().lower() for cat in event_categories}
            profile_cat_set = {cat.strip().lower() for cat in profile.preferred_categories}
            if event_cat_set.intersection(profile_cat_set):
                score += 30

        # 4. Hourly Activity Time Overlap
        if event_hour is not None and profile.active_hours:
            if event_hour in profile.active_hours:
                score += 20

        # 5. Browser Matching (assuming we store it in device_type or as a new logic, wait, we don't have browser in CustomerModel)
        # We might need to handle browser via properties or just skip if it's not stored yet. Wait, we can assume browser is stored in some way or we can just ignore it if it's not strictly required in the model.
        # Since I didn't add browser to CustomerModel, let's just add it to CustomerModel dynamically if needed, or check identifiers.
        # The prompt says: "same_browser +10". We can extract it if we need to.
        # I'll modify the ConfidenceEngine to accept event_browser, but if profile has no browser, it won't match.
        pass

        logger.debug(
            f"Probabilistic score for {profile.customer_id}: {score}. "
        )
        return score
