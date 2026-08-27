"""
Module: data_preprocessing.py
Purpose: Complete leak-free data preprocessing pipeline for cardiovascular risk prediction.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import KNNImputer
from imblearn.over_sampling import SMOTE
import joblib

FEATURE_ORDER: List[str] = [
    'age',
    'sex',
    'systolic_bp',
    'diastolic_bp',
    'total_cholesterol',
    'hdl_cholesterol',
    'ldl_cholesterol',
    'triglycerides',
    'fasting_blood_glucose',
    'bmi',
    'smoking_status',
    'cigarettes_per_day',
    'diabetes_status',
    'resting_heart_rate',
    'family_history',
    'physical_activity',
    'on_hypertension_meds'
]

CONTINUOUS_FEATURES = [
    'age', 'systolic_bp', 'diastolic_bp', 'total_cholesterol',
    'hdl_cholesterol', 'ldl_cholesterol', 'triglycerides',
    'fasting_blood_glucose', 'bmi', 'cigarettes_per_day', 'resting_heart_rate'
]

CATEGORICAL_FEATURES = [
    'sex', 'smoking_status', 'diabetes_status', 'family_history',
    'physical_activity', 'on_hypertension_meds'
]


class CardioDataPipeline:
    """
    Encapsulates stateful preprocessing transformations (Imputer, Scaler, Column Ordering)
    to guarantee identical processing between training and real-time user inference.
    """
    def __init__(self, scaler_type: str = 'robust'):
        self.imputer = KNNImputer(n_neighbors=5, weights='distance')
        self.scaler = RobustScaler() if scaler_type == 'robust' else StandardScaler()
        self.feature_order = FEATURE_ORDER
        self.is_fitted = False
        self.feature_stats_: Dict[str, Any] = {}

    def fit(self, X: pd.DataFrame, y: pd.Series = None) -> 'CardioDataPipeline':
        """Fit preprocessing transformations strictly on the training set."""
        X_df = X[self.feature_order].copy()
        
        # Fit imputer
        self.imputer.fit(X_df)
        X_imputed = self.imputer.transform(X_df)
        X_imputed_df = pd.DataFrame(X_imputed, columns=self.feature_order)

        # Fit scaler on continuous features
        self.scaler.fit(X_imputed_df[CONTINUOUS_FEATURES])

        # Record feature baseline means and standard deviations
        self.feature_stats_ = {
            col: {
                'mean': float(X_imputed_df[col].mean()),
                'std': float(X_imputed_df[col].std()),
                'median': float(X_imputed_df[col].median()),
                'q25': float(X_imputed_df[col].quantile(0.25)),
                'q75': float(X_imputed_df[col].quantile(0.75))
            }
            for col in self.feature_order
        }

        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Apply fitted transformations to a new dataset or individual user record."""
        if not self.is_fitted:
            raise RuntimeError("CardioDataPipeline must be fitted before transforming data.")

        X_df = X[self.feature_order].copy()
        X_imputed = self.imputer.transform(X_df)
        X_imputed_df = pd.DataFrame(X_imputed, columns=self.feature_order)

        # Scale continuous features
        X_imputed_df[CONTINUOUS_FEATURES] = self.scaler.transform(X_imputed_df[CONTINUOUS_FEATURES])
        return X_imputed_df.values

    def save(self, filepath: str = "models/preprocessing_pipeline.joblib") -> None:
        """Serialize pipeline artifact to disk."""
        joblib.dump(self, filepath)
        print(f"[Pipeline] Saved preprocessing pipeline to: {filepath}")

    @classmethod
    def load(cls, filepath: str = "models/preprocessing_pipeline.joblib") -> 'CardioDataPipeline':
        """Load serialized pipeline artifact from disk."""
        pipeline = joblib.load(filepath)
        print(f"[Pipeline] Loaded preprocessing pipeline from: {filepath}")
        return pipeline


def prepare_training_data(
    data_path: str,
    target_column: str = 'cvd_risk_10yr',
    test_size: float = 0.20,
    random_state: int = 42,
    apply_smote: bool = True
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, CardioDataPipeline]:
    """
    Loads raw CSV, executes stratified train/test split, fits preprocessing, and optionally
    applies SMOTE exclusively to the training split.
    """
    df = pd.read_csv(data_path)
    X = df[FEATURE_ORDER]
    y = df[target_column]

    # Stratified Train/Test Split to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Fit pipeline ONLY on X_train
    pipeline = CardioDataPipeline(scaler_type='robust')
    pipeline.fit(X_train)

    X_train_proc = pipeline.transform(X_train)
    X_test_proc = pipeline.transform(X_test)

    # Address Class Imbalance via SMOTE exclusively on training partition
    if apply_smote:
        smote = SMOTE(random_state=random_state, sampling_strategy=0.75)
        X_train_proc, y_train = smote.fit_resample(X_train_proc, y_train)

    return X_train_proc, X_test_proc, y_train.values, y_test.values, pipeline
