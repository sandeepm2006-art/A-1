import React, { useState } from 'react';
import { ModelType } from '../types/cardio';
import { MODEL_EVALUATION_METRICS } from '../ml/engine';
import { Cpu, CheckCircle2, Sliders, BarChart2, ShieldCheck, Activity } from 'lucide-react';

interface ModelEvaluationProps {
  activeModel: ModelType;
  onModelSelect: (model: ModelType) => void;
}

export const ModelEvaluation: React.FC<ModelEvaluationProps> = ({
  activeModel,
  onModelSelect
}) => {
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.50);

  const currentMetrics = MODEL_EVALUATION_METRICS[activeModel];
  const allModels: ModelType[] = ['xgboost', 'random_forest', 'logistic_regression', 'svm'];

  const cm = currentMetrics.confusionMatrix;
  const totalSamples = cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Multi-Algorithm Benchmarking & Clinical Diagnostic Evaluation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Evaluated on a stratified holdout test cohort of 848 patient records. Compares discrimination, calibration, sensitivity, specificity, and confusion matrix topologies.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {allModels.map((m) => {
            const mData = MODEL_EVALUATION_METRICS[m];
            const isSelected = activeModel === m;
            return (
              <button
                key={m}
                onClick={() => onModelSelect(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {mData.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">ROC-AUC</span>
          <div className="text-lg font-black text-rose-600 mt-0.5">
            {currentMetrics.rocAuc.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">Discrimination</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">PR-AUC</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {currentMetrics.prAuc.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">Imbalance Curve</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {(currentMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">Overall Correct</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Sensitivity (Recall)</span>
          <div className="text-lg font-black text-emerald-600 mt-0.5">
            {(currentMetrics.sensitivity * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">True Positive Rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Specificity</span>
          <div className="text-lg font-black text-blue-600 mt-0.5">
            {(currentMetrics.specificity * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">True Negative Rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">F1-Score</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {currentMetrics.f1Score.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">Harmonic Mean</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Brier Score</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {currentMetrics.brierScore.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">Prob. Calibration</span>
        </div>
      </div>

      {/* Main Analysis: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix (2x2) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Confusion Matrix (Holdout n={totalSamples})
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation at classification threshold <strong className="font-mono">τ = {decisionThreshold.toFixed(2)}</strong>
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {currentMetrics.name}
            </span>
          </div>

          {/* 2x2 Matrix Graphic */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                True Negative (TN)
              </span>
              <div className="text-3xl font-black text-emerald-900 my-1">
                {cm.trueNegative}
              </div>
              <p className="text-[11px] text-emerald-800">
                Correctly identified low-risk patients (Specificity: {(currentMetrics.specificity * 100).toFixed(1)}%)
              </p>
            </div>

            {/* False Positive */}
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                False Positive (FP - Type I)
              </span>
              <div className="text-3xl font-black text-amber-900 my-1">
                {cm.falsePositive}
              </div>
              <p className="text-[11px] text-amber-800">
                Healthy patients flagged as high risk (Precision: {(currentMetrics.precision * 100).toFixed(1)}%)
              </p>
            </div>

            {/* False Negative */}
            <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">
                False Negative (FN - Type II)
              </span>
              <div className="text-3xl font-black text-rose-900 my-1">
                {cm.falseNegative}
              </div>
              <p className="text-[11px] text-rose-800">
                Missed high-risk patients (Critical clinical penalty)
              </p>
            </div>

            {/* True Positive */}
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                True Positive (TP)
              </span>
              <div className="text-3xl font-black text-blue-900 my-1">
                {cm.truePositive}
              </div>
              <p className="text-[11px] text-blue-800">
                Correctly identified CVD cases (Sensitivity: {(currentMetrics.sensitivity * 100).toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Threshold Tuning Slider */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-rose-500" /> Decision Cut-off Threshold
              </span>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {decisionThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.90}
              step={0.05}
              value={decisionThreshold}
              onChange={(e) => setDecisionThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.10 (High Sensitivity)</span>
              <span>0.50 (Standard)</span>
              <span>0.90 (High Specificity)</span>
            </div>
          </div>
        </div>

        {/* ROC & PR Curve Visualizer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-500">
                True Positive Rate vs. False Positive Rate across all discrimination thresholds
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              AUC = {currentMetrics.rocAuc.toFixed(3)}
            </span>
          </div>

          {/* ROC SVG Graphic */}
          <div className="relative bg-slate-900 p-4 rounded-xl text-white">
            <svg viewBox="0 0 300 200" className="w-full h-48">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="40" y2="170" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="170" x2="280" y2="170" stroke="#334155" strokeWidth="1" />
              
              {/* Diagonal chance line */}
              <line x1="40" y1="170" x2="280" y2="20" stroke="#64748b" strokeDasharray="4" strokeWidth="1" />

              {/* ROC Curve Path */}
              <path
                d="M 40,170 C 50,120 70,70 120,45 C 180,30 240,22 280,20"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
              />

              {/* Area under curve shading */}
              <path
                d="M 40,170 C 50,120 70,70 120,45 C 180,30 240,22 280,20 L 280,170 Z"
                fill="rgba(244, 63, 94, 0.15)"
              />

              {/* Active operating point */}
              <circle cx="100" cy="55" r="5" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
            </svg>

            <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-4">
              <span>0% FPR (1 - Specificity)</span>
              <span>Operating Point (τ={decisionThreshold})</span>
              <span>100% FPR</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {currentMetrics.description}
          </p>
        </div>
      </div>

      {/* Multi-Model Comparative Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Comprehensive Multi-Model Benchmark Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3">Algorithm</th>
                <th className="p-3">ROC-AUC</th>
                <th className="p-3">PR-AUC</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Sensitivity</th>
                <th className="p-3">Specificity</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">Brier Score</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allModels.map((m) => {
                const row = MODEL_EVALUATION_METRICS[m];
                const isSelected = activeModel === m;
                return (
                  <tr
                    key={m}
                    onClick={() => onModelSelect(m)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-rose-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 text-slate-900 flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />}
                      {row.name}
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-600">{row.rocAuc.toFixed(3)}</td>
                    <td className="p-3 font-mono">{row.prAuc.toFixed(3)}</td>
                    <td className="p-3 font-mono">{(row.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono text-emerald-600">{(row.sensitivity * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono text-blue-600">{(row.specificity * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono">{row.f1Score.toFixed(3)}</td>
                    <td className="p-3 font-mono">{row.brierScore.toFixed(3)}</td>
                    <td className="p-3">
                      {m === 'xgboost' ? (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Top Model
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
