import joblib
import os

def save_model(model, filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model successfully saved to {filepath}")

def load_model(filepath: str):
    return joblib.load(filepath)
