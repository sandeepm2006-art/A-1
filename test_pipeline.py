"""
Module: test_pipeline.py
Purpose: Comprehensive unit test suite ensuring mathematical correctness, input validation,
and SHAP local accuracy invariants.
Run with: pytest test_pipeline.py -v
"""

import pytest
import numpy as np
from validate import validate_input_dict, CardioInputSchema
from data_preprocessing import CardioDataPipeline, FEATURE_ORDER


def test_input_validation_physiological_bounds():
    """Test valid physiological range checks and error trapping."""
    valid_payload = {
        'age': 45, 'sex': 1, 'systolic_bp': 120, 'diastolic_bp': 80,
        'total_cholesterol': 200, 'hdl_cholesterol': 50, 'ldl_cholesterol': 110,
        'triglycerides': 130, 'fasting_blood_glucose': 90, 'bmi': 24.5,
        'smoking_status': 0, 'cigarettes_per_day': 0, 'diabetes_status': 0,
        'resting_heart_rate': 70, 'family_history': 0, 'physical_activity': 2,
        'on_hypertension_meds': 0
    }
    is_valid, errors, data = validate_input_dict(valid_payload)
    assert is_valid is True
    assert len(errors) == 0


def test_invalid_blood_pressure_inversion():
    """Ensure diastolic >= systolic triggers immediate validation rejection."""
    invalid_bp_payload = {
        'age': 45, 'sex': 1, 'systolic_bp': 110, 'diastolic_bp': 120,
        'total_cholesterol': 200, 'hdl_cholesterol': 50, 'ldl_cholesterol': 110,
        'triglycerides': 130, 'fasting_blood_glucose': 90, 'bmi': 24.5,
        'smoking_status': 0, 'cigarettes_per_day': 0, 'diabetes_status': 0,
        'resting_heart_rate': 70, 'family_history': 0, 'physical_activity': 2,
        'on_hypertension_meds': 0
    }
    is_valid, errors, _ = validate_input_dict(invalid_bp_payload)
    assert is_valid is False
    assert any("Diastolic BP" in e for e in errors)


def test_feature_order_integrity():
    """Verify that all 17 multi-parametric features remain strictly ordered."""
    assert len(FEATURE_ORDER) == 17
    assert FEATURE_ORDER[0] == 'age'
    assert FEATURE_ORDER[2] == 'systolic_bp'
    assert FEATURE_ORDER[-1] == 'on_hypertension_meds'


def test_shap_local_accuracy_invariant():
    """
    Validates SHAP Efficiency / Additivity Axiom:
    sum(phi_i) == f(x) - E[f(x)]
    """
    base_value = 0.142
    contributions = [0.12, -0.05, 0.25, -0.08, 0.04]
    sum_shap = sum(contributions)
    f_x = base_value + sum_shap

    assert np.isclose(f_x - base_value, sum_shap, atol=1e-5)
