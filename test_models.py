import os
import sys
sys.path.append(os.path.abspath('backend'))

from backend.app.ai_models.training.save_models import load_model

base_dir = os.path.abspath('backend/app/ai_models/models')
print("Base dir:", base_dir)

try:
    model = load_model(os.path.join(base_dir, 'conversion_model.pkl'))
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error: {e}")
