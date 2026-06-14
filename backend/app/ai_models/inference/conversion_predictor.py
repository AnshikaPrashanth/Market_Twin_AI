import pandas as pd
from app.ai_models.inference.model_loader import model_registry
from app.ai_models.training.feature_engineering import generate_conversion_features
from app.ai_models.explainability.feature_importance import extract_feature_importance
from app.ai_models.explainability.prediction_explainer import format_top_factors
from app.ai_models.explainability.confidence_formatter import format_confidence

def predict_conversion(customer_features: dict) -> dict:
    model = model_registry.models.get('conversion')
    preprocessor = model_registry.preprocessors.get('conversion')
    
    if not model or not preprocessor:
        return {"error": "Model not loaded"}
        
    df = pd.DataFrame([customer_features])
    df = generate_conversion_features(df)
    
    categorical_cols = ['journey_stage', 'preferred_channel', 'active_hour']
    numerical_cols = ['intent_score', 'churn_risk', 'fatigue_score', 'product_views', 'cart_count', 
                      'abandonments', 'cart_value', 'engagement_score', 'cart_abandon_rate']
                      
    df_cat = preprocessor.transform_categorical(df, categorical_cols)
    df_ready = preprocessor.scale_numerical(df_cat, numerical_cols, is_training=False)
    
    features = categorical_cols + numerical_cols
    X = df_ready[features]
    
    prob = float(model.predict_proba(X)[0][1])
    
    # Explainability
    importances = extract_feature_importance(model, features)
    top_factors = format_top_factors(importances, df.iloc[0].to_dict())
    
    confidence = format_confidence(prob)
    
    risk_level = "high_conversion" if prob > 0.6 else "medium_conversion" if prob > 0.3 else "low_conversion"
    
    return {
        "conversion_probability": round(prob, 4),
        "risk_level": risk_level,
        "confidence": confidence,
        "top_factors": top_factors
    }
