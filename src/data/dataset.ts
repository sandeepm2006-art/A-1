export interface DatasetSummary {
  totalRecords: number;
  totalFeatures: number;
  targetPositiveClassCount: number;
  targetNegativeClassCount: number;
  positiveClassRatio: number;
  missingValuesHandling: string;
  imbalanceHandling: string;
  trainTestSplitRatio: string;
  validationStrategy: string;
}

export const DATASET_STATS: DatasetSummary = {
  totalRecords: 4240,
  totalFeatures: 17,
  targetPositiveClassCount: 644,
  targetNegativeClassCount: 3596,
  positiveClassRatio: 0.1519, // ~15.2% raw positive imbalance
  missingValuesHandling: 'KNN Imputation (k=5, distance-weighted) for continuous clinical biomarkers; median for bounded integers.',
  imbalanceHandling: 'SMOTE (Synthetic Minority Over-sampling Technique) applied strictly within training folds to prevent data leakage.',
  trainTestSplitRatio: '80% Training (Stratified n=3,392) / 20% Holdout Test (n=848)',
  validationStrategy: '5-Fold Stratified Cross-Validation with Nested Bayesian Hyperparameter Tuning'
};

export interface FeatureDistribution {
  name: string;
  key: string;
  unit: string;
  bins: { range: string; countNoCVD: number; countCVD: number }[];
}

export const SAMPLE_DISTRIBUTIONS: FeatureDistribution[] = [
  {
    name: 'Systolic Blood Pressure (mmHg)',
    key: 'systolicBP',
    unit: 'mmHg',
    bins: [
      { range: '<110', countNoCVD: 340, countCVD: 18 },
      { range: '110-120', countNoCVD: 890, countCVD: 64 },
      { range: '121-130', countNoCVD: 980, countCVD: 112 },
      { range: '131-140', countNoCVD: 680, countCVD: 148 },
      { range: '141-160', countNoCVD: 510, countCVD: 184 },
      { range: '>160', countNoCVD: 196, countCVD: 118 }
    ]
  },
  {
    name: 'Age (Years)',
    key: 'age',
    unit: 'years',
    bins: [
      { range: '20-39', countNoCVD: 560, countCVD: 22 },
      { range: '40-49', countNoCVD: 1240, countCVD: 128 },
      { range: '50-59', countNoCVD: 1110, countCVD: 242 },
      { range: '60-69', countNoCVD: 580, countCVD: 214 },
      { range: '70+', countNoCVD: 106, countCVD: 38 }
    ]
  },
  {
    name: 'Total Cholesterol (mg/dL)',
    key: 'totalCholesterol',
    unit: 'mg/dL',
    bins: [
      { range: '<180', countNoCVD: 480, countCVD: 44 },
      { range: '180-200', countNoCVD: 720, countCVD: 96 },
      { range: '201-239', countNoCVD: 1380, countCVD: 236 },
      { range: '240-279', countNoCVD: 750, countCVD: 182 },
      { range: '280+', countNoCVD: 266, countCVD: 86 }
    ]
  },
  {
    name: 'BMI (kg/m²)',
    key: 'bmi',
    unit: 'kg/m²',
    bins: [
      { range: '<20', countNoCVD: 210, countCVD: 16 },
      { range: '20-24.9', countNoCVD: 1420, countCVD: 164 },
      { range: '25-29.9', countNoCVD: 1390, countCVD: 278 },
      { range: '30-34.9', countNoCVD: 440, countCVD: 138 },
      { range: '35+', countNoCVD: 136, countCVD: 48 }
    ]
  }
];

export interface CorrelationMatrixItem {
  feature1: string;
  feature2: string;
  r: number;
}

export const CORRELATION_MATRIX: CorrelationMatrixItem[] = [
  { feature1: 'Systolic BP', feature2: 'Diastolic BP', r: 0.78 },
  { feature1: 'Systolic BP', feature2: 'Age', r: 0.41 },
  { feature1: 'Systolic BP', feature2: 'CVD Risk', r: 0.44 },
  { feature1: 'Total Chol', feature2: 'LDL Chol', r: 0.89 },
  { feature1: 'Total Chol', feature2: 'HDL Chol', r: 0.18 },
  { feature1: 'HDL Chol', feature2: 'CVD Risk', r: -0.34 },
  { feature1: 'Smoking Status', feature2: 'Cigarettes/Day', r: 0.94 },
  { feature1: 'Smoking Status', feature2: 'CVD Risk', r: 0.32 },
  { feature1: 'Fasting Glucose', feature2: 'Diabetes Status', r: 0.62 },
  { feature1: 'Diabetes Status', feature2: 'CVD Risk', r: 0.28 },
  { feature1: 'BMI', feature2: 'Systolic BP', r: 0.34 },
  { feature1: 'BMI', feature2: 'Triglycerides', r: 0.31 },
  { feature1: 'Physical Activity', feature2: 'CVD Risk', r: -0.26 },
  { feature1: 'Family History', feature2: 'CVD Risk', r: 0.24 }
];

export const PREPROCESSING_PIPELINE_STEPS = [
  {
    stepNumber: 1,
    title: 'Data Ingestion & Integrity Audit',
    description: 'Load multi-parametric clinical dataset. Check data types, physiological range anomalies, and zero-variance columns.',
    leakagePrevention: 'Data audit performed on raw schema without computing global parametric statistics.'
  },
  {
    stepNumber: 2,
    title: 'Stratified Train/Test Split (80/20)',
    description: 'Partition dataset into 3,392 train records and 848 holdout test records while maintaining exact class balance proportions.',
    leakagePrevention: 'All imputation, scaling, and feature selection transformers are fit ONLY on the training fold, then transformed on test/inference.'
  },
  {
    stepNumber: 3,
    title: 'Missing Value Imputation',
    description: 'Apply distance-weighted KNN (k=5) for physiological continuous biomarkers and median imputation for discrete variables.',
    leakagePrevention: 'Imputer learns neighbor centroids solely from training samples. Zero target values used during imputation.'
  },
  {
    stepNumber: 4,
    title: 'Categorical & Binary Encoding',
    description: 'Deterministic binary encoding for binary factors (Sex, Smoker, Diabetes, Meds, Family History) and ordinal scaling for physical activity.',
    leakagePrevention: 'Exact categorical map frozen and exported in pipeline metadata dictionary.'
  },
  {
    stepNumber: 5,
    title: 'Class Imbalance Treatment (SMOTE)',
    description: 'Synthetic Minority Over-sampling Technique (SMOTE) generates synthetic positive CVD samples to balance class priors during training.',
    leakagePrevention: 'CRITICAL: SMOTE is strictly executed inside training folds after cross-validation split. Test set remains 100% natural and untouched.'
  },
  {
    stepNumber: 6,
    title: 'Feature Scaling & Standardization',
    description: 'RobustScaler / StandardScaler applied to continuous features (BP, Lipids, Age, Glucose) preserving median and interquartile range.',
    leakagePrevention: 'Scaler mean/variance parameters saved to serialized pipeline bundle (.joblib) for exact reproduction during real-time inference.'
  }
];
