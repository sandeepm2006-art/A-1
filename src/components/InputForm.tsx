import React from 'react';
import { CardioInputParams, ValidationIssue } from '../types/cardio';
import { PRESET_PATIENTS, FEATURE_METADATA } from '../ml/engine';
import {
  User,
  Heart,
  Droplets,
  Flame,
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface InputFormProps {
  params: CardioInputParams;
  onChange: (params: CardioInputParams) => void;
  validationIssues: ValidationIssue[];
}

export const InputForm: React.FC<InputFormProps> = ({
  params,
  onChange,
  validationIssues
}) => {
  const updateField = (key: keyof CardioInputParams, value: number) => {
    const updated = { ...params, [key]: value };
    if (key === 'smokingStatus' && value === 0) {
      updated.cigarettesPerDay = 0;
    }
    if (key === 'smokingStatus' && value === 1 && updated.cigarettesPerDay === 0) {
      updated.cigarettesPerDay = 10;
    }
    onChange(updated);
  };

  const handlePresetSelect = (presetId: string) => {
    const found = PRESET_PATIENTS.find(p => p.id === presetId);
    if (found) {
      onChange({ ...found.params });
    }
  };

  const resetToDefault = () => {
    handlePresetSelect('healthy_adult');
  };

  const hasErrors = validationIssues.some(v => v.type === 'error');

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Header & Quick Archetype Presets */}
      <div className="bg-slate-50/80 p-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-700" />
                Patient Health Parameters
              </h2>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                17 Multi-Parametric Features
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Input patient clinical biomarkers or select an established cohort archetype
            </p>
          </div>

          <button
            type="button"
            onClick={resetToDefault}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors flex items-center gap-1 self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Quick Archetype Pills */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Archetype Presets:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_PATIENTS.map((p) => {
              const badgeTheme: Record<string, string> = {
                'Low Risk': 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
                'Borderline Risk': 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
                'High Risk': 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              };
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${badgeTheme[p.badge] || 'bg-white'}`}
                >
                  <div className="font-bold text-slate-900 truncate text-xs">
                    {p.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] font-semibold opacity-90 mt-0.5 uppercase tracking-wider">
                    {p.badge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation Alert Box */}
      {validationIssues.length > 0 && (
        <div className={`p-3 border-b text-xs ${hasErrors ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${hasErrors ? 'text-red-600' : 'text-amber-600'}`} />
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px] mb-1">
                {hasErrors ? 'Input Validation Errors Detected:' : 'Clinical Input Warnings:'}
              </div>
              <ul className="space-y-0.5 list-disc list-inside">
                {validationIssues.map((v, i) => (
                  <li key={i}>{v.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Parameter Groups Form */}
      <div className="p-5 space-y-6">
        {/* Section 1: Demographics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <User className="w-3.5 h-3.5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Demographics & Genetics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {params.age} yrs
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.age.min}
                max={FEATURE_METADATA.age.max}
                value={params.age}
                onChange={(e) => updateField('age', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{FEATURE_METADATA.age.min}y</span>
                <span>{FEATURE_METADATA.age.max}y</span>
              </div>
            </div>

            {/* Sex */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField('sex', 0)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.sex === 0
                      ? 'bg-sky-700 text-white border-sky-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => updateField('sex', 1)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.sex === 1
                      ? 'bg-sky-700 text-white border-sky-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Family History */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Family History of CVD
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField('familyHistory', 0)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.familyHistory === 0
                      ? 'bg-slate-100 text-slate-700 border-slate-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  No History
                </button>
                <button
                  type="button"
                  onClick={() => updateField('familyHistory', 1)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.familyHistory === 1
                      ? 'bg-red-100 text-red-800 border-red-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Yes (&lt;55y 1st-deg)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hemodynamics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-sky-700" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Hemodynamics & Blood Pressure
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Pulse Pressure: {params.systolicBP - params.diastolicBP} mmHg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Systolic BP */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Systolic BP</label>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                  params.systolicBP >= 140 ? 'bg-red-100 text-red-800 border-red-200' :
                  params.systolicBP >= 130 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-white text-slate-900 border-slate-200'
                }`}>
                  {params.systolicBP} mmHg
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.systolicBP.min}
                max={FEATURE_METADATA.systolicBP.max}
                value={params.systolicBP}
                onChange={(e) => updateField('systolicBP', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>80</span>
                <span className="text-emerald-700 font-medium">Opt: 110-120</span>
                <span>240</span>
              </div>
            </div>

            {/* Diastolic BP */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diastolic BP</label>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                  params.diastolicBP >= 90 ? 'bg-red-100 text-red-800 border-red-200' :
                  params.diastolicBP >= 80 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-white text-slate-900 border-slate-200'
                }`}>
                  {params.diastolicBP} mmHg
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.diastolicBP.min}
                max={FEATURE_METADATA.diastolicBP.max}
                value={params.diastolicBP}
                onChange={(e) => updateField('diastolicBP', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50</span>
                <span className="text-emerald-700 font-medium">Opt: 70-80</span>
                <span>140</span>
              </div>
            </div>

            {/* Resting Heart Rate */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Heart Rate</label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {params.restingHeartRate} bpm
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.restingHeartRate.min}
                max={FEATURE_METADATA.restingHeartRate.max}
                value={params.restingHeartRate}
                onChange={(e) => updateField('restingHeartRate', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>40 bpm</span>
                <span>150 bpm</span>
              </div>
            </div>

            {/* Anti-Hypertensive Meds */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                BP Meds Status
              </label>
              <div className="grid grid-cols-2 gap-1.5 my-1">
                <button
                  type="button"
                  onClick={() => updateField('onHypertensionMeds', 0)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.onHypertensionMeds === 0
                      ? 'bg-slate-100 text-slate-700 border-slate-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Untreated
                </button>
                <button
                  type="button"
                  onClick={() => updateField('onHypertensionMeds', 1)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.onHypertensionMeds === 1
                      ? 'bg-sky-700 text-white border-sky-800 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Treated
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Lipid Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-700" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Lipid Panel & Serum Biomarkers (mg/dL)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Non-HDL: {params.totalCholesterol - params.hdlCholesterol} mg/dL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Chol */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Chol</label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {params.totalCholesterol}
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.totalCholesterol.min}
                max={FEATURE_METADATA.totalCholesterol.max}
                value={params.totalCholesterol}
                onChange={(e) => updateField('totalCholesterol', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>100</span>
                <span className="text-emerald-700">&lt;200</span>
                <span>450</span>
              </div>
            </div>

            {/* HDL */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HDL (Good)</label>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {params.hdlCholesterol}
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.hdlCholesterol.min}
                max={FEATURE_METADATA.hdlCholesterol.max}
                value={params.hdlCholesterol}
                onChange={(e) => updateField('hdlCholesterol', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>20</span>
                <span className="text-emerald-700">&gt;50</span>
                <span>100</span>
              </div>
            </div>

            {/* LDL */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LDL (Bad)</label>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                  params.ldlCholesterol >= 160 ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-white text-slate-900 border-slate-200'
                }`}>
                  {params.ldlCholesterol}
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.ldlCholesterol.min}
                max={FEATURE_METADATA.ldlCholesterol.max}
                value={params.ldlCholesterol}
                onChange={(e) => updateField('ldlCholesterol', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>40</span>
                <span className="text-emerald-700">&lt;100</span>
                <span>300</span>
              </div>
            </div>

            {/* Triglycerides */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Triglycerides</label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {params.triglycerides}
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.triglycerides.min}
                max={FEATURE_METADATA.triglycerides.max}
                value={params.triglycerides}
                onChange={(e) => updateField('triglycerides', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>50</span>
                <span className="text-emerald-700">&lt;150</span>
                <span>500</span>
              </div>
            </div>

            {/* Glucose */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Glucose</label>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                  params.fastingBloodGlucose >= 126 ? 'bg-red-100 text-red-800 border-red-200' :
                  params.fastingBloodGlucose >= 100 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-white text-slate-900 border-slate-200'
                }`}>
                  {params.fastingBloodGlucose}
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.fastingBloodGlucose.min}
                max={FEATURE_METADATA.fastingBloodGlucose.max}
                value={params.fastingBloodGlucose}
                onChange={(e) => updateField('fastingBloodGlucose', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>60</span>
                <span className="text-emerald-700">70-99</span>
                <span>350</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Lifestyle & Comorbidities with High Density Badges */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <Flame className="w-3.5 h-3.5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Lifestyle & Metabolic Status
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* BMI */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Body Mass Index</label>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                  params.bmi >= 30 ? 'bg-red-100 text-red-800 border-red-200' :
                  params.bmi >= 25 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {params.bmi} kg/m²
                </span>
              </div>
              <input
                type="range"
                min={FEATURE_METADATA.bmi.min}
                max={FEATURE_METADATA.bmi.max}
                step={0.1}
                value={params.bmi}
                onChange={(e) => updateField('bmi', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15.0</span>
                <span className="text-emerald-700 font-medium">Norm: 18.5-24.9</span>
                <span>55.0</span>
              </div>
            </div>

            {/* Smoking Status */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Smoking Status</label>
                <button
                  type="button"
                  onClick={() => updateField('smokingStatus', params.smokingStatus === 1 ? 0 : 1)}
                  className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider transition-all ${
                    params.smokingStatus === 1
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {params.smokingStatus === 1 ? 'Current Smoker' : 'None / Ex'}
                </button>
              </div>

              {params.smokingStatus === 1 ? (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-0.5">
                    <span>Daily Dose:</span>
                    <span className="font-mono text-slate-900">{params.cigarettesPerDay} cigs/day</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={params.cigarettesPerDay}
                    onChange={(e) => updateField('cigarettesPerDay', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 mt-2 font-medium">
                  0 cigarettes / day (No exposure)
                </div>
              )}
            </div>

            {/* Physical Activity */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Physical Act.</label>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-wider">
                  {params.physicalActivity >= 2 ? 'Regular' : 'Low'}
                </span>
              </div>
              <select
                value={params.physicalActivity}
                onChange={(e) => updateField('physicalActivity', Number(e.target.value))}
                className="w-full bg-white text-slate-800 text-xs font-semibold rounded px-2.5 py-1.5 border border-slate-200 focus:ring-1 focus:ring-sky-600 focus:outline-none mt-1 shadow-xs"
              >
                <option value={0}>Sedentary (&lt;30m/wk)</option>
                <option value={1}>Light (1-2x/wk light)</option>
                <option value={2}>Moderate (150 min/wk)</option>
                <option value={3}>Active (&gt;300 min/wk)</option>
              </select>
            </div>

            {/* Diabetes */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diabetes</label>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                  params.diabetesStatus === 1
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  {params.diabetesStatus === 1 ? 'Positive' : 'Negative'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 my-1">
                <button
                  type="button"
                  onClick={() => updateField('diabetesStatus', 0)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.diabetesStatus === 0
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => updateField('diabetesStatus', 1)}
                  className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                    params.diabetesStatus === 1
                      ? 'bg-red-700 text-white border-red-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Type 1/2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
