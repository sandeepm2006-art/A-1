"""
Module: explain.py
Purpose: Explainable AI with SHAP (SHapley Additive exPlanations) for local & global interpretability.
"""

import shap
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from data_preprocessing import FEATURE_ORDER


class CardioShapExplainer:
    """
    Manages SHAP explainability calculations for tree-based models and general pipelines.
    """
    def __init__(self, model: Any, background_data: np.ndarray = None):
        self.model = model
        self.feature_names = FEATURE_ORDER

        # Initialize appropriate explainer
        if hasattr(model, 'tree_') or hasattr(model, 'get_booster') or 'forest' in str(type(model)).lower():
            self.explainer = shap.TreeExplainer(model)
        else:
            # Fallback to KernelExplainer with medoid background sample
            if background_data is None:
                raise ValueError("Background data required for non-tree KernelExplainer.")
            background_summary = shap.kmeans(background_data, 25)
            self.explainer = shap.KernelExplainer(model.predict_proba, background_summary)

        # Baseline expected value E[f(x)]
        if isinstance(self.explainer.expected_value, (list, np.ndarray)):
            self.expected_value = float(self.explainer.expected_value[1])
        else:
            self.expected_value = float(self.explainer.expected_value)

    def explain_individual(
        self,
        X_sample: np.ndarray,
        raw_feature_values: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Computes SHAP values for an individual patient inference.
        Returns base value, feature contributions, and sorted risk drivers.
        """
        if len(X_sample.shape) == 1:
            X_sample = X_sample.reshape(1, -1)

        shap_values = self.explainer.shap_values(X_sample)

        # Handle binary classification outputs
        if isinstance(shap_values, list):
            sample_shap = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            sample_shap = shap_values[0, :, 1]
        else:
            sample_shap = shap_values[0]

        contributions = []
        for i, feature_name in enumerate(self.feature_names):
            val = sample_shap[i]
            orig_val = raw_feature_values.get(feature_name, X_sample[0, i])
            contributions.append({
                'feature': feature_name,
                'shap_value': float(val),
                'direction': 'increase' if val > 0 else 'decrease',
                'original_value': orig_val
            })

        # Sort by absolute SHAP magnitude
        contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)

        return {
            'base_value': self.expected_value,
            'shap_sum': float(np.sum(sample_shap)),
            'contributions': contributions,
            'top_risk_factors': [c for c in contributions if c['shap_value'] > 0][:5],
            'top_protective_factors': [c for c in contributions if c['shap_value'] < 0][:5]
        }

    def compute_global_importance(self, X_eval: np.ndarray) -> pd.DataFrame:
        """
        Calculates mean absolute SHAP values across evaluation cohort for global ranking.
        """
        shap_values = self.explainer.shap_values(X_eval)
        if isinstance(shap_values, list):
            vals = np.abs(shap_values[1]).mean(axis=0)
        else:
            vals = np.abs(shap_values).mean(axis=0)

        df = pd.DataFrame({
            'feature': self.feature_names,
            'mean_abs_shap': vals
        }).sort_values('mean_abs_shap', ascending=False)
        return df
