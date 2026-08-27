"""
Module: train.py
Purpose: Model training, hyperparameter optimization, and artifact serialization.
"""

import os
import joblib
import numpy as np
from typing import Dict, Any
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold, cross_val_score
import xgboost as xgb

from data_preprocessing import prepare_training_data, CardioDataPipeline
from evaluate import evaluate_model_performance


def train_and_compare_models(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray
) -> Dict[str, Any]:
    """
    Trains multiple classification algorithms, conducts 5-Fold cross-validation,
    and returns models alongside evaluation benchmarks.
    """
    os.makedirs("models", exist_ok=True)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    candidate_models = {
        'xgboost': xgb.XGBClassifier(
            n_estimators=250,
            max_depth=4,
            learning_rate=0.04,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric='logloss',
            random_state=42
        ),
        'random_forest': RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            min_samples_split=6,
            min_samples_leaf=3,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ),
        'logistic_regression': LogisticRegression(
            penalty='elasticnet',
            solver='saga',
            l1_ratio=0.5,
            C=0.8,
            max_iter=2000,
            random_state=42
        ),
        'svm': SVC(
            kernel='rbf',
            C=1.2,
            gamma='scale',
            probability=True,
            random_state=42
        )
    }

    results = {}
    best_score = -1.0
    best_model_name = None
    best_model_obj = None

    print("\n=======================================================")
    print("      TRAINING & CROSS-VALIDATION BENCHMARK")
    print("=======================================================")

    for name, model in candidate_models.items():
        print(f"\n[Training] Evaluating algorithm: {name.upper()}...")
        # 5-Fold CV ROC-AUC
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='roc_auc', n_jobs=-1)
        mean_roc = float(np.mean(cv_scores))
        std_roc = float(np.std(cv_scores))

        # Fit on full training set
        model.fit(X_train, y_train)

        # Test set evaluation
        metrics = evaluate_model_performance(model, X_test, y_test, model_name=name)
        metrics['cv_roc_auc_mean'] = mean_roc
        metrics['cv_roc_auc_std'] = std_roc

        results[name] = {
            'model': model,
            'metrics': metrics
        }

        print(f"  -> 5-Fold CV ROC-AUC: {mean_roc:.4f} (+/- {std_roc:.4f})")
        print(f"  -> Test ROC-AUC:      {metrics['roc_auc']:.4f}")
        print(f"  -> Test Accuracy:     {metrics['accuracy']:.4f}")
        print(f"  -> Test F1-Score:     {metrics['f1_score']:.4f}")

        if mean_roc > best_score:
            best_score = mean_roc
            best_model_name = name
            best_model_obj = model

    print(f"\n[Selection] Best Performing Algorithm: {best_model_name.upper()} (CV ROC-AUC: {best_score:.4f})")

    # Serialize best model and all candidates
    joblib.dump(best_model_obj, "models/best_cardio_model.joblib")
    joblib.dump(results, "models/all_model_benchmarks.joblib")
    print("[Serialization] Saved top model to 'models/best_cardio_model.joblib'")

    return results


if __name__ == "__main__":
    DATA_PATH = "data/cardio_train.csv"
    print(f"[Init] Loading data and preparing pipeline from {DATA_PATH}...")
    X_train, X_test, y_train, y_test, pipeline = prepare_training_data(DATA_PATH)
    pipeline.save("models/preprocessing_pipeline.joblib")

    benchmarks = train_and_compare_models(X_train, y_train, X_test, y_test)
