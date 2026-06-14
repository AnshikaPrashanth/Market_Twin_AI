from sqlalchemy.orm import Session
from app.models.identity_model import IdentityLinkModel
from app.models.customer_model import CustomerModel
from app.shared.storage import JSONFallbackStore
from app.core.logger import logger
from typing import List, Optional
from datetime import datetime, timezone

class IdentityStore:
    """
    Manages identity links and profile demographic storage operations.
    Syncs maps to 'identity_map.json' and profiles to 'customer_profiles.json'
    for development convenience.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_customer_by_identifier(self, id_type: str, id_val: str) -> Optional[str]:
        """
        Checks if an exact identifier type-value pair is already mapped.
        """
        link = (
            self.db.query(IdentityLinkModel)
            .filter(
                IdentityLinkModel.identifier_type == id_type,
                IdentityLinkModel.identifier_value == id_val
            )
            .first()
        )
        if link:
            link.last_seen = datetime.now(timezone.utc)
            self.db.commit()
            return link.customer_id
        return None

    def create_identity_link(
        self, id_type: str, id_val: str, customer_id: str, confidence: int = 100, matched_by: str = "deterministic"
    ) -> IdentityLinkModel:
        """
        Saves or updates an identity mapping link.
        """
        logger.debug(f"Linking {id_type}={id_val} to customer {customer_id}")
        existing = (
            self.db.query(IdentityLinkModel)
            .filter(
                IdentityLinkModel.identifier_type == id_type,
                IdentityLinkModel.identifier_value == id_val
            )
            .first()
        )
        
        now = datetime.now(timezone.utc)

        if existing:
            existing.customer_id = customer_id
            existing.confidence_score = confidence
            existing.matched_by = matched_by
            existing.last_seen = now
            self.db.commit()
            self.db.refresh(existing)
            self._backup_links_to_json()
            return existing

        db_link = IdentityLinkModel(
            identifier_type=id_type,
            identifier_value=id_val,
            customer_id=customer_id,
            confidence_score=confidence,
            matched_by=matched_by,
            last_seen=now
        )
        self.db.add(db_link)
        self.db.commit()
        self.db.refresh(db_link)

        self._backup_links_to_json()
        return db_link

    def get_all_identifiers_for_customer(self, customer_id: str) -> List[IdentityLinkModel]:
        """
        Retrieves all active identity bindings for a given customer ID.
        """
        return (
            self.db.query(IdentityLinkModel)
            .filter(IdentityLinkModel.customer_id == customer_id)
            .all()
        )

    def get_all_identity_links(self) -> List[IdentityLinkModel]:
        """
        Retrieves all identity bindings across all customers.
        """
        return self.db.query(IdentityLinkModel).all()

    def get_customer_profile(self, customer_id: str) -> Optional[CustomerModel]:
        """
        Retrieves demographics metadata profile for a customer.
        """
        return self.db.query(CustomerModel).filter(CustomerModel.customer_id == customer_id).first()

    def save_customer_profile(
        self,
        customer_id: str,
        city: Optional[str] = None,
        device_type: Optional[str] = None,
        active_hours: Optional[List[int]] = None,
        preferred_categories: Optional[List[str]] = None
    ) -> CustomerModel:
        """
        Creates or updates metadata properties stored on a customer profile.
        """
        now = datetime.now(timezone.utc)
        profile = self.get_customer_profile(customer_id)
        if not profile:
            profile = CustomerModel(
                customer_id=customer_id,
                city=city,
                device_type=device_type,
                active_hours=active_hours or [],
                preferred_categories=preferred_categories or [],
                last_seen=now
            )
            self.db.add(profile)
        else:
            profile.last_seen = now
            if city is not None:
                profile.city = city
            if device_type is not None:
                profile.device_type = device_type
            if active_hours is not None:
                profile.active_hours = list(set((profile.active_hours or []) + active_hours))
            if preferred_categories is not None:
                profile.preferred_categories = list(set((profile.preferred_categories or []) + preferred_categories))
        
        self.db.commit()
        self.db.refresh(profile)
        self._backup_profiles_to_json()
        return profile

    def get_all_profiles(self) -> List[CustomerModel]:
        """
        Retrieves all customer profiles.
        """
        return self.db.query(CustomerModel).all()

    def _backup_links_to_json(self):
        try:
            links = self.db.query(IdentityLinkModel).all()
            output = {l.identifier_value: l.customer_id for l in links}
            JSONFallbackStore.save("identity_map.json", output)
        except Exception as e:
            logger.error(f"Failed to backup identity links: {e}")

    def _backup_profiles_to_json(self):
        try:
            profiles = self.db.query(CustomerModel).all()
            output = [
                {
                    "customer_id": p.customer_id,
                    "city": p.city,
                    "device_type": p.device_type,
                    "active_hours": p.active_hours,
                    "preferred_categories": p.preferred_categories,
                    "created_at": p.created_at.isoformat()
                }
                for p in profiles
            ]
            JSONFallbackStore.save("customer_profiles.json", output)
        except Exception as e:
            logger.error(f"Failed to backup customer profiles: {e}")
