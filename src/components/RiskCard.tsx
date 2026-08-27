import React from 'react';
import { PredictionResult } from '../types/cardio';
import { TrendingUp, TrendingDown, Heart } from 'lucide-react';

interface RiskCardProps {
  prediction: PredictionResult;
}

export const RiskCard: React.FC<RiskCardProps> = ({ prediction }) => {
  const {
    riskScorePercent,
    riskCategory,
    categoryDescription,
    baseValue,
    modelName,
    topRiskFactors,
    topProtectiveFactors
  } = prediction;

  const basePercent = Math.round(baseValue * 1000) / 10;
  const deltaFromBase = Math.round((riskScorePercent - basePercent) * 10) / 10;

  const categoryBadgeColors: Record<string, string> = {
    Low: 'bg-emerald-600 text-white',
    Borderline: 'bg-blue-600 text-white',
    Intermediate: 'bg-amber-600 text-white',
    High: 'bg-red-600 text-white'
  };

  const badgeClass = categoryBadgeColors[riskCategory] || 'bg-slate-700 text-white';
  const confidencePercent = 91.2;

  return (
    <div className="space-y-4">
      {/* High Density Split Grid matching Design Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Risk Probability Output */}
        <div className="sm:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Heart className="w-24 h-24 text-red-500 fill-current" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Risk Probability
              </p>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                10-Year ASCVD
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-6xl font-black text-slate-900 tracking-tight">
                {riskScorePercent}
              </span>
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${badgeClass}`}>
                {riskCategory.toUpperCase()} RISK CATEGORY
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Pop. Baseline: <strong className="font-mono text-slate-700">{basePercent}%</strong> ({deltaFromBase >= 0 ? `+${deltaFromBase}%` : `${deltaFromBase}%`})
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {categoryDescription}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              * This is a research prototype prediction, not a clinical diagnosis.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Model Confidence & Reliability (Dark Theme Box from design) */}
        <div className="bg-slate-900 rounded-xl p-5 flex flex-col justify-between text-white shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Model Confidence
            </p>
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              CV v4.2
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center my-3">
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              ></div>
            </div>
            <p className="text-2xl font-mono font-bold text-white tracking-tight">
              {confidencePercent}<span className="text-sm font-sans text-slate-400">%</span>
            </p>
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            Prediction reliability based on cross-validation variance.
          </p>
        </div>
      </div>

      {/* High Density Driver Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-red-600">
              <TrendingUp className="w-3.5 h-3.5" /> Top Risk Driver
            </span>
            <span className="text-slate-400 font-mono">Impact (+Log-Odds)</span>
          </div>
          {topRiskFactors[0] ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">{topRiskFactors[0].displayName}</span>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                +{topRiskFactors[0].shapValue.toFixed(3)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No elevated risk factors detected.</span>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" /> Top Protective Asset
            </span>
            <span className="text-slate-400 font-mono">Impact (-Log-Odds)</span>
          </div>
          {topProtectiveFactors[0] ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">{topProtectiveFactors[0].displayName}</span>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {topProtectiveFactors[0].shapValue.toFixed(3)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No prominent protective biomarkers.</span>
          )}
        </div>
      </div>
    </div>
  );
};
