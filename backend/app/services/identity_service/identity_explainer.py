class IdentityExplainer:
    """
    Formats the resolution result to ensure the engine is explainable.
    """
    @staticmethod
    def format_explanation(
        customer_id: str, 
        confidence: int, 
        matched_by: str, 
        resolution_type: str
    ) -> dict:
        return {
            "customer_id": customer_id,
            "confidence": confidence,
            "matched_by": matched_by,
            "resolution_type": resolution_type
        }
