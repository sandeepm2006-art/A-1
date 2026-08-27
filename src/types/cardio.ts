export interface CardioInputParams {
  age: number; // 20 - 90
  sex: number; // 0 = Female, 1 = Male
  systolicBP: number; // 80 - 240 mmHg
  diastolicBP: number; // 50 - 140 mmHg
  totalCholesterol: number; // 100 - 450 mg/dL
  hdlCholesterol: number; // 20 - 100 mg/dL
  ldlCholesterol: number; // 40 - 300 mg/dL
  triglycerides: number; // 50 - 500 mg/dL
  fastingBloodGlucose: number; // 60 - 350 mg/dL
  bmi: number; // 15 - 55 kg/m2
  smokingStatus: number; // 0 = No, 1 = Yes
  cigarettesPerDay: number; // 0 - 60
  diabetesStatus: number; // 0 = No, 1 = Yes
  restingHeartRate: number; // 40 - 150 bpm
  familyHistory: number; // 0 = No, 1 = Yes
  physicalActivity: number; // 0 = Sedentary, 1 = Light, 2 = Moderate, 3 = Active
  onHypertensionMeds: number; // 0 = No, 1 = Yes
}

export type ModelType = 'xgboost' | 'random_forest' | 'logistic_regression' | 'svm';

export type RiskCategory = 'Low' | 'Borderline' | 'Intermediate' | 'High';

export interface ValidationIssue {
  field: keyof CardioInputParams;
  message: string;
  type: 'error' | 'warning';
}

export interface ShapContribution {
  featureName: string;
  displayName: string;
  originalValue: string | number;
  unit: string;
  shapValue: number; // in log-odds or probability contribution
  direction: 'increase' | 'decrease';
  clinicalContext: string;
  isModifiable: boolean;
}

export interface PredictionResult {
  riskProbability: number; // 0 - 1
  riskScorePercent: number; // 0 - 100%
  riskCategory: RiskCategory;
  categoryColor: string;
  categoryDescription: string;
  baseValue: number; // E[f(x)] population baseline (e.g. 0.142)
  modelType: ModelType;
  modelName: string;
  shapContributions: ShapContribution[];
  topRiskFactors: ShapContribution[];
  topProtectiveFactors: ShapContribution[];
  counterfactualSuggestions: CounterfactualGoal[];
}

export interface CounterfactualGoal {
  feature: keyof CardioInputParams;
  displayName: string;
  currentValue: number;
  recommendedValue: number;
  potentialRiskReduction: number; // e.g. -4.8%
  clinicalAction: string;
}

export interface ModelMetrics {
  name: string;
  type: ModelType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  sensitivity: number;
  specificity: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  rocCurve: { fpr: number; tpr: number; threshold: number }[];
  prCurve: { recall: number; precision: number; threshold: number }[];
  description: string;
}

export interface GlobalShapFeature {
  featureKey: string;
  displayName: string;
  meanAbsShap: number;
  category: 'clinical' | 'lifestyle' | 'demographic' | 'biomarker';
  description: string;
}

export interface BeeswarmPoint {
  id: number;
  featureKey: string;
  featureValueNorm: number; // 0 (low) to 1 (high)
  featureValueRaw: number;
  shapValue: number;
  jitter: number;
}

export interface PresetPatient {
  id: string;
  name: string;
  badge: string;
  description: string;
  expectedCategory: RiskCategory;
  params: CardioInputParams;
}

export interface PythonModuleCode {
  filename: string;
  title: string;
  description: string;
  category: 'preprocessing' | 'training' | 'prediction' | 'explainability' | 'app' | 'test';
  code: string;
}
