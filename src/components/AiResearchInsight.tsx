import React from 'react';
import { PredictionResult } from '../types/cardio';
import { Brain, CheckCircle2 } from 'lucide-react';

interface AiResearchInsightProps {
  prediction: PredictionResult;
}

export const AiResearchInsight: React.FC<AiResearchInsightProps> = ({ prediction }) => {
  const {
    riskScorePercent,
    riskCategory,
    topRiskFactors,
    topProtectiveFactors,
    shapContributions
  } = prediction;

  // Generate deterministic clinical insights based on top SHAP drivers
  const recommendations: string[] = [];

  const hasHighBP = shapContributions.some(c => c.featureName === 'systolicBP' && c.shapValue > 0.15);
  const isSmoker = shapContributions.some(c => c.featureName === 'smokingStatus' && c.shapValue > 0.1);
  const hasHighLDL = shapContributions.some(c => c.featureName === 'ldlCholesterol' && c.shapValue > 0.1);
  const isLowHDL = shapContributions.some(c => c.featureName === 'hdlCholesterol' && c.shapValue > 0.05);
  const isSedentary = shapContributions.some(c => c.featureName === 'physicalActivity' && c.shapValue > 0.05);

  if (hasHighBP) {
    recommendations.push("Blood Pressure Optimization: SBP is a leading SHAP driver (+Δ risk). Targeted lifestyle and medication titration toward <120/80 mmHg yields the highest predicted log-odds reduction.");
  }
  if (isSmoker) {
    recommendations.push("Smoking Cessation Priority: Active cigarette consumption introduces immediate pro-thrombotic and oxidative vascular strain. Complete cessation eliminates this heavy SHAP penalty.");
  }
  if (hasHighLDL) {
    recommendations.push("Atherogenic Lipid Management: Elevated LDL-C promotes coronary plaque progression. Consider dietary saturated fat reduction and guideline-directed statin evaluation.");
  }
  if (isLowHDL || isSedentary) {
    recommendations.push("Aerobic Conditioning & HDL Elevation: Increasing moderate-to-vigorous physical activity to ≥150 min/week improves reverse cholesterol transport and reduces vascular stiffness.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Maintain Health Assets: Continue regular physical exercise, balanced Mediterranean dietary patterns, and routine annual metabolic screening to preserve low CVD risk trajectory.");
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-sky-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Explainable AI Clinical Research Synthesis
            </h3>
            <span className="text-[11px] text-slate-500">
              Translation of SHAP attribution vectors into actionable clinical targets
            </span>
          </div>
        </div>

        <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
          ACC/AHA Class IIa
        </span>
      </div>

      {/* Summary Narrative */}
      <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
        <p>
          The <strong className="text-slate-900 font-bold">{prediction.modelName}</strong> model predicts a <strong className="text-slate-900 font-bold">{riskScorePercent}%</strong> 10-year risk of cardiovascular disease (classified as <span className="font-bold text-slate-800">{riskCategory} Risk</span>).
        </p>
        <p>
          SHAP attribution decomposition demonstrates that the risk is predominantly driven by {topRiskFactors.map(f => f.displayName).join(', ')}, while being mitigated by {topProtectiveFactors.length > 0 ? topProtectiveFactors.map(f => f.displayName).join(', ') : 'baseline characteristics'}.
        </p>
      </div>

      {/* Recommendations Checklist */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Evidence-Grounded Risk Mitigation Targets:
        </div>
        <div className="space-y-1.5">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-relaxed font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
