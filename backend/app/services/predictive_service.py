from app.models.twin_model import TwinModel
from typing import Dict, Any, List

class PredictiveTwinEngine:
    """
    Simulates the future trajectory of a customer's Digital Twin under
    two scenarios: 'no_action' and 'with_action'.
    """

    def simulate(self, twin: TwinModel | dict) -> Dict[str, Any]:
        if isinstance(twin, TwinModel):
            customer_id = twin.customer_id
            intent = twin.intent_score
            churn = twin.churn_risk
            fatigue = twin.fatigue_score
            stage = twin.journey_stage
        else:
            customer_id = twin.get("customer_id", "unknown")
            intent = twin.get("intent_score", 0)
            churn = twin.get("churn_risk", 0)
            fatigue = twin.get("fatigue_score", 0)
            stage = twin.get("journey_stage", "anonymous")

        # Basic constraints
        def clamp(val):
            return max(0, min(100, int(val)))

        # No Action Simulation
        no_action: List[Dict[str, Any]] = []
        c_intent = intent
        c_churn = churn
        c_fatigue = fatigue
        c_stage = stage
        
        for hour in [0, 6, 12, 24]:
            no_action.append({
                "hour": hour,
                "intent": c_intent,
                "churn": c_churn,
                "fatigue": c_fatigue,
                "stage": c_stage
            })
            # Decay logic
            c_intent = clamp(c_intent - 10)
            c_churn = clamp(c_churn + 8)
            c_fatigue = clamp(c_fatigue - 5)
            if c_intent < 50:
                c_stage = "cooling"
            if c_churn > 70:
                c_stage = "at_risk"

        # With Action Simulation
        with_action: List[Dict[str, Any]] = []
        c_intent = intent
        c_churn = churn
        c_fatigue = fatigue
        c_stage = stage

        for hour in [0, 6, 12, 24]:
            with_action.append({
                "hour": hour,
                "intent": c_intent,
                "churn": c_churn,
                "fatigue": c_fatigue,
                "stage": c_stage
            })
            if hour == 0:
                # Immediate impact of intervention
                c_intent = clamp(c_intent + 15)
                c_churn = clamp(c_churn - 15)
                c_fatigue = clamp(c_fatigue + 10)
                c_stage = "re_engaged"
            else:
                # Sustained engagement
                c_intent = clamp(c_intent - 2)
                c_churn = clamp(c_churn - 5)
                c_fatigue = clamp(c_fatigue - 8)
                if hour >= 12 and c_intent > 60:
                    c_stage = "recovered"

        intent_saved = clamp(with_action[-1]["intent"] - no_action[-1]["intent"])
        churn_reduced = clamp(no_action[-1]["churn"] - with_action[-1]["churn"])

        coi_msg = "Customer likely becomes at-risk without intervention"
        if no_action[-1]["churn"] < 50:
            coi_msg = "Customer may drift to cooling without active engagement"

        return {
            "customer_id": customer_id,
            "no_action": no_action,
            "with_action": with_action,
            "impact_summary": {
                "intent_saved": intent_saved,
                "churn_reduced": churn_reduced,
                "cost_of_inaction": coi_msg
            }
        }
