from app.services.identity_service.identity_store import IdentityStore
from app.core.logger import logger

class IdentityGraph:
    """
    Manages connections between different identifiers (email, device, cookies)
    and resolves graph merging issues when an identity links two previously separate profiles.
    """
    def __init__(self, store: IdentityStore):
        self.store = store

    def attach_identifiers(self, target_customer_id: str, identifiers_dict: dict) -> None:
        """
        Saves connections between the customer and identifiers. 
        Updates existing bindings instead of blind merging.
        """
        for id_type, id_val in identifiers_dict.items():
            if not id_val or not str(id_val).strip():
                continue

            existing_owner = self.store.get_customer_by_identifier(id_type, id_val)

            if not existing_owner:
                # Create standard link
                self.store.create_identity_link(
                    id_type=id_type,
                    id_val=id_val,
                    customer_id=target_customer_id,
                    confidence=100,
                    matched_by="deterministic"
                )
            elif existing_owner != target_customer_id:
                # If a device or cookie is being re-assigned (or shared), we update its pointer
                # The orchestrator should have prevented strong identifier conflicts.
                logger.info(
                    f"[Identity Graph] Re-linking '{id_type}:{id_val}' from "
                    f"'{existing_owner}' to '{target_customer_id}'."
                )
                self.store.create_identity_link(
                    id_type=id_type,
                    id_val=id_val,
                    customer_id=target_customer_id,
                    confidence=100,
                    matched_by="reassigned"
                )

    def merge_customers(self, source_customer_id: str, target_customer_id: str) -> None:
        """
        Merges all identifiers and profile data from source to target.
        Used when an anonymous profile logs in and needs to be upgraded.
        """
        logger.info(f"[Identity Graph Merge] Merging '{source_customer_id}' into '{target_customer_id}'.")
        
        # Relink all identifiers
        old_bindings = self.store.get_all_identifiers_for_customer(source_customer_id)
        for binding in old_bindings:
            logger.info(
                f"Relinking old customer binding '{binding.identifier_type}:{binding.identifier_value}' "
                f"from '{source_customer_id}' to '{target_customer_id}'."
            )
            self.store.create_identity_link(
                id_type=binding.identifier_type,
                id_val=binding.identifier_value,
                customer_id=target_customer_id,
                confidence=binding.confidence_score,
                matched_by=f"merged_from_{source_customer_id}"
            )
        
        # We could also mark the source_customer_id as "merged" or "inactive" in the profile store
        source_profile = self.store.get_customer_profile(source_customer_id)
        if source_profile:
            source_profile.status = f"merged_to_{target_customer_id}"
            self.store.db.commit()
