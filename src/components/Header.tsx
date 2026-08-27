import React from 'react';
import { ModelType } from '../types/cardio';
import { Activity, ShieldAlert, Sparkles, Cpu, Layers, FileCode } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModel,
  onModelChange,
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'prediction', label: 'Inference & SHAP', icon: Activity },
    { id: 'whatif', label: 'What-If Lab', icon: Sparkles },
    { id: 'global_shap', label: 'Global Explainability', icon: Layers },
    { id: 'evaluation', label: 'Model Benchmark & ROC', icon: Cpu },
    { id: 'pipeline', label: 'Dataset & Preprocessing', icon: Layers },
    { id: 'python_code', label: 'Python Modules & Streamlit', icon: FileCode }
  ];

  const modelLabels: Record<ModelType, { name: string; auc: string }> = {
    xgboost: { name: 'Gradient Boost (XGBoost)', auc: '88.7% ROC-AUC' },
    random_forest: { name: 'Random Forest Ensemble', auc: '87.4% ROC-AUC' },
    logistic_regression: { name: 'ElasticNet LogReg', auc: '84.9% ROC-AUC' },
    svm: { name: 'Support Vector Machine', auc: '86.1% ROC-AUC' }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      {/* High Density Clinical Sub-Header Notification */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 py-1.5 text-[11px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Research Prototype:</strong> Multi-parametric ML risk estimation pipeline with SHAP interpretability. Not for clinical diagnosis.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Pipeline ID: CVD-XP-90210
          </span>
          <span>•</span>
          <span>ACC/AHA 10-Yr Framework</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-sky-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden"
          >
            <Activity className="w-6 h-6 text-white" />
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CardioAI Explainer</h1>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded uppercase tracking-wider">
                XAI Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Multi-Parametric Cardiovascular Risk Prediction
            </p>
          </div>
        </div>

        {/* Telemetry Status & Algorithm Switcher */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Model Status</p>
            <motion.p
              key={activeModel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-mono text-emerald-600 font-semibold flex items-center justify-end gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Active • {modelLabels[activeModel]?.name}
            </motion.p>
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden lg:block"></div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Benchmark</p>
            <motion.p
              key={activeModel + '-auc'}
              initial={{ scale: 1.1, color: '#0284c7' }}
              animate={{ scale: 1, color: '#334155' }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono text-slate-700 font-semibold"
            >
              {modelLabels[activeModel]?.auc}
            </motion.p>
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold px-1.5 hidden xl:inline">Model:</span>
            <select
              value={activeModel}
              onChange={(e) => onModelChange(e.target.value as ModelType)}
              className="bg-white text-slate-800 text-xs font-semibold rounded px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 cursor-pointer shadow-xs transition-shadow hover:border-slate-300"
            >
              <option value="xgboost">Gradient Boost (XGBoost) - 88.7% AUC</option>
              <option value="random_forest">Random Forest Ensemble - 87.4% AUC</option>
              <option value="logistic_regression">ElasticNet Logistic Reg - 84.9% AUC</option>
              <option value="svm">Support Vector Machine (RBF) - 86.1% AUC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Spring Animated Underline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto space-x-1 scrollbar-none border-t border-slate-200 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-colors uppercase tracking-wider text-[11px] ${
                isActive
                  ? 'text-sky-700 font-bold bg-sky-50/40'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
