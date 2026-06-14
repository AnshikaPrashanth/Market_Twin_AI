import pandas as pd
from app.ai_models.inference.model_loader import model_registry
from app.ai_models.training.feature_engineering import generate_channel_features
from app.ai_models.explainability.confidence_formatter import format_confidence

def predict_best_channel(customer_features: dict) -> dict:
    model = model_registry.models.get('channel')
    preprocessor = model_registry.preprocessors.get('channel')
    
    if not model or not preprocessor:
        return {"error": "Model not loaded"}
        
    df = pd.DataFrame([customer_features])
    df = generate_channel_features(df)
    
    categorical_cols = ['age_group', 'device_type', 'activity_time', 'preferred_category', 'engagement_level']
    numerical_cols = ['email_click_rate', 'whatsapp_click_rate', 'push_click_rate', 'fatigue_score', 'max_click_rate', 'is_highly_engaged']
    
    df_cat = preprocessor.transform_categorical(df, categorical_cols)
    df_ready = preprocessor.scale_numerical(df_cat, numerical_cols, is_training=False)
    
    features = categorical_cols + numerical_cols
    X = df_ready[features]
    
    prob_dist = model.predict_proba(X)[0]
    
    target_le = preprocessor.encoders['target']
    classes = target_le.inverse_transform(model.classes_)
    
    channel_scores = {classes[i]: round(float(prob_dist[i]), 4) for i in range(len(classes))}
    best_channel = max(channel_scores, key=channel_scores.get)
    max_prob = channel_scores[best_channel]
    
    return {
        "best_channel": best_channel,
        "confidence": format_confidence(max_prob),
        "channel_scores": channel_scores
    }
