import numpy as np

def extract_feature_importance(model, feature_names):
    """
    Extracts feature importances from XGBoost or GradientBoosting models.
    Returns a sorted list of tuples: (feature_name, importance_score).
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        
        results = []
        for idx in sorted_indices:
            # Only include features with non-zero importance
            if importances[idx] > 0.01:
                results.append((feature_names[idx], round(float(importances[idx]), 3)))
        return results
    return []
