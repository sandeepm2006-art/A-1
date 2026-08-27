import React, { useState } from 'react';
import { GLOBAL_SHAP_FEATURES, generateBeeswarmData } from '../ml/engine';
import { Layers, Activity, Eye, HelpCircle, BarChart3, Shuffle } from 'lucide-react';

export const GlobalExplainability: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('systolicBP');
  const [activeView, setActiveView] = useState<'importance' | 'beeswarm'>('beeswarm');

  const topFeatures = GLOBAL_SHAP_FEATURES.slice(0, 10);
  const maxMeanAbs = Math.max(...topFeatures.map(f => f.meanAbsShap));

  // Generate beeswarm sample for active top 8 features
  const beeswarmFeatureKeys = ['systolicBP', 'age', 'smokingStatus', 'hdlCholesterol', 'ldlCholesterol', 'diabetesStatus', 'bmi', 'physicalActivity'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Global Model Interpretability & Cohort SHAP Distributions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Explains the overall population-level behavior of the Gradient Boosted Tree model across the validation cohort (n=848 patients), capturing both linear importance and non-linear feature distributions.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('beeswarm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'beeswarm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SHAP Beeswarm Summary
          </button>
          <button
            onClick={() => setActiveView('importance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'importance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mean |SHAP| Ranking
          </button>
        </div>
      </div>

      {activeView === 'beeswarm' ? (
        /* SHAP Beeswarm Plot View */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                SHAP Summary Beeswarm Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Each dot represents an individual patient in the cohort. Position along the X-axis indicates the directional SHAP impact on risk.
              </p>
            </div>

            {/* Colormap Legend */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Feature Value:</span>
              <span className="font-semibold text-blue-600">Low</span>
              <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 shadow-inner"></div>
              <span className="font-semibold text-rose-600">High</span>
            </div>
          </div>

          {/* Beeswarm Rows */}
          <div className="space-y-4 pt-2">
            {/* Axis Center Line Marker */}
            <div className="relative text-center pb-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-32">
                <span className="text-emerald-700">← Decreases CVD Risk (Protective)</span>
                <span className="text-slate-700 font-bold">SHAP Value (Impact on Log-Odds) = 0</span>
                <span className="text-rose-700">Increases CVD Risk →</span>
              </div>
            </div>

            {beeswarmFeatureKeys.map((featureKey) => {
              const featMeta = GLOBAL_SHAP_FEATURES.find(f => f.featureKey === featureKey) || {
                displayName: featureKey,
                category: 'clinical',
                description: ''
              };
              const points = generateBeeswarmData(featureKey, 55);

              return (
                <div key={featureKey} className="grid grid-cols-12 items-center gap-2 group hover:bg-slate-50/80 p-2 rounded-xl transition-all">
                  {/* Feature Label */}
                  <div className="col-span-3 text-xs">
                    <div className="font-bold text-slate-900 truncate">
                      {featMeta.displayName}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {featMeta.category}
                    </span>
                  </div>

                  {/* Beeswarm Scatter Lane */}
                  <div className="col-span-9 relative h-8 bg-slate-100/70 rounded-xl overflow-hidden border border-slate-200/60 flex items-center">
                    {/* Zero Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400 z-0"></div>

                    {/* Render Scattered Points */}
                    {points.map((pt) => {
                      // Map shapVal from -0.8 to +0.8 into 0% to 100%
                      const xPct = 50 + (pt.shapValue / 0.9) * 45;
                      const clampedX = Math.max(3, Math.min(97, xPct));
                      const yPos = 50 + pt.jitter * 35;

                      // Color interpolation from Blue (Low) to Red (High)
                      const norm = pt.featureValueNorm;
                      const r = Math.round(59 + norm * (239 - 59));
                      const g = Math.round(130 - norm * (130 - 68));
                      const b = Math.round(246 - norm * (246 - 68));
                      const color = `rgb(${r}, ${g}, ${b})`;

                      return (
                        <div
                          key={pt.id}
                          className="absolute w-2.5 h-2.5 rounded-full opacity-80 hover:opacity-100 hover:scale-150 transition-transform shadow-xs cursor-pointer z-10"
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
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>💡 <strong>Interpretation Guide:</strong> Red dots on the right side (e.g. for Systolic BP and Age) indicate high feature values actively push cardiovascular risk higher. Red dots on the left (for HDL Cholesterol) indicate high levels protect against CVD.</span>
          </div>
        </div>
      ) : (
        /* Global Importance Ranking View */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Mean Absolute SHAP Feature Importance Ranking (mean |φᵢ|)
            </h3>
            <p className="text-xs text-slate-500">
              Quantifies the average overall magnitude of each cardiovascular parameter's impact on predictions across all cohort samples.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {topFeatures.map((feat, idx) => {
              const widthPct = (feat.meanAbsShap / maxMeanAbs) * 100;
              return (
                <div key={feat.featureKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">
                      #{idx + 1}. {feat.displayName}
                    </span>
                    <span className="font-mono text-slate-900">
                      {feat.meanAbsShap.toFixed(3)} mean |φ|
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
