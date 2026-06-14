from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.ai_models.inference.conversion_predictor import predict_conversion
from app.ai_models.inference.channel_predictor import predict_best_channel
from app.ai_models.inference.nba_predictor import predict_nba
from app.ai_models.inference.identity_predictor import predict_identity_match
from app.ai_models.inference.message_generator import generate_message

router = APIRouter(prefix="/api/ai", tags=["AI Models"])

class PredictRequest(BaseModel):
    customer_id: str
    features: Dict[str, Any]

class MessageRequest(BaseModel):
    customer_name: str
    product: str
    journey_stage: str
    best_action: str
    preferred_channel: str
    customer_segment: str

@router.post("/conversion")
async def get_conversion_prediction(req: PredictRequest):
    try:
        res = predict_conversion(req.features)
        if "error" in res:
            raise HTTPException(status_code=500, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/channel")
async def get_channel_prediction(req: PredictRequest):
    try:
        res = predict_best_channel(req.features)
        if "error" in res:
            raise HTTPException(status_code=500, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nba")
async def get_nba_prediction(req: PredictRequest):
    try:
        res = predict_nba(req.features)
        if "error" in res:
            raise HTTPException(status_code=500, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/identity")
async def get_identity_prediction(req: PredictRequest):
    try:
        res = predict_identity_match(req.features)
        if "error" in res:
            raise HTTPException(status_code=500, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-message")
async def get_generated_message(req: MessageRequest):
    try:
        res = generate_message(req.model_dump())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
