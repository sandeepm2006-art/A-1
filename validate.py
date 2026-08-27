"""
Module: validate.py
Purpose: Input validation schemas and clinical sanity checks for multi-parametric cardiovascular risk prediction.
"""

from typing import Dict, Any, List, Tuple
from pydantic import BaseModel, Field, model_validator


class CardioInputSchema(BaseModel):
    """Pydantic model enforcing strict types and physiological boundaries."""
    age: float = Field(..., ge=20, le=90, description="Age in years (20-90)")
    sex: int = Field(..., ge=0, le=1, description="0 = Female, 1 = Male")
    systolic_bp: float = Field(..., ge=80, le=240, description="Systolic Blood Pressure (mmHg)")
    diastolic_bp: float = Field(..., ge=50, le=140, description="Diastolic Blood Pressure (mmHg)")
    total_cholesterol: float = Field(..., ge=100, le=450, description="Total Cholesterol (mg/dL)")
    hdl_cholesterol: float = Field(..., ge=20, le=100, description="HDL Cholesterol (mg/dL)")
    ldl_cholesterol: float = Field(..., ge=40, le=300, description="LDL Cholesterol (mg/dL)")
    triglycerides: float = Field(..., ge=50, le=500, description="Triglycerides (mg/dL)")
    fasting_blood_glucose: float = Field(..., ge=60, le=350, description="Fasting Blood Glucose (mg/dL)")
    bmi: float = Field(..., ge=15.0, le=55.0, description="Body Mass Index (kg/m²)")
    smoking_status: int = Field(..., ge=0, le=1, description="0 = Non-smoker, 1 = Smoker")
    cigarettes_per_day: float = Field(..., ge=0, le=60, description="Cigarettes consumed per day (0-60)")
    diabetes_status: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")
    resting_heart_rate: float = Field(..., ge=40, le=150, description="Resting Heart Rate (bpm)")
    family_history: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")
    physical_activity: int = Field(..., ge=0, le=3, description="0 = Sedentary, 1 = Light, 2 = Moderate, 3 = Active")
    on_hypertension_meds: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")

    @model_validator(mode='after')
    def validate_clinical_consistency(self) -> 'CardioInputSchema':
        # Rule 1: Diastolic BP cannot exceed or equal Systolic BP
        if self.diastolic_bp >= self.systolic_bp:
            raise ValueError(f"Diastolic BP ({self.diastolic_bp}) must be strictly less than Systolic BP ({self.systolic_bp}).")
        
        # Rule 2: Pulse pressure warning sanity
        if (self.systolic_bp - self.diastolic_bp) < 15:
            raise ValueError(f"Pulse pressure ({self.systolic_bp - self.diastolic_bp} mmHg) is non-physiologically narrow (<15 mmHg).")

        # Rule 3: Non-smoker cigarettes consistency
        if self.smoking_status == 0 and self.cigarettes_per_day > 0:
            self.cigarettes_per_day = 0.0

        # Rule 4: Smoker without quantity specified default
        if self.smoking_status == 1 and self.cigarettes_per_day <= 0:
            self.cigarettes_per_day = 10.0

        return self


def validate_input_dict(raw_data: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Validates a raw dictionary input before passing it to the ML inference pipeline.
    Returns: (is_valid, list_of_errors_or_warnings, sanitized_dict)
    """
    errors = []
    try:
        validated_obj = CardioInputSchema(**raw_data)
        return True, [], validated_obj.model_dump()
    except Exception as e:
        if hasattr(e, 'errors'):
            for err in e.errors():
                loc = " -> ".join(str(l) for l in err.get("loc", []))
                msg = err.get("msg", "Invalid value")
                errors.append(f"Field '{loc}': {msg}")
        else:
            errors.append(str(e))
        return False, errors, raw_data
