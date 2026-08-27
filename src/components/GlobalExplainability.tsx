import React, { useState } from 'react';
import { GLOBAL_SHAP_FEATURES, generateBeeswarmData } from '../ml/engine';
import { Layers } from 'lucide-react';
import { motion } from 'motion/react';

export const GlobalExplainability: React.FC = () => {
  const [activeView, setActiveView] = useState<'importance' | 'beeswarm'>('beeswarm');

  const topFeatures = GLOBAL_SHAP_FEATURES.slice(0, 10);
  const maxMeanAbs = Math.max(...topFeatures.map(f => f.meanAbsShap));

  // Generate beeswarm sample for active top 8 features
  const beeswarmFeatureKeys = ['systolicBP', 'age', 'smokingStatus', 'hdlCholesterol', 'ldlCholesterol', 'diabetesStatus', 'bmi', 'physicalActivity'];

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
            <Layers className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Global Model Interpretability & Cohort SHAP Distributions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Explains population-level behavior across the validation cohort (n=848 patients), capturing both linear importance and non-linear feature distributions.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('beeswarm')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeView === 'beeswarm' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SHAP Beeswarm Summary
          </button>
          <button
            onClick={() => setActiveView('importance')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeView === 'importance' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mean |SHAP| Ranking
          </button>
        </div>
      </motion.div>

      {activeView === 'beeswarm' ? (
        /* SHAP Beeswarm Plot View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                SHAP Summary Beeswarm Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Each point represents an individual patient in the cohort. Position along X-axis indicates directional SHAP impact on risk.
              </p>
            </div>

            {/* Colormap Legend */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Feature Value:</span>
              <span className="font-bold text-sky-700 text-[11px]">Low</span>
              <div className="w-20 h-2 rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-red-500 shadow-inner"></div>
              <span className="font-bold text-red-600 text-[11px]">High</span>
            </div>
          </div>

          {/* Beeswarm Rows */}
          <div className="space-y-2.5 pt-1">
            {/* Axis Center Line Marker */}
            <div className="relative text-center pb-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 sm:px-32">
                <span className="text-emerald-700">← Decreases Risk (Protective)</span>
                <span className="text-slate-700 font-mono">SHAP = 0</span>
                <span className="text-red-700">Increases Risk →</span>
              </div>
            </div>

            {beeswarmFeatureKeys.map((featureKey, fIdx) => {
              const featMeta = GLOBAL_SHAP_FEATURES.find(f => f.featureKey === featureKey) || {
                displayName: featureKey,
                category: 'clinical',
                description: ''
              };
              const points = generateBeeswarmData(featureKey, 50);

              return (
                <motion.div
                  key={featureKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: fIdx * 0.03 }}
                  className="grid grid-cols-12 items-center gap-2 group hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  {/* Feature Label */}
                  <div className="col-span-3 text-xs">
                    <div className="font-bold text-slate-900 truncate text-xs">
                      {featMeta.displayName}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {featMeta.category}
                    </span>
                  </div>

                  {/* Beeswarm Scatter Lane */}
                  <div className="col-span-9 relative h-7 bg-slate-100/80 rounded-lg overflow-hidden border border-slate-200/80 flex items-center">
                    {/* Zero Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400 z-0"></div>

                    {/* Render Scattered Points */}
                    {points.map((pt) => {
                      const xPct = 50 + (pt.shapValue / 0.9) * 45;
                      const clampedX = Math.max(3, Math.min(97, xPct));
                      const yPos = 50 + pt.jitter * 35;

                      // Color interpolation from Sky-Blue (Low) to Red (High)
                      const norm = pt.featureValueNorm;
                      const r = Math.round(14 + norm * (239 - 14));
                      const g = Math.round(165 - norm * (165 - 68));
                      const b = Math.round(233 - norm * (233 - 68));
                      const color = `rgb(${r}, ${g}, ${b})`;

                      return (
                        <motion.div
                          key={pt.id}
                          whileHover={{ scale: 1.8, zIndex: 30 }}
                          className="absolute w-2 h-2 rounded-full opacity-80 hover:opacity-100 transition-transform shadow-xs cursor-pointer z-10"
                          style={{
                            left: `${clampedX}%`,
                            top: `${yPos}%`,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: color
                          }}
                          title={`${featMeta.displayName}: Raw = ${pt.featureValueRaw}, SHAP = ${pt.shapValue > 0 ? '+' : ''}${pt.shapValue.toFixed(3)}`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>💡 <strong>Interpretation Guide:</strong> Red dots on the right side indicate high feature values push cardiovascular risk higher. Red dots on the left (e.g., HDL Cholesterol) indicate high levels protect against CVD.</span>
          </div>
        </motion.div>
      ) : (
        /* Global Importance Ranking View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mean Absolute SHAP Feature Importance Ranking (mean |φᵢ|)
            </h3>
            <p className="text-xs text-slate-500">
              Quantifies the average overall magnitude of each cardiovascular parameter's impact on predictions across all cohort samples.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {topFeatures.map((feat, idx) => {
              const widthPct = (feat.meanAbsShap / maxMeanAbs) * 100;
              return (
                <motion.div
                  key={feat.featureKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">
                      #{idx + 1}. {feat.displayName}
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {feat.meanAbsShap.toFixed(3)} mean |φ|
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-600 to-sky-700 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: idx * 0.03 }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
