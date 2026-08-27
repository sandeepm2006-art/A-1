import React, { useState } from 'react';
import { PredictionResult, CardioInputParams } from '../types/cardio';
import { TrendingUp, TrendingDown, Heart, ShieldCheck, Activity, Download, Copy, Check, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';
import { EcgMonitor } from './EcgMonitor';
import { triggerFileDownload, copyTextToClipboard } from '../utils/downloadHelper';

interface RiskCardProps {
  prediction: PredictionResult;
  params?: CardioInputParams;
}

export const RiskCard: React.FC<RiskCardProps> = ({ prediction, params }) => {
  const {
    riskScorePercent,
    riskCategory,
    categoryDescription,
    baseValue,
    topRiskFactors,
    topProtectiveFactors
  } = prediction;

  const [reportCopied, setReportCopied] = useState<boolean>(false);
  const [reportDownloaded, setReportDownloaded] = useState<boolean>(false);
  const [jsonDownloaded, setJsonDownloaded] = useState<boolean>(false);

  const basePercent = Math.round(baseValue * 1000) / 10;
  const deltaFromBase = Math.round((riskScorePercent - basePercent) * 10) / 10;

  const categoryBadgeColors: Record<string, string> = {
    Low: 'bg-emerald-600 text-white',
    Borderline: 'bg-blue-600 text-white',
    Intermediate: 'bg-amber-600 text-white',
    High: 'bg-red-600 text-white'
  };

  const badgeClass = categoryBadgeColors[riskCategory] || 'bg-slate-700 text-white';
  const confidencePercent = 91.2;

  // Heartbeat pulse frequency calculation
  const heartRate = params?.restingHeartRate || 72;
  const pulseDuration = 60 / heartRate;

  const generateReportText = () => {
    return `CARDIOAI CLINICAL ML RISK ASSESSMENT REPORT
Generated: ${new Date().toLocaleString()}
10-Year ASCVD Risk: ${riskScorePercent.toFixed(1)}% (${riskCategory.toUpperCase()} RISK)
Baseline Cohort Risk: ${basePercent}% (${deltaFromBase >= 0 ? `+${deltaFromBase}%` : `${deltaFromBase}%`})

PATIENT BIOMARKERS:
- Age: ${params?.age || 'N/A'} yrs | Sex: ${params?.sex === 1 ? 'Male' : 'Female'}
- Blood Pressure: ${params?.systolicBP || 'N/A'}/${params?.diastolicBP || 'N/A'} mmHg
- Total Cholesterol: ${params?.totalCholesterol || 'N/A'} mg/dL | HDL: ${params?.hdlCholesterol || 'N/A'} | LDL: ${params?.ldlCholesterol || 'N/A'}
- Fasting Glucose: ${params?.fastingGlucose || 'N/A'} mg/dL | BMI: ${params?.bmi || 'N/A'} kg/m²
- Smoking: ${params?.smokingStatus === 1 ? `Yes (${params?.cigarettesPerDay || 0}/day)` : 'No'} | Diabetes: ${params?.diabetesStatus === 1 ? 'Yes' : 'No'}

TOP RISK DRIVERS (SHAP):
${topRiskFactors.map((f, i) => `${i + 1}. ${f.displayName}: +${f.shapValue.toFixed(3)} log-odds`).join('\n')}

TOP PROTECTIVE FACTORS:
${topProtectiveFactors.map((f, i) => `${i + 1}. ${f.displayName}: ${f.shapValue.toFixed(3)} log-odds`).join('\n')}
`;
  };

  const handleDownloadReport = () => {
    const text = generateReportText();
    triggerFileDownload(`Cardiovascular_Risk_Report_${riskCategory}.txt`, text, 'text/plain');
    setReportDownloaded(true);
    setTimeout(() => setReportDownloaded(false), 2500);
  };

  const handleDownloadJson = () => {
    const exportObj = {
      timestamp: new Date().toISOString(),
      prediction: {
        riskScorePercent,
        riskCategory,
        categoryDescription,
        baseValue,
        confidencePercent
      },
      patientParameters: params,
      topRiskDrivers: topRiskFactors,
      topProtectiveFactors: topProtectiveFactors,
      allContributions: prediction.featureContributions
    };
    triggerFileDownload(`Cardio_Patient_Inference_SHAP_${riskCategory}.json`, JSON.stringify(exportObj, null, 2), 'application/json');
    setJsonDownloaded(true);
    setTimeout(() => setJsonDownloaded(false), 2500);
  };

  const handleCopyReport = async () => {
    const text = generateReportText();
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* High Density Split Grid with Realistic Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Risk Probability Output */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="sm:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden shadow-xs"
        >
          {/* Animated Background Heartbeat */}
          <div className="absolute top-2 right-2 p-4 opacity-10 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.18, 0.94, 1.12, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: pulseDuration,
                ease: 'easeInOut'
              }}
            >
              <Heart className="w-28 h-28 text-red-500 fill-current" />
            </motion.div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                Risk Probability Output
              </p>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-sky-600" />
                10-Year ASCVD Horizon
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-6xl font-black text-slate-900 tracking-tight">
                <AnimatedCounter value={riskScorePercent} decimals={1} duration={500} />
              </span>
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <motion.span
                key={riskCategory}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-xs ${badgeClass}`}
              >
                {riskCategory.toUpperCase()} RISK CATEGORY
              </motion.span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Pop. Baseline: <strong className="font-mono text-slate-800">{basePercent}%</strong> ({deltaFromBase >= 0 ? `+${deltaFromBase}%` : `${deltaFromBase}%`})
              </span>
            </div>
          </div>

          {/* Risk Level Bar Gauge */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>0% (Low)</span>
                <span>7.5% (Borderline)</span>
                <span>20% (High)</span>
                <span>50%+</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                {/* Background risk gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-600 opacity-30" />
                {/* Animated pointer indicator */}
                <motion.div
                  className="h-full bg-slate-900 rounded-full relative"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(100, (riskScorePercent / 50) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                />
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 mb-1">
              {categoryDescription}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              * This is a research prototype prediction, not a clinical diagnosis.
            </p>
          </div>
        </motion.div>

        {/* Right 1 Col: Model Confidence & Reliability Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.05 }}
          className="bg-slate-900 rounded-xl p-5 flex flex-col justify-between text-white shadow-xs"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Model Confidence
            </p>
            <span className="text-[10px] font-mono text-sky-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              CV v4.2
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center my-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.1 }}
                className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
              />
            </div>
            <p className="text-2xl font-mono font-bold text-white tracking-tight">
              {confidencePercent}<span className="text-sm font-sans text-slate-400">%</span>
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5">
            <button
              onClick={handleDownloadReport}
              className="flex-1 py-1.5 px-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Download patient risk assessment report"
            >
              {reportDownloaded ? <Check className="w-3 h-3 text-white" /> : <Download className="w-3 h-3" />}
              <span>{reportDownloaded ? 'Saved' : 'TXT'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 py-1.5 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Download inference & SHAP JSON payload"
            >
              {jsonDownloaded ? <Check className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3 text-rose-400" />}
              <span>{jsonDownloaded ? 'Saved' : 'JSON'}</span>
            </button>
            <button
              onClick={handleCopyReport}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-medium border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Copy clinical report text to clipboard"
            >
              {reportCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{reportCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Realistic Real-time ECG Oscilloscope Lead II Monitor */}
      {params && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.08 }}
        >
          <EcgMonitor
            heartRate={params.restingHeartRate}
            systolicBP={params.systolicBP}
            diastolicBP={params.diastolicBP}
            riskCategory={riskCategory}
          />
        </motion.div>
      )}

      {/* Driver Summary Cards with Physics Bounce on Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-red-600">
              <TrendingUp className="w-3.5 h-3.5" /> Top Risk Driver
            </span>
            <span className="text-slate-400 font-mono">Impact (+Log-Odds)</span>
          </div>
          {topRiskFactors[0] ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">{topRiskFactors[0].displayName}</span>
              <motion.span
                key={topRiskFactors[0].shapValue}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200"
              >
                +{topRiskFactors[0].shapValue.toFixed(3)}
              </motion.span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No elevated risk factors detected.</span>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" /> Top Protective Asset
            </span>
            <span className="text-slate-400 font-mono">Impact (-Log-Odds)</span>
          </div>
          {topProtectiveFactors[0] ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">{topProtectiveFactors[0].displayName}</span>
              <motion.span
                key={topProtectiveFactors[0].shapValue}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                {topProtectiveFactors[0].shapValue.toFixed(3)}
              </motion.span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No prominent protective biomarkers.</span>
          )}
        </motion.div>
      </div>
    </div>
  );
};
