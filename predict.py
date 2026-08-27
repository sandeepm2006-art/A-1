"""
Module: predict.py
Purpose: Real-time user input prediction, validation, and explainability generator.
"""

import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple
from validate import validate_input_dict
from data_preprocessing import CardioDataPipeline, FEATURE_ORDER
from explain import CardioShapExplainer


class CardioRiskPredictor:
    """
    End-to-end predictor: validates inputs, scales via pipeline, performs inference,
    stratifies clinical risk category, and computes individual SHAP attributions.
    """
    def __init__(
        self,
        model_path: str = "models/best_cardio_model.joblib",
        pipeline_path: str = "models/preprocessing_pipeline.joblib"
    ):
        if not os.path.exists(model_path) or not os.path.exists(pipeline_path):
            raise FileNotFoundError(f"Model or pipeline artifacts not found at {model_path}, {pipeline_path}.")

        self.model = joblib.load(model_path)
        self.pipeline = CardioDataPipeline.load(pipeline_path)
        self.explainer = CardioShapExplainer(self.model)

    def predict_risk(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a raw input dictionary and returns calibrated risk probability, category,
        and SHAP explanation.
        """
        # Step 1: Input Validation
        is_valid, errors, validated_dict = validate_input_dict(raw_input)
        if not is_valid:
            return {
                'success': False,
                'errors': errors,
                'prediction': None
            }

        # Step 2: DataFrame creation adhering strictly to FEATURE_ORDER
        input_df = pd.DataFrame([validated_dict])[FEATURE_ORDER]

        # Step 3: Preprocessing & Scaling
        X_processed = self.pipeline.transform(input_df)

        # Step 4: Model Inference
        risk_prob = float(self.model.predict_proba(X_processed)[0, 1])
        risk_percent = round(risk_prob * 100, 1)

        # Step 5: Clinical Risk Stratification
        if risk_percent >= 20.0:
            category = 'High'
            desc = '10-Year ASCVD Risk ≥ 20.0%. High risk tier requiring clinical attention.'
        elif risk_percent >= 12.5:
            category = 'Intermediate'
            desc = '10-Year ASCVD Risk 12.5% - 19.9%. Moderate-to-high risk tier.'
        elif risk_percent >= 7.5:
            category = 'Borderline'
            desc = '10-Year ASCVD Risk 7.5% - 12.4%. Borderline risk tier.'
        else:
            category = 'Low'
            desc = '10-Year ASCVD Risk < 7.5%. Low risk tier; maintain healthy lifestyle.'

        # Step 6: SHAP Explanation
        shap_explanation = self.explainer.explain_individual(X_processed, validated_dict)

        return {
            'success': True,
            'errors': [],
            'risk_probability': risk_prob,
            'risk_percentage': risk_percent,
            'risk_category': category,
            'category_description': desc,
            'shap_explanation': shap_explanation,
            'disclaimer': 'This tool is an educational research prototype and is NOT a medical diagnostic tool.'
        }
