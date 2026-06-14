from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Dict, Any

def evaluate_model(model_name: str, y_true, y_pred, y_prob=None) -> Dict[str, Any]:
    metrics = {
        "model": model_name,
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, average='weighted', zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, average='weighted', zero_division=0), 4),
        "f1_score": round(f1_score(y_true, y_pred, average='weighted', zero_division=0), 4)
    }
    
    if y_prob is not None:
        try:
            # Handle multiclass vs binary roc_auc
            if len(y_prob.shape) > 1 and y_prob.shape[1] > 2:
                metrics["roc_auc"] = round(roc_auc_score(y_true, y_prob, multi_class='ovr'), 4)
            else:
                metrics["roc_auc"] = round(roc_auc_score(y_true, y_prob[:, 1] if len(y_prob.shape) > 1 else y_prob), 4)
        except Exception as e:
            metrics["roc_auc"] = None
            
    return metrics
