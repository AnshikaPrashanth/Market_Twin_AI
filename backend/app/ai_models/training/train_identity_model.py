import os
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

from app.ai_models.training.preprocessors import BasePreprocessor
from app.ai_models.training.evaluation import evaluate_model
from app.ai_models.training.save_models import save_model

def synthesize_identity_training_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Identities dataset typically lists raw IDs. We will generate synthetic
    pairs (match vs no_match) to train the XGBoost classifier based on the rules.
    """
    pairs = []
    
    # Generate Positive matches
    for _, group in df.groupby('customer_id'):
        if len(group) > 1:
            for i in range(len(group) - 1):
                row1 = group.iloc[i]
                row2 = group.iloc[i+1]
                pairs.append({
                    "same_city": random.choice([1, 0]) if row1['matched_by'] == 'probabilistic' else 1,
                    "same_browser": 1 if row1['browser'] == row2['browser'] and row1['browser'] else 0,
                    "same_device_type": 1 if row1['device_type'] == row2['device_type'] and row1['device_type'] else 0,
                    "same_active_hours": 1 if row1['active_hours'] == row2['active_hours'] else 0,
                    "same_product_interest": random.choice([1, 0]),
                    "same_ip_region": 1 if row1['ip_region'] == row2['ip_region'] else 0,
                    "same_channel_behavior": random.choice([1, 0]),
                    "is_same_customer": 1
                })
                
    # Generate Negative matches
    customer_ids = df['customer_id'].unique()
    for _ in range(len(pairs)):
        c1, c2 = np.random.choice(customer_ids, 2, replace=False)
        pairs.append({
            "same_city": random.choice([1, 0]),
            "same_browser": random.choice([1, 0]),
            "same_device_type": random.choice([1, 0]),
            "same_active_hours": random.choice([1, 0]),
            "same_product_interest": random.choice([1, 0]),
            "same_ip_region": random.choice([1, 0]),
            "same_channel_behavior": random.choice([1, 0]),
            "is_same_customer": 0
        })
        
    return pd.DataFrame(pairs)

import random

def train():
    print("Training Identity Resolution Model...")
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "identities.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    df_raw = pd.read_csv(data_path)
    df = synthesize_identity_training_data(df_raw)
    
    features = ['same_city', 'same_browser', 'same_device_type', 'same_active_hours', 
                'same_product_interest', 'same_ip_region', 'same_channel_behavior']
    target_col = 'is_same_customer'
    
    X = df[features]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    metrics = evaluate_model("identity_model", y_test, y_pred, y_prob)
    print("Metrics:", metrics)
    
    # Save
    save_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    save_model(model, os.path.join(save_dir, "identity_model.pkl"))
    # Identity model uses only numerical boolean features, no preprocessor needed
    print("Identity model training complete.\n")

if __name__ == "__main__":
    train()
