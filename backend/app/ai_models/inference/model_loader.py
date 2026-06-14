import os
from app.ai_models.training.save_models import load_model

class ModelRegistry:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._load_all()
        return cls._instance

    def _load_all(self):
        self.models = {}
        self.preprocessors = {}
        
        base_dir = os.path.join(os.path.dirname(__file__), "..", "models")
        
        # Load Conversion
        try:
            self.models['conversion'] = load_model(os.path.join(base_dir, "conversion_model.pkl"))
            self.preprocessors['conversion'] = load_model(os.path.join(base_dir, "conversion_preprocessor.pkl"))
        except Exception as e:
            print(f"Warning: Failed to load conversion model: {e}")
            
        # Load Identity
        try:
            self.models['identity'] = load_model(os.path.join(base_dir, "identity_model.pkl"))
        except Exception as e:
            print(f"Warning: Failed to load identity model: {e}")
            
        # Load Channel
        try:
            self.models['channel'] = load_model(os.path.join(base_dir, "channel_model.pkl"))
            self.preprocessors['channel'] = load_model(os.path.join(base_dir, "channel_preprocessor.pkl"))
        except Exception as e:
            print(f"Warning: Failed to load channel model: {e}")
            
        # Load NBA
        try:
            self.models['nba'] = load_model(os.path.join(base_dir, "nba_model.pkl"))
            self.preprocessors['nba'] = load_model(os.path.join(base_dir, "nba_preprocessor.pkl"))
        except Exception as e:
            print(f"Warning: Failed to load NBA model: {e}")

model_registry = ModelRegistry()
