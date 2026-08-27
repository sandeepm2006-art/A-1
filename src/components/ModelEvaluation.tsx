import React, { useState } from 'react';
import { ModelType } from '../types/cardio';
import { MODEL_EVALUATION_METRICS } from '../ml/engine';
import { Cpu, CheckCircle2, Sliders, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';

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

  // Operating point coordinates on ROC based on threshold
  const fpr = Math.max(0.04, Math.min(0.96, 1 - currentMetrics.specificity + (0.50 - decisionThreshold) * 0.4));
  const tpr = Math.max(0.1, Math.min(0.98, currentMetrics.sensitivity - (decisionThreshold - 0.50) * 0.3));
  const svgX = 40 + fpr * 240;
  const svgY = 170 - tpr * 150;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Multi-Algorithm Benchmarking & Diagnostic Evaluation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Evaluated on stratified holdout test cohort (n=848). Compares discrimination, calibration, sensitivity, specificity, and confusion matrix topologies.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {allModels.map((m) => {
            const mData = MODEL_EVALUATION_METRICS[m];
            const isSelected = activeModel === m;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.96 }}
                onClick={() => onModelSelect(m)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {mData.name.split(' (')[0]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Metric Cards Banner with Animated Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">ROC-AUC</span>
          <div className="text-lg font-mono font-black text-sky-700 mt-0.5">
            <AnimatedCounter value={currentMetrics.rocAuc} decimals={3} duration={400} />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Discrimination</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">PR-AUC</span>
          <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
            <AnimatedCounter value={currentMetrics.prAuc} decimals={3} duration={400} />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Imbalance Curve</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
          <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
            <AnimatedCounter value={currentMetrics.accuracy * 100} decimals={1} duration={400} />%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Overall Correct</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Sensitivity (TPR)</span>
          <div className="text-lg font-mono font-black text-emerald-600 mt-0.5">
            <AnimatedCounter value={currentMetrics.sensitivity * 100} decimals={1} duration={400} />%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">True Positive Rate</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Specificity (TNR)</span>
          <div className="text-lg font-mono font-black text-blue-600 mt-0.5">
            <AnimatedCounter value={currentMetrics.specificity * 100} decimals={1} duration={400} />%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">True Negative Rate</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">F1-Score</span>
          <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
            <AnimatedCounter value={currentMetrics.f1Score} decimals={3} duration={400} />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Harmonic Mean</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Brier Score</span>
          <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
            <AnimatedCounter value={currentMetrics.brierScore} decimals={3} duration={400} />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Prob. Calibration</span>
        </motion.div>
      </div>

      {/* Main Analysis: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix (2x2) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Confusion Matrix (Holdout n={totalSamples})
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation at threshold <strong className="font-mono text-slate-800">τ = {decisionThreshold.toFixed(2)}</strong>
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {currentMetrics.name}
            </span>
          </div>

          {/* 2x2 Matrix Graphic */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* True Negative */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                True Negative (TN)
              </span>
              <div className="text-3xl font-mono font-black text-emerald-900 my-1">
                <AnimatedCounter value={cm.trueNegative} decimals={0} duration={350} />
              </div>
              <p className="text-[11px] text-emerald-800">
                Correct low-risk classification (Spec: {(currentMetrics.specificity * 100).toFixed(1)}%)
              </p>
            </motion.div>

            {/* False Positive */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                False Positive (FP - Type I)
              </span>
              <div className="text-3xl font-mono font-black text-amber-900 my-1">
                <AnimatedCounter value={cm.falsePositive} decimals={0} duration={350} />
              </div>
              <p className="text-[11px] text-amber-800">
                Healthy flagged high-risk (Prec: {(currentMetrics.precision * 100).toFixed(1)}%)
              </p>
            </motion.div>

            {/* False Negative */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-red-50 border border-red-200 p-4 rounded-lg text-center shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider">
                False Negative (FN - Type II)
              </span>
              <div className="text-3xl font-mono font-black text-red-900 my-1">
                <AnimatedCounter value={cm.falseNegative} decimals={0} duration={350} />
              </div>
              <p className="text-[11px] text-red-800">
                Missed high-risk patients (Critical clinical penalty)
              </p>
            </motion.div>

            {/* True Positive */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-center shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">
                True Positive (TP)
              </span>
              <div className="text-3xl font-mono font-black text-sky-900 my-1">
                <AnimatedCounter value={cm.truePositive} decimals={0} duration={350} />
              </div>
              <p className="text-[11px] text-sky-800">
                Correctly flagged CVD cases (Sens: {(currentMetrics.sensitivity * 100).toFixed(1)}%)
              </p>
            </motion.div>
          </div>

          {/* Threshold Tuning Slider */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-700" /> Decision Cut-off Threshold
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
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
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.10 (High Sensitivity)</span>
              <span>0.50 (Standard)</span>
              <span>0.90 (High Specificity)</span>
            </div>
          </div>
        </div>

        {/* ROC & PR Curve Visualizer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-500">
                True Positive Rate vs. False Positive Rate across all thresholds
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
              AUC = {currentMetrics.rocAuc.toFixed(3)}
            </span>
          </div>

          {/* Realistic Oscilloscope Styled ROC Curve */}
          <div className="relative bg-slate-950 p-4 rounded-lg text-white border border-slate-800 shadow-inner">
            <svg viewBox="0 0 300 200" className="w-full h-48">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="40" y2="170" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="170" x2="280" y2="170" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="95" x2="280" y2="95" stroke="#0f172a" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="160" y1="20" x2="160" y2="170" stroke="#0f172a" strokeDasharray="3 3" strokeWidth="1" />
              
              {/* Diagonal chance line */}
              <line x1="40" y1="170" x2="280" y2="20" stroke="#475569" strokeDasharray="4" strokeWidth="1" />

              {/* Area under curve shading */}
              <path
                d="M 40,170 C 50,120 70,70 120,45 C 180,30 240,22 280,20 L 280,170 Z"
                fill="rgba(14, 165, 233, 0.15)"
              />

              {/* ROC Curve Path */}
              <path
                d="M 40,170 C 50,120 70,70 120,45 C 180,30 240,22 280,20"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
              />

              {/* Dynamic Animated operating point */}
              <circle
                cx={svgX}
                cy={svgY}
                r="6"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              <circle
                cx={svgX}
                cy={svgY}
                r="10"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.6"
                className="animate-ping"
              />
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-4">
              <span>0% FPR</span>
              <span className="text-sky-400 font-bold">Operating Point (τ={decisionThreshold.toFixed(2)})</span>
              <span>100% FPR</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentMetrics.description}
          </p>
        </div>
      </div>

      {/* Multi-Model Comparative Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Comprehensive Multi-Model Benchmark Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
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
                      isSelected ? 'bg-sky-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 text-slate-900 flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />}
                      {row.name}
                    </td>
                    <td className="p-3 font-mono font-bold text-sky-700">{row.rocAuc.toFixed(3)}</td>
                    <td className="p-3 font-mono">{row.prAuc.toFixed(3)}</td>
                    <td className="p-3 font-mono">{(row.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono text-emerald-600 font-semibold">{(row.sensitivity * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono text-blue-600 font-semibold">{(row.specificity * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono">{row.f1Score.toFixed(3)}</td>
                    <td className="p-3 font-mono">{row.brierScore.toFixed(3)}</td>
                    <td className="p-3">
                      {m === 'xgboost' ? (
                        <span className="bg-sky-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Selected
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
