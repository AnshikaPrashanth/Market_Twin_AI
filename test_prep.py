import os
import sys
sys.path.append(os.path.abspath('backend'))

import joblib

base_dir = os.path.abspath('backend/app/ai_models/models')
print("Base dir:", base_dir)

try:
    p = joblib.load(os.path.join(base_dir, 'conversion_preprocessor.pkl'))
    print("Type:", type(p))
    print("Content:", p)
except Exception as e:
    print(f"Error: {e}")
