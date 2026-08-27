import React, { useState } from 'react';
import { ShapContribution } from '../types/cardio';
import { Info, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShapWaterfallProps {
  contributions: ShapContribution[];
  baseValue: number;
  finalRiskPercent: number;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  contributions,
  baseValue,
  finalRiskPercent
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<ShapContribution | null>(null);

  const displayContributions = contributions.slice(0, 9);
  const otherContributions = contributions.slice(9);
  const otherSum = otherContributions.reduce((acc, c) => acc + c.shapValue, 0);

  const items = [...displayContributions];
  if (otherContributions.length > 0) {
    items.push({
      featureName: 'other',
      displayName: `8 Other Features Combined`,
      originalValue: 'Various',
      unit: '',
      shapValue: otherSum,
      direction: otherSum >= 0 ? 'increase' : 'decrease',
      clinicalContext: 'Cumulative contribution of remaining lower-magnitude clinical features.',
      isModifiable: false
    });
  }

  const baseLogOdds = Math.log(baseValue / (1 - baseValue));
  let runningLogOdds = baseLogOdds;

  const steps = items.map((item) => {
    const start = runningLogOdds;
    runningLogOdds += item.shapValue;
    const end = runningLogOdds;
    return {
      ...item,
      start,
      end,
      delta: item.shapValue
    };
  });

  const allValues = [baseLogOdds, ...steps.map(s => s.start), ...steps.map(s => s.end)];
  const minVal = Math.min(...allValues) - 0.25;
  const maxVal = Math.max(...allValues) + 0.25;
  const range = maxVal - minVal;

  const getPercentPos = (val: number) => {
    return ((val - minVal) / range) * 100;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        {/* Header matching High Density Design Theme */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-sky-600 rounded-full animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              SHAP Local Impact Waterfall
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            E[f(x)] = {(baseValue).toFixed(3)}
          </span>
        </div>

        {/* Feature contribution rows with Realistic Spring Animations */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isPositive = step.delta >= 0;
            const leftVal = Math.min(step.start, step.end);
            const rightVal = Math.max(step.start, step.end);
            const leftPct = getPercentPos(leftVal);
            const widthPct = Math.max(1.5, getPercentPos(rightVal) - leftPct);
            const isHovered = hoveredFeature?.featureName === step.featureName;

            return (
              <motion.div
                key={step.featureName}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 28 },
                  opacity: { duration: 0.2 },
                  delay: idx * 0.02
                }}
                onMouseEnter={() => setHoveredFeature(step)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                  isHovered
                    ? 'bg-slate-100/90 border-slate-300 shadow-xs'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <span className="text-slate-800 font-bold truncate">{step.displayName}</span>
                    <span className="font-mono text-slate-400 lowercase font-medium shrink-0">
                      ({String(step.originalValue)} {step.unit})
                    </span>
                  </div>
                  <motion.span
                    key={step.delta}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`font-mono shrink-0 font-bold ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}
                  >
                    {isPositive ? `+${step.delta.toFixed(3)}` : step.delta.toFixed(3)}
                  </motion.span>
                </div>

                <div className="h-5 rounded bg-slate-100 border border-slate-200/80 relative overflow-hidden flex items-center">
                  {/* Subtle baseline guide */}
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-slate-300 z-10"
                    style={{ left: `${getPercentPos(baseLogOdds)}%` }}
                  />

                  {/* Dynamic Spring Waterfall Bar */}
                  <motion.div
                    className={`absolute h-full rounded-sm ${
                      isPositive
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    initial={false}
                    animate={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 26
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interactive Explanation Callout with AnimatePresence */}
      <div className="min-h-[56px]">
        <AnimatePresence mode="wait">
          {hoveredFeature ? (
            <motion.div
              key={hoveredFeature.featureName}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-slate-900 text-white p-3 rounded-lg text-xs flex items-start gap-2.5 shadow-sm"
            >
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>{hoveredFeature.displayName}</span>
                  <span className="text-slate-400 font-mono font-normal">
                    ({hoveredFeature.originalValue} {hoveredFeature.unit})
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    hoveredFeature.shapValue >= 0 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {hoveredFeature.shapValue >= 0 ? `+${hoveredFeature.shapValue.toFixed(3)}` : hoveredFeature.shapValue.toFixed(3)}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                  {hoveredFeature.clinicalContext}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="default-help"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Hover over any feature step to inspect clinical rationale and biological mechanism.</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 font-bold hidden sm:inline">
                E[f(x)] + ∑ φᵢ = f(x)
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Legend matching Design Theme */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Increases Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Decreases Risk
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 font-bold">
          Base Value: {baseValue.toFixed(3)}
        </span>
      </div>
    </div>
  );
};
