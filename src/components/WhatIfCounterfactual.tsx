import React, { useState } from 'react';
import { CardioInputParams, PredictionResult } from '../types/cardio';
import { predictCardiovascularRisk } from '../ml/engine';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhatIfCounterfactualProps {
  originalParams: CardioInputParams;
  originalPrediction: PredictionResult;
}

export const WhatIfCounterfactual: React.FC<WhatIfCounterfactualProps> = ({
  originalParams,
  originalPrediction
}) => {
  const [simParams, setSimParams] = useState<CardioInputParams>({
    ...originalParams,
    systolicBP: Math.min(originalParams.systolicBP, 120),
    smokingStatus: 0,
    cigarettesPerDay: 0,
    bmi: Math.min(originalParams.bmi, 24.5),
    ldlCholesterol: Math.min(originalParams.ldlCholesterol, 95),
    physicalActivity: Math.max(originalParams.physicalActivity, 2)
  });

  const simPrediction = predictCardiovascularRisk(simParams, originalPrediction.modelType);
  const deltaPercent = Math.round((simPrediction.riskScorePercent - originalPrediction.riskScorePercent) * 10) / 10;
  const isReduced = deltaPercent < 0;

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const updateSimField = (key: keyof CardioInputParams, val: number) => {
    const updated = { ...simParams, [key]: val };
    if (key === 'smokingStatus' && val === 0) updated.cigarettesPerDay = 0;
    setSimParams(updated);
  };

  const resetSimulation = () => {
    setSimParams({ ...originalParams });
  };

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              "What-If" Counterfactual Intervention Laboratory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quantify predicted 10-year risk reduction and SHAP attribution shifts from modifiable lifestyle habits and clinical interventions.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors self-start md:self-auto shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Outcome Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Current Baseline
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {originalPrediction.riskScorePercent}
              </span>
              <span className="text-lg font-bold text-slate-400">%</span>
            </div>
            <div className="text-xs font-bold mt-2">
              Tier: <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black text-white ${
                originalPrediction.riskCategory === 'High' ? 'bg-red-600' :
                originalPrediction.riskCategory === 'Intermediate' ? 'bg-amber-600' :
                originalPrediction.riskCategory === 'Borderline' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>{originalPrediction.riskCategory}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
            Unmodified initial patient biomarkers.
          </p>
        </div>

        {/* Projected Counterfactual */}
        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
              Projected Post-Intervention
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-emerald-900 tracking-tight">
                {simPrediction.riskScorePercent}
              </span>
              <span className="text-lg font-bold text-emerald-600">%</span>
            </div>
            <div className="text-xs font-bold mt-2 text-emerald-900">
              New Tier: <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black text-white ${
                simPrediction.riskCategory === 'High' ? 'bg-red-600' :
                simPrediction.riskCategory === 'Intermediate' ? 'bg-amber-600' :
                simPrediction.riskCategory === 'Borderline' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>{simPrediction.riskCategory}</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-800 mt-3 pt-2.5 border-t border-emerald-200/80 font-medium">
            Simulated optimization of BP, smoking, and lipids.
          </p>
        </div>

        {/* Net Quantified Benefit (Slate-900 High Density Box) */}
        <div className="bg-slate-900 p-4 rounded-xl text-white shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Net Quantified Benefit
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-mono font-black text-emerald-400">
                {deltaPercent}%
              </span>
              <span className="text-xs font-sans text-slate-400 uppercase font-bold">Absolute Δ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800">
            {isReduced ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Risk Reduced
                </span>
                <button
                  type="button"
                  onClick={triggerConfetti}
                  className="text-[10px] font-bold bg-sky-700 hover:bg-sky-600 text-white px-2 py-0.5 rounded uppercase tracking-wider transition-colors"
                >
                  Celebrate
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No net reduction simulated.</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-2 h-2 rounded-full bg-sky-600"></span>
          Modifiable Clinical Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Target SBP */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Systolic BP</label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {simParams.systolicBP} mmHg
              </span>
            </div>
            <input
              type="range"
              min={90}
              max={180}
              value={simParams.systolicBP}
              onChange={(e) => updateSimField('systolicBP', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
              <span>Init: {originalParams.systolicBP} mmHg</span>
              <span className="text-emerald-700 font-bold">Goal: ≤120</span>
            </div>
          </div>

          {/* Smoking Cessation */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Smoking Cessation Status
            </label>
            <div className="grid grid-cols-2 gap-1.5 my-1">
              <button
                type="button"
                onClick={() => updateSimField('smokingStatus', 0)}
                className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                  simParams.smokingStatus === 0
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Quit / Non-Smoker
              </button>
              <button
                type="button"
                onClick={() => updateSimField('smokingStatus', 1)}
                className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                  simParams.smokingStatus === 1
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Active Smoker
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Init: {originalParams.smokingStatus === 1 ? `Smoker (${originalParams.cigarettesPerDay} cigs)` : 'Non-Smoker'}
            </div>
          </div>

          {/* Target BMI */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target BMI</label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {simParams.bmi} kg/m²
              </span>
            </div>
            <input
              type="range"
              min={18.5}
              max={40.0}
              step={0.1}
              value={simParams.bmi}
              onChange={(e) => updateSimField('bmi', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
              <span>Init: {originalParams.bmi}</span>
              <span className="text-emerald-700 font-bold">Goal: 18.5-24.9</span>
            </div>
          </div>

          {/* Target LDL */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target LDL-C</label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {simParams.ldlCholesterol} mg/dL
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={220}
              value={simParams.ldlCholesterol}
              onChange={(e) => updateSimField('ldlCholesterol', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
              <span>Init: {originalParams.ldlCholesterol} mg/dL</span>
              <span className="text-emerald-700 font-bold">Goal: &lt;100</span>
            </div>
          </div>

          {/* Physical Activity */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Exercise Frequency
            </label>
            <select
              value={simParams.physicalActivity}
              onChange={(e) => updateSimField('physicalActivity', Number(e.target.value))}
              className="w-full bg-white text-slate-800 text-xs font-semibold rounded px-2.5 py-1.5 border border-slate-200 focus:ring-1 focus:ring-sky-600 focus:outline-none"
            >
              <option value={0}>Sedentary (&lt;30m/wk)</option>
              <option value={1}>Light (1-2x/wk)</option>
              <option value={2}>Moderate (150 min/wk aerobic)</option>
              <option value={3}>Active (&gt;300 min/wk vigorous)</option>
            </select>
            <div className="text-[10px] text-slate-400 mt-1">
              Simulates cardiorespiratory fitness
            </div>
          </div>

          {/* Anti-Hypertensive Therapy */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Hypertension Therapy
            </label>
            <div className="grid grid-cols-2 gap-1.5 my-1">
              <button
                type="button"
                onClick={() => updateSimField('onHypertensionMeds', 0)}
                className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                  simParams.onHypertensionMeds === 0
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Untreated
              </button>
              <button
                type="button"
                onClick={() => updateSimField('onHypertensionMeds', 1)}
                className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                  simParams.onHypertensionMeds === 1
                    ? 'bg-sky-700 text-white border-sky-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Treated
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              Antihypertensive medication coverage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
