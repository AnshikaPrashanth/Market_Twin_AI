import pandas as pd
from app.ai_models.inference.model_loader import model_registry
from app.ai_models.training.feature_engineering import generate_identity_features
from app.ai_models.explainability.feature_importance import extract_feature_importance
from app.ai_models.explainability.prediction_explainer import format_top_factors
from app.ai_models.explainability.confidence_formatter import format_confidence

def predict_identity_match(identity_features: dict) -> dict:
    """
    Given an identity pairing structure, predict if they belong to the same user.
    identity_features should contain:
    same_city, same_browser, same_device_type, same_active_hours, same_product_interest,
    same_ip_region, same_channel_behavior
    """
    model = model_registry.models.get('identity')
    
    if not model:
        return {"error": "Model not loaded"}
        
    df = pd.DataFrame([identity_features])
    df = generate_identity_features(df)
    
    features = ['same_city', 'same_browser', 'same_device_type', 'same_active_hours', 
                'same_product_interest', 'same_ip_region', 'same_channel_behavior']
    
    X = df[features]
    
    prob = float(model.predict_proba(X)[0][1])
    
    importances = extract_feature_importance(model, features)
    # We only care about positive factors that matched for identity stitching
    positive_matches = [f for f in features if df.iloc[0][f] == 1]
    filtered_importances = [(f, i) for f, i in importances if f in positive_matches]
    
    top_factors = format_top_factors(filtered_importances, df.iloc[0].to_dict())
    confidence = format_confidence(prob)
    
    return {
        "customer_match_probability": round(prob, 4),
        "resolution_type": "probabilistic",
        "confidence": confidence,
        "matched_by": top_factors
    }
