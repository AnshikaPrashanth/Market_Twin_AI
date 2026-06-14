import os
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split

from app.ai_models.training.preprocessors import BasePreprocessor
from app.ai_models.training.feature_engineering import generate_channel_features
from app.ai_models.training.evaluation import evaluate_model
from app.ai_models.training.save_models import save_model

def train():
    print("Training Best Channel Model...")
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "channel_prediction_training.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    # Feature Engineering
    df = generate_channel_features(df)
    
    categorical_cols = ['age_group', 'device_type', 'activity_time', 'preferred_category', 'engagement_level']
    numerical_cols = ['email_click_rate', 'whatsapp_click_rate', 'push_click_rate', 'fatigue_score', 'max_click_rate', 'is_highly_engaged']
    
    target_col = 'historical_best_channel'
    
    # Preprocessing
    preprocessor = BasePreprocessor()
    df_cat = preprocessor.fit_transform_categorical(df, categorical_cols)
    
    # Also encode target label
    from sklearn.preprocessing import LabelEncoder
    target_le = LabelEncoder()
    df_cat['target'] = target_le.fit_transform(df_cat[target_col])
    preprocessor.encoders['target'] = target_le
    
    df_ready = preprocessor.scale_numerical(df_cat, numerical_cols)
    
    features = categorical_cols + numerical_cols
    X = df_ready[features]
    y = df_ready['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = GradientBoostingClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    metrics = evaluate_model("channel_model", y_test, y_pred, y_prob)
    print("Metrics:", metrics)
    
    # Save
    save_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    save_model(model, os.path.join(save_dir, "channel_model.pkl"))
    save_model(preprocessor, os.path.join(save_dir, "channel_preprocessor.pkl"))
    print("Channel model training complete.\n")

if __name__ == "__main__":
    train()
