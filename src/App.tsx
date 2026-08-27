import React, { useState, useMemo } from 'react';
import { CardioInputParams, ModelType } from './types/cardio';
import { PRESET_PATIENTS, predictCardiovascularRisk, validateCardioInput } from './ml/engine';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { RiskCard } from './components/RiskCard';
import { ShapWaterfall } from './components/ShapWaterfall';
import { ShapForcePlot } from './components/ShapForcePlot';
import { WhatIfCounterfactual } from './components/WhatIfCounterfactual';
import { GlobalExplainability } from './components/GlobalExplainability';
import { ModelEvaluation } from './components/ModelEvaluation';
import { DatasetPipeline } from './components/DatasetPipeline';
import { PythonExportView } from './components/PythonExportView';
import { AiResearchInsight } from './components/AiResearchInsight';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Active ML algorithm selection
  const [activeModel, setActiveModel] = useState<ModelType>('xgboost');

  // Active top-level navigation tab
  const [activeTab, setActiveTab] = useState<string>('prediction');

  // Patient health parameters state (initialized to Marcus - Borderline Risk)
  const [params, setParams] = useState<CardioInputParams>(
    PRESET_PATIENTS[1].params // Marcus
  );

  // Input validation issues
  const validationIssues = useMemo(() => {
    return validateCardioInput(params);
  }, [params]);

  // Model inference & SHAP computation
  const prediction = useMemo(() => {
    return predictCardiovascularRisk(params, activeModel);
  }, [params, activeModel]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#334155] font-sans flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Main Top Header */}
      <Header
        activeModel={activeModel}
        onModelChange={setActiveModel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {/* Tab 1: Real-time Multi-Parametric Inference & Individual SHAP */}
          {activeTab === 'prediction' && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Multi-Parametric Input Form */}
                <div className="lg:col-span-6 space-y-6">
                  <InputForm
                    params={params}
                    onChange={setParams}
                    validationIssues={validationIssues}
                  />
                </div>

                {/* Right Column: Model Inference, Risk Gauge & Explainability */}
                <div className="lg:col-span-6 space-y-6">
                  {/* 10-Yr Risk Gauge & Clinical Classification Card with ECG Monitor */}
                  <RiskCard prediction={prediction} params={params} />

                  {/* SHAP Force Balance Vector */}
                  <ShapForcePlot
                    contributions={prediction.shapContributions}
                    baseValue={prediction.baseValue}
                    finalRiskPercent={prediction.riskScorePercent}
                  />

                  {/* Interactive SHAP Waterfall Plot */}
                  <ShapWaterfall
                    contributions={prediction.shapContributions}
                    baseValue={prediction.baseValue}
                    finalRiskPercent={prediction.riskScorePercent}
                  />

                  {/* AI Clinical Research Synthesis */}
                  <AiResearchInsight prediction={prediction} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: "What-If" Counterfactual Intervention Lab */}
          {activeTab === 'whatif' && (
            <motion.div
              key="whatif"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WhatIfCounterfactual
                originalParams={params}
                originalPrediction={prediction}
              />
            </motion.div>
          )}

          {/* Tab 3: Global Model Explainability (Beeswarm & Feature Importance) */}
          {activeTab === 'global_shap' && (
            <motion.div
              key="global_shap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <GlobalExplainability />
            </motion.div>
          )}

          {/* Tab 4: Multi-Model Benchmark & ROC Evaluation */}
          {activeTab === 'evaluation' && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ModelEvaluation
                activeModel={activeModel}
                onModelSelect={setActiveModel}
              />
            </motion.div>
          )}

          {/* Tab 5: Dataset Exploration & Leakage Prevention Pipeline */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DatasetPipeline />
            </motion.div>
          )}

          {/* Tab 6: Complete Python & Streamlit Code Repository */}
          {activeTab === 'python_code' && (
            <motion.div
              key="python_code"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PythonExportView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* High Density Footer */}
      <footer className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
        <div>Pipeline ID: CVD-XP-90210</div>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <span>Training Set: NHANES & UK Biobank (n=45,000)</span>
          <span>Last Model Update: 12 OCT 2023</span>
          <span>SHAP Kernel: v0.41.0</span>
        </div>
      </footer>
    </div>
  );
}
