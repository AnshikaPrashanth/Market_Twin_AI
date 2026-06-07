from app.services.identity_service.identity_store import IdentityStore
from app.core.logger import logger

class IdentityGraph:
    """
    Manages connections between different identifiers (email, device, cookies)
    and resolves graph merging issues when an identity links two previously separate profiles.
    """
    def __init__(self, store: IdentityStore):
        self.store = store

    def add_link_and_merge(self, identifiers_dict: dict, target_customer_id: str) -> None:
        """
        Saves connections between the customer and identifiers. If any of the identifiers
        were previously bound to a DIFFERENT customer, a profile merge is triggered,
        relinking all historical assets from the old profile to the target profile.
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
                # Collision detected -> Merge existing_owner into target_customer_id
                logger.warning(
                    f"[Identity Graph Merge] Collision! '{id_type}:{id_val}' points to "
                    f"'{existing_owner}' but event resolved to '{target_customer_id}'. "
                    f"Merging '{existing_owner}' into '{target_customer_id}'."
                )

                # Fetch all linked identifiers of the old customer
                old_bindings = self.store.get_all_identifiers_for_customer(existing_owner)
                for binding in old_bindings:
                    logger.info(
                        f"Relinking old customer binding '{binding.identifier_type}:{binding.identifier_value}' "
                        f"from customer '{existing_owner}' to customer '{target_customer_id}'."
                    )
                    self.store.create_identity_link(
                        id_type=binding.identifier_type,
                        id_val=binding.identifier_value,
                        customer_id=target_customer_id,
                        confidence=binding.confidence_score,
                        matched_by=f"merged_from_{existing_owner}"
                    )
