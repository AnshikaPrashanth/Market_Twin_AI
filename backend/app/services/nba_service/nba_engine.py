# NBA Engine Implementation
"""
NBA Engine — Next Best Action decision engine for MarketTwin AI.

Architectural rationale:
- Rule priority is explicit and ordered: each Rule is evaluated top-down.
  The first matching rule wins, mirroring a decision table. This makes
  the system auditable and easy to extend without touching scoring logic.
- Confidence is derived from how "deeply" the customer satisfies the
  winning rule's thresholds, not hard-coded per action. This means a
  customer with intent=99 gets a higher confidence than one with intent=75
  even though both hit the same rule.
- explain_action() is a pure function over the twin — it re-runs the same
  decision logic and formats a human-readable sentence. No state is stored.
- CustomerTwin is accepted as a plain dict to stay decoupled from the
  ORM / Pydantic model defined in twin_service. If twin_service ever
  exposes a Pydantic model, you can pass model.dict() here with no changes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Output model
# ---------------------------------------------------------------------------

@dataclass
class NBAResult:
    action: str
    confidence: float  # 0.0 – 1.0
    reason: str
    channel: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action,
            "confidence": round(self.confidence, 4),
            "reason": self.reason,
            "channel": self.channel,
        }


# ---------------------------------------------------------------------------
# Internal rule representation
# ---------------------------------------------------------------------------

@dataclass
class Rule:
    """
    A single business rule.

    predicate   – callable that receives the normalised twin snapshot and
                  returns (matched: bool, confidence: float).
    action      – the NBA action string to emit when matched.
    reason_tmpl – a format string receiving the twin snapshot dict.
    """
    action: str
    predicate: Callable[[Dict[str, Any]], Tuple[bool, float]]
    reason_tmpl: str  # receives **snapshot


# ---------------------------------------------------------------------------
# Threshold constants (single source of truth)
# ---------------------------------------------------------------------------

INTENT_HIGH: int = 70       # intent score ≥ this → "high intent"
INTENT_MEDIUM: int = 40     # intent score ≥ this → "medium intent"
FATIGUE_HIGH: int = 60      # fatigue score ≥ this → "high fatigue"
FATIGUE_LOW: int = 30       # fatigue score < this  → "low fatigue"


# ---------------------------------------------------------------------------
# Helper: normalise the incoming twin dict
# ---------------------------------------------------------------------------

def _extract_snapshot(customer_twin: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pull the fields NBA cares about out of the twin.

    Defaults are conservative (low intent, medium fatigue, not converted,
    no cart) so the engine degrades gracefully when fields are missing
    rather than crashing or emitting a misleading action.
    """
    return {
        "intent_score":    int(customer_twin.get("intent_score", 0)),
        "fatigue_score":   int(customer_twin.get("fatigue_score", 50)),
        "cart_abandoned":  bool(customer_twin.get("cart_abandoned", False)),
        "abandonments":    int(customer_twin.get("abandonments", 0)),
        "purchases":       int(customer_twin.get("purchases", 0)),
        "is_converted":    bool(customer_twin.get("is_converted", False)),
        "customer_id":     customer_twin.get("customer_id", "unknown"),
        "preferred_channel": customer_twin.get("preferred_channel"),
    }


# ---------------------------------------------------------------------------
# Confidence helpers
# ---------------------------------------------------------------------------

def _confidence_from_intent(intent: int, baseline: int = INTENT_HIGH) -> float:
    """
    Scales confidence in [0.70, 1.0] based on how far above the threshold
    the intent score sits.  A score exactly at the threshold → 0.70.
    A score of 100 → 1.0.
    """
    excess = max(0, intent - baseline)
    return min(1.0, 0.70 + (excess / (100 - baseline)) * 0.30)


def _confidence_from_fatigue(fatigue: int) -> float:
    """
    Confidence for fatigue-driven rules:
    higher fatigue → higher confidence that cool-down is the right call.
    """
    excess = max(0, fatigue - FATIGUE_HIGH)
    return min(1.0, 0.70 + (excess / (100 - FATIGUE_HIGH)) * 0.30)


# ---------------------------------------------------------------------------
# Rule definitions (priority order — first match wins)
# ---------------------------------------------------------------------------

_RULES: List[Rule] = [
    # ── Rule 1: converted customers — never re-market ────────────────────
    Rule(
        action="do_nothing",
        predicate=lambda s: (
            s["purchases"] > 0 or s["is_converted"],
            0.99,
        ),
        reason_tmpl=(
            "Customer {customer_id} has already converted. "
            "No further marketing action is required."
        ),
    ),

    # ── Rule 2: high fatigue — protect the relationship ──────────────────
    Rule(
        action="reduce_frequency",
        predicate=lambda s: (
            s["fatigue_score"] >= FATIGUE_HIGH,
            _confidence_from_fatigue(s["fatigue_score"]),
        ),
        reason_tmpl=(
            "Fatigue score {fatigue_score} exceeds threshold {fatigue_high}. "
            "Customer {customer_id} is over-messaged; cooling down to protect "
            "long-term engagement."
        ),
    ),

    # ── Rule 3: Cart abandonment recovery (New) ──────────────────────────
    Rule(
        action="cart_recovery_coupon",
        predicate=lambda s: (
            s["abandonments"] >= 1
            and s["fatigue_score"] < FATIGUE_HIGH
            and s["purchases"] == 0,
            0.85,
        ),
        reason_tmpl=(
            "Customer {customer_id} abandoned cart {abandonments} time(s). "
            "Sending a cart recovery incentive via preferred channel."
        ),
    ),

    # ── Rule 4: high intent + low fatigue → WhatsApp ─────────────────────
    Rule(
        action="send_whatsapp",
        predicate=lambda s: (
            s["intent_score"] >= INTENT_HIGH
            and s["fatigue_score"] < FATIGUE_LOW,
            _confidence_from_intent(s["intent_score"]),
        ),
        reason_tmpl=(
            "Customer {customer_id} shows high intent (score {intent_score}) "
            "with low fatigue (score {fatigue_score}). "
            "WhatsApp provides the highest open-rate for this segment."
        ),
    ),

    # ── Rule 5: medium intent + low fatigue → email ──────────────────────
    Rule(
        action="send_email",
        predicate=lambda s: (
            s["intent_score"] >= INTENT_MEDIUM
            and s["fatigue_score"] < FATIGUE_LOW,
            _confidence_from_intent(s["intent_score"], baseline=INTENT_MEDIUM),
        ),
        reason_tmpl=(
            "Customer {customer_id} has medium intent (score {intent_score}) "
            "and low fatigue (score {fatigue_score}). "
            "Email nurtures without over-committing channel spend."
        ),
    ),
]

# Fallback when no rule fires
_FALLBACK = Rule(
    action="do_nothing",
    predicate=lambda s: (True, 0.50),
    reason_tmpl=(
        "No actionable signal for customer {customer_id} "
        "(intent {intent_score}, fatigue {fatigue_score}). "
        "Holding all actions to avoid noise."
    ),
)


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class NBAEngine:
    """
    Stateless Next Best Action engine.

    Thread-safe: no instance state is mutated during evaluation.
    Can be registered as a FastAPI singleton (instantiated once at startup).
    """

    def __init__(
        self,
        rules: Optional[List[Rule]] = None,
        fallback: Optional[Rule] = None,
    ) -> None:
        # Dependency-injectable rule lists make unit testing trivial.
        self._rules: List[Rule] = rules if rules is not None else _RULES
        self._fallback: Rule = fallback if fallback is not None else _FALLBACK

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_next_best_action(
        self,
        customer_twin: Dict[str, Any],
    ) -> NBAResult:
        """
        Evaluate all rules in priority order and return the first match.

        Parameters
        ----------
        customer_twin : dict
            A dict representation of the CustomerTwin (or model.dict()).

        Returns
        -------
        NBAResult
            Dataclass with action, confidence, and reason fields.
        """
        snap = _extract_snapshot(customer_twin)
        rule, confidence = self._evaluate(snap)
        reason = self._format_reason(rule, snap)
        channel = snap.get("preferred_channel") or "email" if rule.action == "cart_recovery_coupon" else None
        return NBAResult(action=rule.action, confidence=confidence, reason=reason, channel=channel)

    def explain_action(
        self,
        customer_twin: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Return a human-readable explanation of the NBA decision.

        This is identical to get_next_best_action() but presented with
        additional diagnostic fields useful for ops dashboards and audits.
        Keeping this as a separate method allows the API to serve a
        lightweight /nba/{id} and a verbose /nba/{id}/explain without
        two separate code paths.
        """
        snap = _extract_snapshot(customer_twin)
        rule, confidence = self._evaluate(snap)
        reason = self._format_reason(rule, snap)
        channel = snap.get("preferred_channel") or "email" if rule.action == "cart_recovery_coupon" else None

        return {
            "customer_id":    snap["customer_id"],
            "action":         rule.action,
            "confidence":     round(confidence, 4),
            "reason":         reason,
            "channel":        channel,
            "input_snapshot": {
                "intent_score":  snap["intent_score"],
                "fatigue_score": snap["fatigue_score"],
                "cart_abandoned": snap["cart_abandoned"],
                "abandonments":  snap["abandonments"],
                "purchases":     snap["purchases"],
                "is_converted":  snap["is_converted"],
                "preferred_channel": snap.get("preferred_channel"),
            },
            "thresholds_used": {
                "INTENT_HIGH":   INTENT_HIGH,
                "INTENT_MEDIUM": INTENT_MEDIUM,
                "FATIGUE_HIGH":  FATIGUE_HIGH,
                "FATIGUE_LOW":   FATIGUE_LOW,
            },
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _evaluate(
        self,
        snap: Dict[str, Any],
    ) -> Tuple[Rule, float]:
        """Walk the rule list and return the first matching (rule, confidence)."""
        for rule in self._rules:
            matched, confidence = rule.predicate(snap)
            if matched:
                return rule, confidence
        matched, confidence = self._fallback.predicate(snap)
        return self._fallback, confidence

    @staticmethod
    def _format_reason(rule: Rule, snap: Dict[str, Any]) -> str:
        """Render the reason template with snapshot values + threshold constants."""
        return rule.reason_tmpl.format(
            fatigue_high=FATIGUE_HIGH,
            **snap,
        )