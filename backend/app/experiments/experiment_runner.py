import random
import uuid
from typing import List, Dict

from app.experiments.baseline_engine import run_baseline_decision
from app.experiments.ai_experiment_engine import run_ai_decision
from app.experiments.response_simulator import simulate_response
from app.experiments.metrics_calculator import calculate_metrics
from app.experiments.metrics_comparator import compare_metrics

def generate_synthetic_customers(count: int = 200) -> List[Dict]:
    """
    Generates a batch of synthetic customers with different states to run the experiment on.
    """
    channels = ["email", "whatsapp", "sms", "push"]
    stages = ["browsing", "cart_abandoned", "checkout", "post_purchase"]
    
    customers = []
    for _ in range(count):
        cust = {
            "customer_id": f"SIM_{uuid.uuid4().hex[:6].upper()}",
            "preferred_channel": random.choice(channels),
            "device_type": random.choice(["Mobile", "Desktop", "Tablet"]),
            "journey_stage": random.choices(stages, weights=[0.5, 0.3, 0.1, 0.1])[0],
            "cart_value": random.randint(50, 5000) if random.random() > 0.5 else 0,
            "views": random.randint(1, 15),
            "carts": random.randint(0, 3)
        }
        customers.append(cust)
    return customers

def run_experiment_batch(customers_count: int = 200) -> Dict:
    """
    Runs the full simulation for both Baseline and AI using the SAME customers.
    """
    customers = generate_synthetic_customers(customers_count)
    
    baseline_results = []
    ai_results = []
    
    for cust in customers:
        journey_context = {
            "journey_stage": cust["journey_stage"],
            "cart_value": cust["cart_value"],
            "views": cust["views"],
            "carts": cust["carts"],
            "affinity": random.random()
        }
        
        # --- BASELINE RUN ---
        base_decision = run_baseline_decision(cust, journey_context)
        base_outcome = simulate_response(base_decision, cust, journey_context)
        baseline_results.append({
            "customer_id": cust["customer_id"],
            "channel": base_decision["channel"],
            "action": base_decision["action"],
            "personalized": base_decision["personalized"],
            "journey_stage": cust["journey_stage"],
            "converted": base_outcome["converted"],
            "revenue": base_outcome["revenue"]
        })
        
        # --- AI RUN ---
        ai_decision = run_ai_decision(cust, journey_context)
        ai_outcome = simulate_response(ai_decision, cust, journey_context)
        ai_results.append({
            "customer_id": cust["customer_id"],
            "channel": ai_decision["channel"],
            "action": ai_decision["action"],
            "personalized": ai_decision["personalized"],
            "journey_stage": cust["journey_stage"],
            "converted": ai_outcome["converted"],
            "revenue": ai_outcome["revenue"]
        })

    # Calculate metrics
    base_metrics = calculate_metrics(baseline_results)
    ai_metrics = calculate_metrics(ai_results)
    
    # Compare
    comparison = compare_metrics(base_metrics, ai_metrics)
    
    return {
        "experiment_id": f"EXP_{uuid.uuid4().hex[:6].upper()}",
        "customers_processed": len(customers),
        "baseline_completed": True,
        "ai_completed": True,
        "comparison_ready": True,
        "metrics": comparison
    }
