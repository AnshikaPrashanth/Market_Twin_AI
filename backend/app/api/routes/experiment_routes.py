from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.experiments.experiment_runner import run_experiment_batch

router = APIRouter(prefix="/api/experiments", tags=["Experiments"])

# We can store the latest run in memory for the comparison endpoint if requested separately
_latest_experiment_results = {}

@router.post("/run")
async def run_experiment(payload: dict = None):
    """
    Triggers a live experiment run comparing Baseline vs AI orchestration.
    """
    try:
        count = payload.get("count", 200) if payload else 200
        results = run_experiment_batch(count)
        global _latest_experiment_results
        _latest_experiment_results = results
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comparison")
async def get_comparison():
    """
    Returns the latest comparison results.
    """
    if not _latest_experiment_results:
        # Run a default batch if none exists
        return await run_experiment({"count": 200})
    return _latest_experiment_results
