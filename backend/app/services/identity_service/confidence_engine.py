from typing import List, Optional
from app.models.customer_model import CustomerModel
from app.core.constants import (
    CONFIDENCE_WEIGHT_CITY,
    CONFIDENCE_WEIGHT_DEVICE,
    CONFIDENCE_WEIGHT_CATEGORY,
    CONFIDENCE_WEIGHT_TIME_PATTERN
)
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
        profile: CustomerModel
    ) -> int:
        """
        Computes the matching confidence score. Max possible score is 90.
        Threshold is defined as 70.
        """
        score = 0

        # 1. Location Matching
        if event_city and profile.city and event_city.strip().lower() == profile.city.strip().lower():
            score += CONFIDENCE_WEIGHT_CITY

        # 2. Device Type Matching
        if event_device and profile.device_type and event_device.strip().lower() == profile.device_type.strip().lower():
            score += CONFIDENCE_WEIGHT_DEVICE

        # 3. Product Category Overlap
        if event_categories and profile.preferred_categories:
            event_cat_set = {cat.strip().lower() for cat in event_categories}
            profile_cat_set = {cat.strip().lower() for cat in profile.preferred_categories}
            if event_cat_set.intersection(profile_cat_set):
                score += CONFIDENCE_WEIGHT_CATEGORY

        # 4. Hourly Activity Time Overlap
        if event_hour is not None and profile.active_hours:
            if event_hour in profile.active_hours:
                score += CONFIDENCE_WEIGHT_TIME_PATTERN

        logger.debug(
            f"Probabilistic score for {profile.customer_id}: {score}/90. "
            f"[City match: {event_city == profile.city}, Device match: {event_device == profile.device_type}]"
        )
        return score
