import React, { useState } from 'react';
import { ShapContribution } from '../types/cardio';
import { Info, HelpCircle } from 'lucide-react';

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
            <span className="w-2.5 h-2.5 bg-sky-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              SHAP Local Impact Waterfall
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            E[f(x)] = {(baseValue).toFixed(3)}
          </span>
        </div>

        {/* Feature contribution rows */}
        <div className="space-y-2.5">
          {steps.map((step, idx) => {
            const isPositive = step.delta >= 0;
            const leftVal = Math.min(step.start, step.end);
            const rightVal = Math.max(step.start, step.end);
            const leftPct = getPercentPos(leftVal);
            const widthPct = Math.max(1.2, getPercentPos(rightVal) - leftPct);
            const isHovered = hoveredFeature?.featureName === step.featureName;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(step)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100/90 shadow-xs' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800">{step.displayName}</span>
                    <span className="font-mono text-slate-400 lowercase font-medium">
                      ({String(step.originalValue)} {step.unit})
                    </span>
                  </div>
                  <span className={`font-mono ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isPositive ? `+${step.delta.toFixed(3)}` : step.delta.toFixed(3)}
                  </span>
                </div>

                <div className="h-5 rounded bg-slate-100 border border-slate-200/80 relative overflow-hidden flex items-center">
                  <div
                    className={`absolute h-full rounded-sm transition-all duration-300 ${
                      isPositive ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Explanation Callout */}
      {hoveredFeature ? (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white text-xs">
              {hoveredFeature.displayName} ({hoveredFeature.originalValue} {hoveredFeature.unit})
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
              {hoveredFeature.clinicalContext}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Hover over any feature step to inspect clinical rationale and biological mechanism.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400 font-bold hidden sm:inline">
            E[f(x)] + ∑ φᵢ = f(x)
          </span>
        </div>
      )}

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
