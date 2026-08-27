"""
Module: evaluate.py
Purpose: Comprehensive evaluation metrics and diagnostics for clinical risk models.
"""

import numpy as np
from typing import Dict, Any
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, brier_score_loss,
    confusion_matrix, classification_report
)


def evaluate_model_performance(
    model: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    model_name: str = "model",
    threshold: float = 0.50
) -> Dict[str, Any]:
    """
    Computes all standard clinical ML classification metrics on the holdout test set.
    """
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= threshold).astype(int)

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    metrics = {
        'model_name': model_name,
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision_score(y_test, y_pred, zero_division=0)),
        'recall': float(recall_score(y_test, y_pred, zero_division=0)),
        'f1_score': float(f1_score(y_test, y_pred, zero_division=0)),
        'roc_auc': float(roc_auc_score(y_test, y_prob)),
        'pr_auc': float(average_precision_score(y_test, y_prob)),
        'brier_score': float(brier_score_loss(y_test, y_prob)),
        'sensitivity': float(sensitivity),
        'specificity': float(specificity),
        'confusion_matrix': {
            'true_positive': int(tp),
            'false_positive': int(fp),
            'true_negative': int(tn),
            'false_negative': int(fn)
        },
        'classification_report': classification_report(y_test, y_pred, output_dict=True)
    }

    return metrics
