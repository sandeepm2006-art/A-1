import React from 'react';
import { ShapContribution } from '../types/cardio';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface ShapForcePlotProps {
  contributions: ShapContribution[];
  baseValue: number;
  finalRiskPercent: number;
}

export const ShapForcePlot: React.FC<ShapForcePlotProps> = ({
  contributions,
  baseValue,
  finalRiskPercent
}) => {
  const positiveDrivers = contributions.filter(c => c.shapValue > 0.01);
  const protectiveDrivers = contributions.filter(c => c.shapValue < -0.01);

  const totalPositive = positiveDrivers.reduce((a, b) => a + b.shapValue, 0);
  const totalProtective = Math.abs(protectiveDrivers.reduce((a, b) => a + b.shapValue, 0));
  const totalForce = Math.max(0.1, totalPositive + totalProtective);

  const positivePercent = (totalPositive / totalForce) * 100;
  const protectivePercent = (totalProtective / totalForce) * 100;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            SHAP Force Balance Vector
          </h3>
        </div>
        <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">
          f(x) = {finalRiskPercent}% | Base = {(baseValue * 100).toFixed(1)}%
        </div>
      </div>

      {/* Force Balance Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="text-emerald-700 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Protective Force ({protectivePercent.toFixed(0)}%)
          </span>
          <span className="text-red-700 flex items-center gap-1">
            Harmful Driver Force ({positivePercent.toFixed(0)}%) <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 border border-slate-200">
          {/* Protective Blocks */}
          <div
            className="h-full bg-emerald-600 flex items-center justify-end px-2 text-[10px] font-mono font-bold text-white transition-all duration-500"
            style={{ width: `${protectivePercent}%` }}
          >
            {protectivePercent > 15 && `-${totalProtective.toFixed(2)}`}
          </div>

          {/* Dividing Marker */}
          <div className="w-1 bg-slate-900 shrink-0 h-full z-10"></div>

          {/* Harmful Blocks */}
          <div
            className="h-full bg-red-600 flex items-center justify-start px-2 text-[10px] font-mono font-bold text-white transition-all duration-500"
            style={{ width: `${positivePercent}%` }}
          >
            {positivePercent > 15 && `+${totalPositive.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Top Force Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        {/* Protective Tags */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Pulling Down:</span>
          {protectiveDrivers.slice(0, 3).map((p, i) => (
            <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
              {p.displayName} ({p.shapValue.toFixed(2)})
            </span>
          ))}
        </div>

        {/* Harmful Tags */}
        <div className="flex flex-wrap gap-1.5 items-center justify-start sm:justify-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Pushing Up:</span>
          {positiveDrivers.slice(0, 3).map((p, i) => (
            <span key={i} className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[11px] font-medium">
              {p.displayName} (+{p.shapValue.toFixed(2)})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
