# Explainable Machine Learning Pipeline for Multi-Parametric Cardiovascular Risk Prediction

An end-to-end, interpretable AI system for predicting 10-year multi-parametric cardiovascular disease risk using XGBoost, Random Forest, ElasticNet Logistic Regression, and SHAP (SHapley Additive exPlanations).

---

## 🏛️ System Architecture

```
User Health Information (17 Parameters)
                 │
                 ▼
         Input Validation (Pydantic / Clinical Rules)
                 │
                 ▼
     Preprocessing Pipeline (KNN Imputation + Robust Scaling)
                 │
                 ▼
       Trained ML Model (XGBoost / Random Forest)
                 │
                 ▼
     Cardiovascular Risk Prediction & Probability (%)
                 │
                 ▼
       Clinical Risk Stratification (ACC/AHA Tiers)
                 │
                 ▼
      SHAP Explainability (Local Waterfall & Global Beeswarm)
                 │
                 ▼
     Interactive Streamlit Dashboard & Counterfactual Lab
```

---

## 🚀 Quickstart & Setup

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train and Evaluate All Models
```bash
python train.py
```

### 3. Run PyTest Unit Tests
```bash
pytest test_pipeline.py -v
```

### 4. Launch the Interactive Streamlit Web Application
```bash
streamlit run app_streamlit.py
```

---

## 🩺 Supported Cardiovascular Parameters

1. **Age** (years, 20–90)
2. **Biological Sex** (Female / Male)
3. **Systolic Blood Pressure** (80–240 mmHg)
4. **Diastolic Blood Pressure** (50–140 mmHg)
5. **Total Cholesterol** (100–450 mg/dL)
6. **HDL Cholesterol** (20–100 mg/dL, protective biomarker)
7. **LDL Cholesterol** (40–300 mg/dL, atherogenic sterol)
8. **Triglycerides** (50–500 mg/dL)
9. **Fasting Blood Glucose** (60–350 mg/dL)
10. **Body Mass Index (BMI)** (15–55 kg/m²)
11. **Smoking Status & Daily Dose** (0–60 cigarettes/day)
12. **Diabetes Mellitus** (0 = No, 1 = Yes)
13. **Resting Heart Rate** (40–150 bpm)
14. **Family History of Early CVD** (0 = No, 1 = Yes)
15. **Physical Activity Level** (Sedentary to Active)
16. **Anti-Hypertensive Medication** (0 = No, 1 = Yes)

---

## ⚖️ Research Disclaimer
This software is designed solely as an **educational and research prototype** for machine learning interpretability and multi-parametric risk estimation. It is **NOT** a clinical diagnostic tool or medical device.
