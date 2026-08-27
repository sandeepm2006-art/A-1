/**
 * Sample synthetic cardiovascular dataset CSV generator and raw data
 * Conforming strictly to FEATURE_ORDER and target column 'cvd_risk_10yr'
 */

export const SAMPLE_CSV_HEADER = "age,sex,systolic_bp,diastolic_bp,total_cholesterol,hdl_cholesterol,ldl_cholesterol,triglycerides,fasting_blood_glucose,bmi,smoking_status,cigarettes_per_day,diabetes_status,resting_heart_rate,family_history,physical_activity,on_hypertension_meds,cvd_risk_10yr";

export function generateSyntheticCsv(rowCount: number = 100): string {
  const rows: string[] = [SAMPLE_CSV_HEADER];
  
  // Deterministic seed pseudo-random
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < rowCount; i++) {
    const age = Math.floor(30 + rand() * 48); // 30-78
    const sex = rand() > 0.48 ? 1 : 0;
    const smoking = rand() > 0.65 ? 1 : 0;
    const cigs = smoking ? Math.floor(5 + rand() * 25) : 0;
    const sbp = Math.floor(100 + rand() * 70); // 100-170
    const dbp = Math.floor(65 + rand() * 35); // 65-100
    const totChol = Math.floor(140 + rand() * 140); // 140-280
    const hdl = Math.floor(30 + rand() * 45); // 30-75
    const ldl = Math.max(50, totChol - hdl - Math.floor(rand() * 40));
    const trig = Math.floor(80 + rand() * 220); // 80-300
    const fbg = Math.floor(75 + rand() * 85); // 75-160
    const bmi = +(20 + rand() * 16).toFixed(1); // 20.0-36.0
    const diabetes = (fbg > 126 || rand() > 0.88) ? 1 : 0;
    const hr = Math.floor(55 + rand() * 40); // 55-95
    const famHist = rand() > 0.70 ? 1 : 0;
    const act = Math.floor(rand() * 4); // 0, 1, 2, 3
    const htnMeds = sbp > 140 && rand() > 0.5 ? 1 : 0;

    // Calculate approximate probability for CVD
    let score = -4.2;
    score += (age - 50) * 0.05;
    score += sex * 0.4;
    score += (sbp - 120) * 0.025;
    score += smoking * 0.75 + (cigs / 20) * 0.3;
    score += (totChol - 190) * 0.01;
    score -= (hdl - 50) * 0.025;
    score += (ldl - 110) * 0.015;
    score += diabetes * 0.9;
    score += famHist * 0.5;
    score -= act * 0.25;
    score += (bmi - 25) * 0.04;
    
    const prob = 1 / (1 + Math.exp(-score));
    const target = prob > 0.35 || (prob > rand()) ? 1 : 0;

    rows.push(`${age},${sex},${sbp},${dbp},${totChol},${hdl},${ldl},${trig},${fbg},${bmi},${smoking},${cigs},${diabetes},${hr},${famHist},${act},${htnMeds},${target}`);
  }

  return rows.join('\n');
}

export const PRESET_SAMPLE_DATASET_CSV = generateSyntheticCsv(150);
