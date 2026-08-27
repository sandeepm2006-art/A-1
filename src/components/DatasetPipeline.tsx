import React, { useState } from 'react';
import { DATASET_STATS, PREPROCESSING_PIPELINE_STEPS, SAMPLE_DISTRIBUTIONS, CORRELATION_MATRIX } from '../data/dataset';
import { Database, ShieldCheck, CheckCircle2, BarChart2, GitFork, AlertTriangle } from 'lucide-react';

export const DatasetPipeline: React.FC = () => {
  const [selectedDistKey, setSelectedDistKey] = useState<string>('systolicBP');

  const currentDist = SAMPLE_DISTRIBUTIONS.find(d => d.key === selectedDistKey) || SAMPLE_DISTRIBUTIONS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Dataset Ingestion, Preprocessing & Leakage Prevention Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Synthesized multi-ethnic cohort of 4,240 longitudinal patient records. Engineered strictly with out-of-fold transformations to prevent data leakage and ensure real-time pipeline determinism.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Leak-Free Validated</span>
        </div>
      </div>

      {/* Dataset Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Records</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {DATASET_STATS.totalRecords.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Longitudinal cohort</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Features Selected</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {DATASET_STATS.totalFeatures}
          </div>
          <span className="text-[11px] text-slate-500">Continuous & Categorical</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Class Imbalance</span>
          <div className="text-xl font-black text-amber-600 mt-0.5">
            {(DATASET_STATS.positiveClassRatio * 100).toFixed(1)}% CVD
          </div>
          <span className="text-[11px] text-slate-500">644 Pos / 3,596 Neg</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Train/Test Holdout</span>
          <div className="text-xl font-black text-blue-600 mt-0.5">
            80% / 20%
          </div>
          <span className="text-[11px] text-slate-500">3,392 Train / 848 Test</span>
        </div>
      </div>

      {/* 6-Step Leakage-Free Preprocessing Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-600" />
            End-to-End Leak-Free Preprocessing Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each transformer learns stateful parameters (means, scales, neighbors) exclusively from training partitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {PREPROCESSING_PIPELINE_STEPS.map((step) => (
            <div key={step.stepNumber} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-[11px] text-emerald-800 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Leakage Guard:</strong> {step.leakagePrevention}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Distributions & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Feature Distributions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Feature Stratified Distributions
              </h3>
              <p className="text-xs text-slate-500">
                Comparing disease incidence across parameter stratifications
              </p>
            </div>

            <select
              value={selectedDistKey}
              onChange={(e) => setSelectedDistKey(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-300 focus:outline-none"
            >
              {SAMPLE_DISTRIBUTIONS.map((d) => (
                <option key={d.key} value={d.key}>{d.name.split(' (')[0]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            {currentDist.bins.map((bin, i) => {
              const total = bin.countNoCVD + bin.countCVD;
              const cvdPct = (bin.countCVD / total) * 100;

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{bin.range} {currentDist.unit}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {bin.countCVD} CVD / {bin.countNoCVD} Non-CVD ({cvdPct.toFixed(1)}% event rate)
                    </span>
                  </div>

                  <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${100 - cvdPct}%` }}
                      title={`No CVD: ${bin.countNoCVD}`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{ width: `${cvdPct}%` }}
                      title={`CVD Events: ${bin.countCVD}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs pt-1 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span>Non-CVD Patient Proportion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
              <span>Positive CVD Risk Event Rate</span>
            </div>
          </div>
        </div>

        {/* Correlation Heatmap List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pairwise Pearson Feature Correlations
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates multi-collinearity and physiological correlation with 10-year CVD events
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {CORRELATION_MATRIX.map((c, idx) => {
              const isPositive = c.r >= 0;
              const absVal = Math.abs(c.r);
              const colorBg = isPositive ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900';

              return (
                <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${colorBg}`}>
                  <div className="truncate mr-2">
                    <span className="font-semibold">{c.feature1}</span>
                    <span className="text-slate-400 mx-1">↔</span>
                    <span className="font-semibold">{c.feature2}</span>
                  </div>
                  <span className="font-mono font-bold text-xs shrink-0">
                    {isPositive ? `+${c.r.toFixed(2)}` : c.r.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
