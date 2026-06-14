import pandas as pd
from app.ai_models.inference.model_loader import model_registry
from app.ai_models.explainability.feature_importance import extract_feature_importance
from app.ai_models.explainability.prediction_explainer import format_top_factors
from app.ai_models.explainability.confidence_formatter import format_confidence

def predict_nba(customer_features: dict) -> dict:
    model = model_registry.models.get('nba')
    preprocessor = model_registry.preprocessors.get('nba')
    
    if not model or not preprocessor:
        return {"error": "Model not loaded"}
        
    df = pd.DataFrame([customer_features])
    
    categorical_cols = ['journey_stage', 'preferred_channel']
    numerical_cols = ['intent_score', 'conversion_probability', 'churn_risk', 'fatigue_score']
    
    df_cat = preprocessor.transform_categorical(df, categorical_cols)
    df_ready = preprocessor.scale_numerical(df_cat, numerical_cols, is_training=False)
    
    features = categorical_cols + numerical_cols
    X = df_ready[features]
    
    prob_dist = model.predict_proba(X)[0]
    
    target_le = preprocessor.encoders['target']
    classes = target_le.inverse_transform(model.classes_)
    
    action_scores = {classes[i]: round(float(prob_dist[i]), 4) for i in range(len(classes))}
    best_action = max(action_scores, key=action_scores.get)
    max_prob = action_scores[best_action]
    
    # Explainability
    importances = extract_feature_importance(model, features)
    top_factors = format_top_factors(importances, df.iloc[0].to_dict())
    
    return {
        "best_action": best_action,
        "confidence": format_confidence(max_prob),
        "reasoning": top_factors,
        "action_scores": action_scores
    }
