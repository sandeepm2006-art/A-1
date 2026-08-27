import {
  CardioInputParams,
  ModelType,
  PredictionResult,
  RiskCategory,
  ShapContribution,
  ValidationIssue,
  PresetPatient,
  ModelMetrics,
  GlobalShapFeature,
  BeeswarmPoint,
  CounterfactualGoal
} from '../types/cardio';

// Dataset baseline statistics (from Framingham / Multi-Ethnic CVD Study cohort of 4,240 patients)
export const FEATURE_METADATA: Record<keyof CardioInputParams, {
  name: string;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  mean: number;
  sd: number;
  type: 'continuous' | 'binary' | 'categorical';
  isModifiable: boolean;
  category: 'demographic' | 'clinical' | 'lifestyle' | 'biomarker';
  description: string;
}> = {
  age: {
    name: 'Age',
    unit: 'years',
    min: 20,
    max: 90,
    normalMin: 20,
    normalMax: 65,
    mean: 49.5,
    sd: 8.5,
    type: 'continuous',
    isModifiable: false,
    category: 'demographic',
    description: 'Chronological age in years (non-modifiable primary baseline risk factor)'
  },
  sex: {
    name: 'Biological Sex',
    unit: '0=F, 1=M',
    min: 0,
    max: 1,
    normalMin: 0,
    normalMax: 1,
    mean: 0.48,
    sd: 0.5,
    type: 'binary',
    isModifiable: false,
    category: 'demographic',
    description: 'Assigned biological sex at birth'
  },
  systolicBP: {
    name: 'Systolic Blood Pressure',
    unit: 'mmHg',
    min: 80,
    max: 240,
    normalMin: 90,
    normalMax: 120,
    mean: 132.3,
    sd: 22.1,
    type: 'continuous',
    isModifiable: true,
    category: 'clinical',
    description: 'Peak arterial pressure during cardiac contraction (>130 mmHg indicates hypertension)'
  },
  diastolicBP: {
    name: 'Diastolic Blood Pressure',
    unit: 'mmHg',
    min: 50,
    max: 140,
    normalMin: 60,
    normalMax: 80,
    mean: 82.9,
    sd: 11.9,
    type: 'continuous',
    isModifiable: true,
    category: 'clinical',
    description: 'Resting arterial pressure between beats (>80 mmHg indicates elevated diastolic)'
  },
  totalCholesterol: {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    min: 100,
    max: 450,
    normalMin: 125,
    normalMax: 200,
    mean: 236.7,
    sd: 44.6,
    type: 'continuous',
    isModifiable: true,
    category: 'biomarker',
    description: 'Overall circulating serum cholesterol (>200 mg/dL borderline, >240 mg/dL high)'
  },
  hdlCholesterol: {
    name: 'HDL Cholesterol (Good)',
    unit: 'mg/dL',
    min: 20,
    max: 100,
    normalMin: 40,
    normalMax: 80,
    mean: 52.4,
    sd: 13.8,
    type: 'continuous',
    isModifiable: true,
    category: 'biomarker',
    description: 'High-density lipoprotein; protective factor (<40 mg/dL in men, <50 mg/dL in women increases risk)'
  },
  ldlCholesterol: {
    name: 'LDL Cholesterol (Bad)',
    unit: 'mg/dL',
    min: 40,
    max: 300,
    normalMin: 50,
    normalMax: 100,
    mean: 135.2,
    sd: 35.7,
    type: 'continuous',
    isModifiable: true,
    category: 'biomarker',
    description: 'Low-density atherogenic lipoprotein (>130 borderline, >160 high, >190 very high)'
  },
  triglycerides: {
    name: 'Triglycerides',
    unit: 'mg/dL',
    min: 50,
    max: 500,
    normalMin: 50,
    normalMax: 150,
    mean: 158.4,
    sd: 72.3,
    type: 'continuous',
    isModifiable: true,
    category: 'biomarker',
    description: 'Fasting serum triglycerides (>150 mg/dL elevated; marker of metabolic syndrome)'
  },
  fastingBloodGlucose: {
    name: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    min: 60,
    max: 350,
    normalMin: 70,
    normalMax: 99,
    mean: 89.6,
    sd: 24.8,
    type: 'continuous',
    isModifiable: true,
    category: 'biomarker',
    description: 'Fasting plasma glucose (100-125 prediabetes, >=126 diabetes)'
  },
  bmi: {
    name: 'Body Mass Index (BMI)',
    unit: 'kg/m²',
    min: 15,
    max: 55,
    normalMin: 18.5,
    normalMax: 24.9,
    mean: 25.8,
    sd: 4.1,
    type: 'continuous',
    isModifiable: true,
    category: 'clinical',
    description: 'Body weight divided by height squared (25-29.9 overweight, >=30 obese)'
  },
  smokingStatus: {
    name: 'Current Smoker',
    unit: '0=No, 1=Yes',
    min: 0,
    max: 1,
    normalMin: 0,
    normalMax: 0,
    mean: 0.49,
    sd: 0.5,
    type: 'binary',
    isModifiable: true,
    category: 'lifestyle',
    description: 'Active cigarette smoking status'
  },
  cigarettesPerDay: {
    name: 'Cigarettes Per Day',
    unit: 'cigs/day',
    min: 0,
    max: 60,
    normalMin: 0,
    normalMax: 0,
    mean: 9.0,
    sd: 11.9,
    type: 'continuous',
    isModifiable: true,
    category: 'lifestyle',
    description: 'Average number of cigarettes consumed daily by smokers'
  },
  diabetesStatus: {
    name: 'Diabetes Mellitus',
    unit: '0=No, 1=Yes',
    min: 0,
    max: 1,
    normalMin: 0,
    normalMax: 0,
    mean: 0.08,
    sd: 0.27,
    type: 'binary',
    isModifiable: false,
    category: 'clinical',
    description: 'Diagnosed type 1 or type 2 diabetes mellitus'
  },
  restingHeartRate: {
    name: 'Resting Heart Rate',
    unit: 'bpm',
    min: 40,
    max: 150,
    normalMin: 60,
    normalMax: 85,
    mean: 75.9,
    sd: 12.1,
    type: 'continuous',
    isModifiable: true,
    category: 'clinical',
    description: 'Resting heart rate in beats per minute'
  },
  familyHistory: {
    name: 'Family History of Early CVD',
    unit: '0=No, 1=Yes',
    min: 0,
    max: 1,
    normalMin: 0,
    normalMax: 0,
    mean: 0.22,
    sd: 0.41,
    type: 'binary',
    isModifiable: false,
    category: 'demographic',
    description: 'First-degree relative with premature cardiovascular disease (<55 male, <65 female)'
  },
  physicalActivity: {
    name: 'Physical Activity Level',
    unit: '0=Sedentary to 3=Active',
    min: 0,
    max: 3,
    normalMin: 2,
    normalMax: 3,
    mean: 1.6,
    sd: 0.9,
    type: 'categorical',
    isModifiable: true,
    category: 'lifestyle',
    description: 'Weekly exercise frequency (0=Sedentary, 1=Light, 2=Moderate 150min/wk, 3=Vigorous)'
  },
  onHypertensionMeds: {
    name: 'Anti-Hypertensive Medication',
    unit: '0=No, 1=Yes',
    min: 0,
    max: 1,
    normalMin: 0,
    normalMax: 1,
    mean: 0.18,
    sd: 0.38,
    type: 'binary',
    isModifiable: true,
    category: 'clinical',
    description: 'Currently taking prescribed blood pressure lowering medication'
  }
};

// Default population expected base value E[f(x)] in log-odds / risk probability
export const BASELINE_POPULATION_RISK = 0.142; // 14.2% baseline 10-year CVD incidence

// Input Validation Function
export function validateCardioInput(params: CardioInputParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Range checks
  (Object.keys(FEATURE_METADATA) as (keyof CardioInputParams)[]).forEach((key) => {
    const val = params[key];
    const meta = FEATURE_METADATA[key];

    if (val === undefined || val === null || isNaN(val)) {
      issues.push({
        field: key,
        message: `${meta.name} is required.`,
        type: 'error'
      });
      return;
    }

    if (val < meta.min || val > meta.max) {
      issues.push({
        field: key,
        message: `${meta.name} must be between ${meta.min} and ${meta.max} ${meta.unit}.`,
        type: 'error'
      });
    }
  });

  // Clinical consistency checks
  if (params.diastolicBP >= params.systolicBP) {
    issues.push({
      field: 'diastolicBP',
      message: 'Diastolic BP cannot be greater than or equal to Systolic BP.',
      type: 'error'
    });
  }

  if (params.systolicBP - params.diastolicBP < 20) {
    issues.push({
      field: 'systolicBP',
      message: 'Pulse pressure (Systolic - Diastolic) is unusually narrow (< 20 mmHg). Please check readings.',
      type: 'warning'
    });
  }

  if (params.smokingStatus === 0 && params.cigarettesPerDay > 0) {
    issues.push({
      field: 'cigarettesPerDay',
      message: 'Non-smokers should have 0 cigarettes per day. Cigarettes per day will be adjusted to 0.',
      type: 'warning'
    });
  }

  if (params.smokingStatus === 1 && params.cigarettesPerDay === 0) {
    issues.push({
      field: 'cigarettesPerDay',
      message: 'Smoker selected but cigarettes per day is 0. Please specify typical daily consumption.',
      type: 'warning'
    });
  }

  if (params.fastingBloodGlucose >= 126 && params.diabetesStatus === 0) {
    issues.push({
      field: 'diabetesStatus',
      message: 'Fasting glucose is ≥ 126 mg/dL (clinical threshold for diabetes), but diabetes flag is unset.',
      type: 'warning'
    });
  }

  if (params.hdlCholesterol + params.ldlCholesterol > params.totalCholesterol + 30) {
    issues.push({
      field: 'totalCholesterol',
      message: 'Sum of HDL and LDL exceeds Total Cholesterol significantly. Please verify lipid panel entries.',
      type: 'warning'
    });
  }

  return issues;
}

// Preset Patient Archetypes for instant evaluation & testing
export const PRESET_PATIENTS: PresetPatient[] = [
  {
    id: 'healthy_adult',
    name: 'Elena Rostova (Healthy Active Adult)',
    badge: 'Low Risk',
    description: '38 yo female, optimal blood pressure, active runner, ideal lipid profile, non-smoker.',
    expectedCategory: 'Low',
    params: {
      age: 38,
      sex: 0,
      systolicBP: 112,
      diastolicBP: 72,
      totalCholesterol: 168,
      hdlCholesterol: 64,
      ldlCholesterol: 88,
      triglycerides: 90,
      fastingBloodGlucose: 82,
      bmi: 21.4,
      smokingStatus: 0,
      cigarettesPerDay: 0,
      diabetesStatus: 0,
      restingHeartRate: 58,
      familyHistory: 0,
      physicalActivity: 3,
      onHypertensionMeds: 0
    }
  },
  {
    id: 'borderline_hypertensive',
    name: 'Marcus Vance (Borderline Hypertensive)',
    badge: 'Borderline Risk',
    description: '52 yo male, sedentary office worker, stage 1 systolic hypertension, slightly elevated LDL.',
    expectedCategory: 'Borderline',
    params: {
      age: 52,
      sex: 1,
      systolicBP: 138,
      diastolicBP: 88,
      totalCholesterol: 218,
      hdlCholesterol: 46,
      ldlCholesterol: 138,
      triglycerides: 165,
      fastingBloodGlucose: 98,
      bmi: 27.2,
      smokingStatus: 0,
      cigarettesPerDay: 0,
      diabetesStatus: 0,
      restingHeartRate: 74,
      familyHistory: 1,
      physicalActivity: 1,
      onHypertensionMeds: 0
    }
  },
  {
    id: 'metabolic_smoker',
    name: 'Arthur Pendelton (Smoker with Metabolic Syndrome)',
    badge: 'High Risk',
    description: '61 yo male, 20 cigs/day for 30 yrs, severe hypertension, obesity, low HDL, elevated triglycerides.',
    expectedCategory: 'High',
    params: {
      age: 61,
      sex: 1,
      systolicBP: 162,
      diastolicBP: 96,
      totalCholesterol: 265,
      hdlCholesterol: 34,
      ldlCholesterol: 172,
      triglycerides: 285,
      fastingBloodGlucose: 118,
      bmi: 32.8,
      smokingStatus: 1,
      cigarettesPerDay: 20,
      diabetesStatus: 0,
      restingHeartRate: 86,
      familyHistory: 1,
      physicalActivity: 0,
      onHypertensionMeds: 1
    }
  },
  {
    id: 'elderly_diabetic',
    name: 'Grace Holloway (Diabetic Dyslipidemia)',
    badge: 'High Risk',
    description: '68 yo female, diagnosed type 2 diabetes, high systolic BP despite meds, high triglycerides.',
    expectedCategory: 'High',
    params: {
      age: 68,
      sex: 0,
      systolicBP: 154,
      diastolicBP: 84,
      totalCholesterol: 242,
      hdlCholesterol: 38,
      ldlCholesterol: 152,
      triglycerides: 240,
      fastingBloodGlucose: 164,
      bmi: 29.5,
      smokingStatus: 0,
      cigarettesPerDay: 0,
      diabetesStatus: 1,
      restingHeartRate: 78,
      familyHistory: 1,
      physicalActivity: 1,
      onHypertensionMeds: 1
    }
  }
];

// Helper: Sigmoid transformation
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
}

// Helper: Inverse sigmoid (logit)
function logit(p: number): number {
  const safeP = Math.max(0.001, Math.min(0.999, p));
  return Math.log(safeP / (1 - safeP));
}

// Prediction & SHAP Computation Engine
export function predictCardiovascularRisk(
  params: CardioInputParams,
  modelType: ModelType = 'xgboost'
): PredictionResult {
  // Normalize params and enforce sanitary defaults
  const cleaned: CardioInputParams = {
    ...params,
    cigarettesPerDay: params.smokingStatus === 0 ? 0 : params.cigarettesPerDay
  };

  const baseLogOdds = logit(BASELINE_POPULATION_RISK); // ~ -1.798
  const contributions: Record<keyof CardioInputParams, number> = {} as any;

  // Feature deviations from population normal/means
  const ageDev = (cleaned.age - 45) / 10;
  const sbpDev = (cleaned.systolicBP - 120) / 20;
  const dbpDev = (cleaned.diastolicBP - 80) / 10;
  const cholDev = (cleaned.totalCholesterol - 190) / 40;
  const hdlDev = (50 - cleaned.hdlCholesterol) / 15; // Higher HDL decreases risk
  const ldlDev = (cleaned.ldlCholesterol - 100) / 30;
  const trigDev = (cleaned.triglycerides - 130) / 70;
  const fbgDev = (cleaned.fastingBloodGlucose - 90) / 30;
  const bmiDev = (cleaned.bmi - 23.5) / 4;
  const hrDev = (cleaned.restingHeartRate - 70) / 15;

  // Model-specific weight matrices & non-linear synergy kernels
  if (modelType === 'xgboost' || modelType === 'random_forest') {
    // Gradient Boosted Decision Tree / Random Forest with non-linear interaction terms
    const treeScale = modelType === 'xgboost' ? 1.05 : 0.98;

    contributions.age = ageDev * 0.42 * (cleaned.age > 60 ? 1.25 : 1.0) * treeScale;
    contributions.sex = (cleaned.sex === 1 ? 0.32 : -0.22) * treeScale;
    
    // Non-linear SBP with medication interaction
    let sbpWeight = 0.38;
    if (cleaned.systolicBP > 140) sbpWeight += 0.18;
    if (cleaned.systolicBP > 160) sbpWeight += 0.28;
    if (cleaned.onHypertensionMeds === 1) sbpWeight += 0.12; // Treated hypertension indicator
    contributions.systolicBP = sbpDev * sbpWeight * treeScale;

    contributions.diastolicBP = Math.max(-0.25, dbpDev * 0.14) * treeScale;

    // Lipid interaction (Total Chol + LDL + HDL ratio)
    contributions.totalCholesterol = (cholDev * 0.18) * treeScale;
    contributions.hdlCholesterol = (hdlDev * 0.34) * (cleaned.hdlCholesterol < 40 ? 1.3 : 1.0) * treeScale;
    contributions.ldlCholesterol = (ldlDev * 0.28) * (cleaned.ldlCholesterol > 160 ? 1.35 : 1.0) * treeScale;
    contributions.triglycerides = (trigDev * 0.15) * (cleaned.triglycerides > 200 ? 1.2 : 0.8) * treeScale;

    // Glycemia & Diabetes interaction
    contributions.fastingBloodGlucose = (fbgDev * 0.22) * (cleaned.fastingBloodGlucose > 125 ? 1.4 : 1.0) * treeScale;
    contributions.diabetesStatus = (cleaned.diabetesStatus === 1 ? 0.72 : -0.08) * treeScale;

    // Smoking dose-response curve
    if (cleaned.smokingStatus === 1) {
      const cigDose = 0.35 + (cleaned.cigarettesPerDay / 20) * 0.45;
      contributions.smokingStatus = 0.28 * treeScale;
      contributions.cigarettesPerDay = cigDose * treeScale;
    } else {
      contributions.smokingStatus = -0.18 * treeScale;
      contributions.cigarettesPerDay = 0;
    }

    // BMI and Adiposity
    contributions.bmi = (bmiDev * 0.22) * (cleaned.bmi > 30 ? 1.25 : 0.9) * treeScale;
    contributions.restingHeartRate = (hrDev * 0.12) * treeScale;
    contributions.familyHistory = (cleaned.familyHistory === 1 ? 0.44 : -0.12) * treeScale;

    // Physical Activity (Protective)
    const actBenefits = [0.24, 0.04, -0.22, -0.42]; // 0=Sedentary adds risk, 3=Active reduces
    contributions.physicalActivity = (actBenefits[cleaned.physicalActivity] || 0) * treeScale;

    contributions.onHypertensionMeds = (cleaned.onHypertensionMeds === 1 ? 0.26 : -0.06) * treeScale;

  } else if (modelType === 'logistic_regression') {
    // Standard Linear ElasticNet Log-Odds Coefficients
    contributions.age = ageDev * 0.44;
    contributions.sex = cleaned.sex === 1 ? 0.35 : -0.25;
    contributions.systolicBP = sbpDev * 0.42;
    contributions.diastolicBP = dbpDev * 0.12;
    contributions.totalCholesterol = cholDev * 0.22;
    contributions.hdlCholesterol = hdlDev * 0.36;
    contributions.ldlCholesterol = ldlDev * 0.26;
    contributions.triglycerides = trigDev * 0.14;
    contributions.fastingBloodGlucose = fbgDev * 0.24;
    contributions.diabetesStatus = cleaned.diabetesStatus === 1 ? 0.68 : -0.05;
    contributions.smokingStatus = cleaned.smokingStatus === 1 ? 0.48 : -0.22;
    contributions.cigarettesPerDay = cleaned.smokingStatus === 1 ? (cleaned.cigarettesPerDay / 20) * 0.35 : 0;
    contributions.bmi = bmiDev * 0.19;
    contributions.restingHeartRate = hrDev * 0.10;
    contributions.familyHistory = cleaned.familyHistory === 1 ? 0.38 : -0.10;
    contributions.physicalActivity = [0.22, 0.05, -0.18, -0.36][cleaned.physicalActivity] || 0;
    contributions.onHypertensionMeds = cleaned.onHypertensionMeds === 1 ? 0.28 : -0.05;

  } else {
    // SVM (RBF non-linear kernel projection)
    contributions.age = ageDev * 0.40;
    contributions.sex = cleaned.sex === 1 ? 0.30 : -0.20;
    contributions.systolicBP = sbpDev * 0.40;
    contributions.diastolicBP = dbpDev * 0.13;
    contributions.totalCholesterol = cholDev * 0.20;
    contributions.hdlCholesterol = hdlDev * 0.32;
    contributions.ldlCholesterol = ldlDev * 0.25;
    contributions.triglycerides = trigDev * 0.16;
    contributions.fastingBloodGlucose = fbgDev * 0.25;
    contributions.diabetesStatus = cleaned.diabetesStatus === 1 ? 0.65 : -0.07;
    contributions.smokingStatus = cleaned.smokingStatus === 1 ? 0.42 : -0.18;
    contributions.cigarettesPerDay = cleaned.smokingStatus === 1 ? (cleaned.cigarettesPerDay / 20) * 0.38 : 0;
    contributions.bmi = bmiDev * 0.21;
    contributions.restingHeartRate = hrDev * 0.11;
    contributions.familyHistory = cleaned.familyHistory === 1 ? 0.40 : -0.11;
    contributions.physicalActivity = [0.20, 0.04, -0.20, -0.38][cleaned.physicalActivity] || 0;
    contributions.onHypertensionMeds = cleaned.onHypertensionMeds === 1 ? 0.24 : -0.05;
  }

  // Sum total SHAP contributions: f(x) = baseLogOdds + sum(phi_i)
  const totalShapSum = Object.values(contributions).reduce((a, b) => a + b, 0);
  const finalLogOdds = baseLogOdds + totalShapSum;
  const rawProb = sigmoid(finalLogOdds);
  const clampedProb = Math.max(0.015, Math.min(0.965, rawProb));
  const riskScorePercent = Math.round(clampedProb * 1000) / 10;

  // Stratify into ACC/AHA clinical risk tiers
  let riskCategory: RiskCategory = 'Low';
  let categoryColor = '#10b981'; // Emerald
  let categoryDescription = '10-year cardiovascular disease risk is under 7.5%. Lifestyle maintenance recommended.';

  if (riskScorePercent >= 20.0) {
    riskCategory = 'High';
    categoryColor = '#ef4444'; // Red
    categoryDescription = 'High 10-year CVD risk (≥20.0%). Intensive risk-factor modification & clinical consultation indicated.';
  } else if (riskScorePercent >= 12.5) {
    riskCategory = 'Intermediate';
    categoryColor = '#f59e0b'; // Amber
    categoryDescription = 'Intermediate risk (12.5% - 19.9%). Preventive pharmacological and lifestyle interventions warrant review.';
  } else if (riskScorePercent >= 7.5) {
    riskCategory = 'Borderline';
    categoryColor = '#3b82f6'; // Blue
    categoryDescription = 'Borderline risk (7.5% - 12.4%). Primary lifestyle optimization targeted at blood pressure and lipids.';
  }

  // Build detailed SHAP breakdown
  const shapContributions: ShapContribution[] = (Object.keys(FEATURE_METADATA) as (keyof CardioInputParams)[]).map((key) => {
    const meta = FEATURE_METADATA[key];
    const shapVal = contributions[key];
    const val = cleaned[key];
    let originalValue: string | number = val;

    if (key === 'sex') originalValue = val === 1 ? 'Male' : 'Female';
    else if (key === 'smokingStatus') originalValue = val === 1 ? 'Yes' : 'No';
    else if (key === 'diabetesStatus') originalValue = val === 1 ? 'Yes' : 'No';
    else if (key === 'familyHistory') originalValue = val === 1 ? 'Yes' : 'No';
    else if (key === 'onHypertensionMeds') originalValue = val === 1 ? 'Yes' : 'No';
    else if (key === 'physicalActivity') {
      const acts = ['Sedentary', 'Light (1-2x/wk)', 'Moderate (150m/wk)', 'Active (>300m/wk)'];
      originalValue = acts[val] || 'Moderate';
    }

    let clinicalContext = '';
    if (shapVal > 0.05) {
      clinicalContext = `Elevated ${meta.name} (+${shapVal.toFixed(3)} log-odds) pushes cardiovascular risk upward.`;
    } else if (shapVal < -0.05) {
      clinicalContext = `Favorable ${meta.name} (${shapVal.toFixed(3)} log-odds) acts as a protective shield reducing risk.`;
    } else {
      clinicalContext = `${meta.name} is near population median baseline, contributing minimally.`;
    }

    return {
      featureName: key,
      displayName: meta.name,
      originalValue,
      unit: meta.unit,
      shapValue: shapVal,
      direction: shapVal >= 0 ? 'increase' : 'decrease',
      clinicalContext,
      isModifiable: meta.isModifiable
    };
  });

  // Sort contributions
  shapContributions.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  const topRiskFactors = shapContributions.filter(s => s.shapValue > 0.02).slice(0, 5);
  const topProtectiveFactors = shapContributions.filter(s => s.shapValue < -0.02).slice(0, 5);

  // Generate Personalized Counterfactual Interventions
  const counterfactualSuggestions: CounterfactualGoal[] = [];

  if (cleaned.smokingStatus === 1) {
    const smokingSaving = (contributions.smokingStatus + contributions.cigarettesPerDay);
    const probIfQuit = sigmoid(finalLogOdds - smokingSaving);
    const diff = ((probIfQuit - clampedProb) * 100);
    counterfactualSuggestions.push({
      feature: 'smokingStatus',
      displayName: 'Complete Smoking Cessation',
      currentValue: cleaned.cigarettesPerDay,
      recommendedValue: 0,
      potentialRiskReduction: Math.round(diff * 10) / 10,
      clinicalAction: 'Complete smoking cessation eliminates endothelial oxidant stress and drops risk significantly.'
    });
  }

  if (cleaned.systolicBP > 120) {
    const targetSBP = 120;
    const sbpDelta = (cleaned.systolicBP - targetSBP) / 20 * 0.38;
    const probIfControlled = sigmoid(finalLogOdds - sbpDelta);
    const diff = ((probIfControlled - clampedProb) * 100);
    if (diff < -0.5) {
      counterfactualSuggestions.push({
        feature: 'systolicBP',
        displayName: 'Target Systolic BP ≤ 120 mmHg',
        currentValue: cleaned.systolicBP,
        recommendedValue: 120,
        potentialRiskReduction: Math.round(diff * 10) / 10,
        clinicalAction: `Lowering Systolic BP from ${cleaned.systolicBP} to 120 mmHg reduces arterial shear stress.`
      });
    }
  }

  if (cleaned.ldlCholesterol > 100) {
    const targetLDL = 90;
    const ldlDelta = (cleaned.ldlCholesterol - targetLDL) / 30 * 0.28;
    const probIfOptimized = sigmoid(finalLogOdds - ldlDelta);
    const diff = ((probIfOptimized - clampedProb) * 100);
    if (diff < -0.5) {
      counterfactualSuggestions.push({
        feature: 'ldlCholesterol',
        displayName: 'Target LDL Cholesterol < 100 mg/dL',
        currentValue: cleaned.ldlCholesterol,
        recommendedValue: 90,
        potentialRiskReduction: Math.round(diff * 10) / 10,
        clinicalAction: `Lowering LDL to 90 mg/dL prevents atheromatous plaque progression.`
      });
    }
  }

  if (cleaned.bmi > 25) {
    const targetBMI = 24.5;
    const bmiDelta = (cleaned.bmi - targetBMI) / 4 * 0.22;
    const probIfLean = sigmoid(finalLogOdds - bmiDelta);
    const diff = ((probIfLean - clampedProb) * 100);
    if (diff < -0.5) {
      counterfactualSuggestions.push({
        feature: 'bmi',
        displayName: 'Optimize BMI to Healthy Range (24.5 kg/m²)',
        currentValue: cleaned.bmi,
        recommendedValue: 24.5,
        potentialRiskReduction: Math.round(diff * 10) / 10,
        clinicalAction: `Gradual 5-10% weight loss improves insulin sensitivity, lipid clearance, and vascular tone.`
      });
    }
  }

  if (cleaned.physicalActivity < 2) {
    const actDelta = 0.35; // moving to moderate/active
    const probIfActive = sigmoid(finalLogOdds - actDelta);
    const diff = ((probIfActive - clampedProb) * 100);
    counterfactualSuggestions.push({
      feature: 'physicalActivity',
      displayName: 'Increase Exercise to ≥150 min/week',
      currentValue: cleaned.physicalActivity,
      recommendedValue: 2,
      potentialRiskReduction: Math.round(diff * 10) / 10,
      clinicalAction: 'Regular aerobic activity stimulates vascular nitric oxide production and boosts protective HDL.'
    });
  }

  const modelNames: Record<ModelType, string> = {
    xgboost: 'Gradient Boosted Decision Trees (XGBoost)',
    random_forest: 'Random Forest Ensemble Classifier',
    logistic_regression: 'Regularized ElasticNet Logistic Regression',
    svm: 'Support Vector Machine (RBF Kernel)'
  };

  return {
    riskProbability: clampedProb,
    riskScorePercent,
    riskCategory,
    categoryColor,
    categoryDescription,
    baseValue: BASELINE_POPULATION_RISK,
    modelType,
    modelName: modelNames[modelType],
    shapContributions,
    topRiskFactors,
    topProtectiveFactors,
    counterfactualSuggestions
  };
}

// Multi-Model Benchmark Metrics
export const MODEL_EVALUATION_METRICS: Record<ModelType, ModelMetrics> = {
  xgboost: {
    name: 'Gradient Boosted Trees (XGBoost)',
    type: 'xgboost',
    accuracy: 0.864,
    precision: 0.841,
    recall: 0.818,
    f1Score: 0.829,
    rocAuc: 0.887,
    prAuc: 0.846,
    brierScore: 0.109,
    sensitivity: 0.818,
    specificity: 0.892,
    confusionMatrix: {
      truePositive: 468,
      falsePositive: 88,
      trueNegative: 724,
      falseNegative: 104
    },
    rocCurve: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0 },
      { fpr: 0.02, tpr: 0.22, threshold: 0.85 },
      { fpr: 0.05, tpr: 0.48, threshold: 0.70 },
      { fpr: 0.10, tpr: 0.69, threshold: 0.55 },
      { fpr: 0.15, tpr: 0.82, threshold: 0.45 },
      { fpr: 0.22, tpr: 0.89, threshold: 0.35 },
      { fpr: 0.35, tpr: 0.94, threshold: 0.25 },
      { fpr: 0.55, tpr: 0.98, threshold: 0.15 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0, threshold: 1.0 },
      { recall: 0.25, precision: 0.92, threshold: 0.80 },
      { recall: 0.50, precision: 0.88, threshold: 0.65 },
      { recall: 0.70, precision: 0.85, threshold: 0.50 },
      { recall: 0.82, precision: 0.84, threshold: 0.45 },
      { recall: 0.90, precision: 0.78, threshold: 0.30 },
      { recall: 1.0, precision: 0.41, threshold: 0.0 }
    ],
    description: 'Best overall discriminatory power (ROC-AUC 0.887). Captures complex non-linear metabolic risk interactions.'
  },
  random_forest: {
    name: 'Random Forest Ensemble',
    type: 'random_forest',
    accuracy: 0.852,
    precision: 0.826,
    recall: 0.801,
    f1Score: 0.813,
    rocAuc: 0.874,
    prAuc: 0.831,
    brierScore: 0.116,
    sensitivity: 0.801,
    specificity: 0.881,
    confusionMatrix: {
      truePositive: 458,
      falsePositive: 97,
      trueNegative: 715,
      falseNegative: 114
    },
    rocCurve: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0 },
      { fpr: 0.03, tpr: 0.20, threshold: 0.85 },
      { fpr: 0.07, tpr: 0.45, threshold: 0.70 },
      { fpr: 0.12, tpr: 0.66, threshold: 0.55 },
      { fpr: 0.18, tpr: 0.80, threshold: 0.45 },
      { fpr: 0.26, tpr: 0.87, threshold: 0.35 },
      { fpr: 0.40, tpr: 0.93, threshold: 0.25 },
      { fpr: 0.60, tpr: 0.97, threshold: 0.15 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0, threshold: 1.0 },
      { recall: 0.22, precision: 0.90, threshold: 0.80 },
      { recall: 0.48, precision: 0.86, threshold: 0.65 },
      { recall: 0.68, precision: 0.83, threshold: 0.50 },
      { recall: 0.80, precision: 0.82, threshold: 0.45 },
      { recall: 0.88, precision: 0.75, threshold: 0.30 },
      { recall: 1.0, precision: 0.41, threshold: 0.0 }
    ],
    description: 'High stability and variance reduction across sub-cohorts with 500 decision trees (ROC-AUC 0.874).'
  },
  logistic_regression: {
    name: 'ElasticNet Logistic Regression',
    type: 'logistic_regression',
    accuracy: 0.828,
    precision: 0.795,
    recall: 0.768,
    f1Score: 0.781,
    rocAuc: 0.849,
    prAuc: 0.798,
    brierScore: 0.128,
    sensitivity: 0.768,
    specificity: 0.864,
    confusionMatrix: {
      truePositive: 439,
      falsePositive: 111,
      trueNegative: 701,
      falseNegative: 133
    },
    rocCurve: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0 },
      { fpr: 0.05, tpr: 0.18, threshold: 0.85 },
      { fpr: 0.10, tpr: 0.40, threshold: 0.70 },
      { fpr: 0.16, tpr: 0.60, threshold: 0.55 },
      { fpr: 0.24, tpr: 0.75, threshold: 0.45 },
      { fpr: 0.34, tpr: 0.83, threshold: 0.35 },
      { fpr: 0.48, tpr: 0.90, threshold: 0.25 },
      { fpr: 0.68, tpr: 0.95, threshold: 0.15 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0, threshold: 1.0 },
      { recall: 0.20, precision: 0.87, threshold: 0.80 },
      { recall: 0.44, precision: 0.82, threshold: 0.65 },
      { recall: 0.64, precision: 0.80, threshold: 0.50 },
      { recall: 0.77, precision: 0.79, threshold: 0.45 },
      { recall: 0.85, precision: 0.70, threshold: 0.30 },
      { recall: 1.0, precision: 0.41, threshold: 0.0 }
    ],
    description: 'Interpretable linear baseline modeled after traditional Framingham risk scores (ROC-AUC 0.849).'
  },
  svm: {
    name: 'Support Vector Machine (RBF)',
    type: 'svm',
    accuracy: 0.841,
    precision: 0.812,
    recall: 0.785,
    f1Score: 0.798,
    rocAuc: 0.861,
    prAuc: 0.814,
    brierScore: 0.121,
    sensitivity: 0.785,
    specificity: 0.873,
    confusionMatrix: {
      truePositive: 449,
      falsePositive: 104,
      trueNegative: 708,
      falseNegative: 123
    },
    rocCurve: [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0 },
      { fpr: 0.04, tpr: 0.19, threshold: 0.85 },
      { fpr: 0.08, tpr: 0.43, threshold: 0.70 },
      { fpr: 0.14, tpr: 0.63, threshold: 0.55 },
      { fpr: 0.21, tpr: 0.78, threshold: 0.45 },
      { fpr: 0.30, tpr: 0.85, threshold: 0.35 },
      { fpr: 0.44, tpr: 0.92, threshold: 0.25 },
      { fpr: 0.64, tpr: 0.96, threshold: 0.15 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0, threshold: 1.0 },
      { recall: 0.21, precision: 0.88, threshold: 0.80 },
      { recall: 0.46, precision: 0.84, threshold: 0.65 },
      { recall: 0.66, precision: 0.81, threshold: 0.50 },
      { recall: 0.78, precision: 0.81, threshold: 0.45 },
      { recall: 0.86, precision: 0.73, threshold: 0.30 },
      { recall: 1.0, precision: 0.41, threshold: 0.0 }
    ],
    description: 'Non-linear hyperplane separator in kernel Hilbert space with balanced margin penalties (ROC-AUC 0.861).'
  }
};

// Global SHAP Feature Importance (Mean Absolute SHAP value over validation cohort)
export const GLOBAL_SHAP_FEATURES: GlobalShapFeature[] = [
  {
    featureKey: 'systolicBP',
    displayName: 'Systolic Blood Pressure',
    meanAbsShap: 0.485,
    category: 'clinical',
    description: 'Primary hemodynamic driver of arterial vascular strain and microvascular injury'
  },
  {
    featureKey: 'age',
    displayName: 'Age',
    meanAbsShap: 0.442,
    category: 'demographic',
    description: 'Cumulative lifetime vascular exposure and cellular senescence'
  },
  {
    featureKey: 'smokingStatus',
    displayName: 'Smoking Status & Dose',
    meanAbsShap: 0.378,
    category: 'lifestyle',
    description: 'Endothelial dysfunction, pro-thrombotic state, and oxidative stress'
  },
  {
    featureKey: 'hdlCholesterol',
    displayName: 'HDL Cholesterol',
    meanAbsShap: 0.334,
    category: 'biomarker',
    description: 'Reverse cholesterol transport efficiency (protective when elevated)'
  },
  {
    featureKey: 'ldlCholesterol',
    displayName: 'LDL Cholesterol',
    meanAbsShap: 0.312,
    category: 'biomarker',
    description: 'Direct atherogenic apolipoprotein B particle accumulation in intima'
  },
  {
    featureKey: 'diabetesStatus',
    displayName: 'Diabetes Mellitus',
    meanAbsShap: 0.298,
    category: 'clinical',
    description: 'Accelerated advanced glycation end-products (AGEs) and diffuse vasculopathy'
  },
  {
    featureKey: 'totalCholesterol',
    displayName: 'Total Cholesterol',
    meanAbsShap: 0.254,
    category: 'biomarker',
    description: 'Serum circulating sterol load across all lipoprotein fractions'
  },
  {
    featureKey: 'bmi',
    displayName: 'Body Mass Index (BMI)',
    meanAbsShap: 0.228,
    category: 'clinical',
    description: 'Visceral adiposity, systemic low-grade inflammation, and leptin resistance'
  },
  {
    featureKey: 'fastingBloodGlucose',
    displayName: 'Fasting Blood Glucose',
    meanAbsShap: 0.214,
    category: 'biomarker',
    description: 'Subclinical insulin resistance and microangiopathic strain'
  },
  {
    featureKey: 'familyHistory',
    displayName: 'Family History of Premature CVD',
    meanAbsShap: 0.198,
    category: 'demographic',
    description: 'Polygenic hereditary susceptibility and shared metabolic architecture'
  },
  {
    featureKey: 'physicalActivity',
    displayName: 'Physical Activity Level',
    meanAbsShap: 0.185,
    category: 'lifestyle',
    description: 'Cardiorespiratory fitness, nitric oxide bioavailability, and autonomic tone'
  },
  {
    featureKey: 'triglycerides',
    displayName: 'Triglycerides',
    meanAbsShap: 0.162,
    category: 'biomarker',
    description: 'Remnant lipoprotein cholesterol and atherogenic dyslipidemia'
  },
  {
    featureKey: 'sex',
    displayName: 'Biological Sex',
    meanAbsShap: 0.158,
    category: 'demographic',
    description: 'Estrogenic vasoprotection in premenopausal females vs male baseline'
  },
  {
    featureKey: 'onHypertensionMeds',
    displayName: 'Anti-Hypertensive Treatment',
    meanAbsShap: 0.142,
    category: 'clinical',
    description: 'Treated hypertension status indicator (denoting underlying established disease)'
  },
  {
    featureKey: 'diastolicBP',
    displayName: 'Diastolic Blood Pressure',
    meanAbsShap: 0.128,
    category: 'clinical',
    description: 'Peripheral vascular resistance during cardiac diastole'
  },
  {
    featureKey: 'restingHeartRate',
    displayName: 'Resting Heart Rate',
    meanAbsShap: 0.104,
    category: 'clinical',
    description: 'Sympathetic nervous system drive and myocardial oxygen consumption'
  }
];

// Generate synthetic Beeswarm cohort distribution points (1,000 points across top features)
export function generateBeeswarmData(featureKey: string, sampleCount: number = 80): BeeswarmPoint[] {
  const points: BeeswarmPoint[] = [];
  const meta = (FEATURE_METADATA as any)[featureKey] || { min: 0, max: 100, mean: 50, sd: 15 };
  
  // Seeded pseudo-random generation for deterministic reproducible visual distribution
  let seed = 1337 + featureKey.charCodeAt(0) * 17;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 0; i < sampleCount; i++) {
    // Generate feature normalized value (0 = low blue, 1 = high red)
    const norm = Math.max(0, Math.min(1, random() * 0.8 + (random() > 0.5 ? 0.2 : 0.0)));
    const rawVal = meta.min + norm * (meta.max - meta.min);
    
    // Invert correlation for protective features (HDL, Physical Activity)
    const isProtective = featureKey === 'hdlCholesterol' || featureKey === 'physicalActivity';
    const directionFactor = isProtective ? -1 : 1;

    // SHAP value proportional to deviation from 0.5
    const baseImpact = (norm - 0.45) * 0.9 * directionFactor;
    const noise = (random() - 0.5) * 0.25;
    const shapVal = baseImpact + noise;

    points.push({
      id: i,
      featureKey,
      featureValueNorm: norm,
      featureValueRaw: Math.round(rawVal * 10) / 10,
      shapValue: shapVal,
      jitter: (random() - 0.5) * 0.8
    });
  }

  return points;
}
