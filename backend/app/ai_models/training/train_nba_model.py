import os
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from app.ai_models.training.preprocessors import BasePreprocessor
from app.ai_models.training.evaluation import evaluate_model
from app.ai_models.training.save_models import save_model

def train():
    print("Training Next Best Action (NBA) Model...")
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "nba_training.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    categorical_cols = ['journey_stage', 'preferred_channel']
    numerical_cols = ['intent_score', 'conversion_probability', 'churn_risk', 'fatigue_score']
    
    target_col = 'recommended_action'
    
    # Preprocessing
    preprocessor = BasePreprocessor()
    df_cat = preprocessor.fit_transform_categorical(df, categorical_cols)
    
    # Target Encoding
    target_le = LabelEncoder()
    df_cat['target'] = target_le.fit_transform(df_cat[target_col])
    preprocessor.encoders['target'] = target_le
    
    df_ready = preprocessor.scale_numerical(df_cat, numerical_cols)
    
    features = categorical_cols + numerical_cols
    X = df_ready[features]
    y = df_ready['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    metrics = evaluate_model("nba_model", y_test, y_pred, y_prob)
    print("Metrics:", metrics)
    
    # Save
    save_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    save_model(model, os.path.join(save_dir, "nba_model.pkl"))
    save_model(preprocessor, os.path.join(save_dir, "nba_preprocessor.pkl"))
    print("NBA model training complete.\n")

if __name__ == "__main__":
    train()
