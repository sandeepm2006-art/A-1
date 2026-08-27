import React, { useState } from 'react';
import { PYTHON_MODULES } from '../data/pythonFiles';
import { Code2, Copy, Check, Download, Terminal, FileCode, Play, Sparkles } from 'lucide-react';

export const PythonExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app_streamlit.py');
  const [copied, setCopied] = useState<boolean>(false);

  const activeModule = PYTHON_MODULES.find(m => m.filename === selectedFile) || PYTHON_MODULES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const element = document.createElement('a');
    const file = new Blob([activeModule.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeModule.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold tracking-tight text-white">
              Complete Python & Streamlit Machine Learning Pipeline Code
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Production-grade modular Python implementation with scikit-learn, XGBoost, SHAP, and Streamlit. Ready for local training, evaluation, and interactive dashboard execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeModule.filename}</span>
          </button>
        </div>
      </div>

      {/* Quick Setup CLI Instructions */}
      <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
          <Terminal className="w-3.5 h-3.5" />
          Quickstart Terminal Execution:
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 text-slate-300 space-y-1 select-all overflow-x-auto">
          <div className="text-slate-500"># 1. Install required packages</div>
          <div>pip install -r requirements.txt</div>
          <div className="text-slate-500 mt-2"># 2. Run end-to-end dataset preprocessing, model training & evaluation benchmark</div>
          <div>python train.py</div>
          <div className="text-slate-500 mt-2"># 3. Launch the interactive Streamlit clinical dashboard with real-time SHAP plots</div>
          <div>streamlit run app_streamlit.py</div>
        </div>
      </div>

      {/* File Explorer & Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Sidebar File List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Project Modules ({PYTHON_MODULES.length})
          </div>

          {PYTHON_MODULES.map((mod) => {
            const isSelected = mod.filename === selectedFile;
            return (
              <button
                key={mod.filename}
                onClick={() => setSelectedFile(mod.filename)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-rose-500 text-white font-semibold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate font-mono">{mod.filename}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {activeModule.filename}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                — {activeModule.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Textarea */}
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-all">
            <code>{activeModule.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
