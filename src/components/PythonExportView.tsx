import React, { useState } from 'react';
import { PYTHON_MODULES } from '../data/pythonFiles';
import { PRESET_SAMPLE_DATASET_CSV } from '../data/sampleDatasetCsv';
import { copyTextToClipboard, triggerFileDownload, downloadProjectZipArchive } from '../utils/downloadHelper';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Archive,
  Database,
  ExternalLink,
  Info,
  Maximize2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PythonExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app_streamlit.py');
  const [selectedOs, setSelectedOs] = useState<'powershell' | 'windows_cmd' | 'unix'>('powershell');
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isRawModalOpen, setIsRawModalOpen] = useState<boolean>(false);

  const activeModule = PYTHON_MODULES.find((m) => m.filename === selectedFile) || PYTHON_MODULES[0];

  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(activeModule.code);
    if (ok) {
      showToast('success', `Copied ${activeModule.filename} code to clipboard!`);
    } else {
      showToast('error', `Clipboard permission denied. Use 'View Raw' to select and copy text directly.`);
    }
  };

  const handleDownloadSingle = () => {
    showToast('info', `Initiating download for ${activeModule.filename}...`);

    // Primary: Direct server route
    const serverUrl = `/api/download/file/${encodeURIComponent(activeModule.filename)}`;
    try {
      const a = document.createElement('a');
      a.href = serverUrl;
      a.download = activeModule.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_err) {
      // Fallback
    }

    // Secondary client blob fallback
    const ok = triggerFileDownload(activeModule.filename, activeModule.code, 'text/plain');
    if (ok) {
      setTimeout(() => {
        showToast('success', `Downloaded ${activeModule.filename} successfully!`);
      }, 500);
    } else {
      showToast('error', `Download was blocked by browser sandbox. Click 'View Raw' to copy code directly.`);
    }
  };

  const handleDownloadDataset = () => {
    showToast('info', `Downloading synthetic cardiovascular cohort dataset (CSV)...`);
    const serverUrl = `/api/download/dataset.csv`;
    try {
      const a = document.createElement('a');
      a.href = serverUrl;
      a.download = 'cardiovascular_dataset_sample.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_err) {
      // Fallback
    }

    triggerFileDownload('cardiovascular_dataset_sample.csv', PRESET_SAMPLE_DATASET_CSV, 'text/csv');
    setTimeout(() => {
      showToast('success', `Downloaded cardiovascular_dataset_sample.csv!`);
    }, 500);
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    showToast('info', 'Packaging all Python modules, requirements, and dataset into ZIP archive...');

    try {
      // Try direct server ZIP endpoint first
      const serverZipUrl = '/api/download/zip';
      const a = document.createElement('a');
      a.href = serverZipUrl;
      a.download = 'CardioAI_Explainable_ML_Pipeline.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Also execute client-side JSZip fallback
      const ok = await downloadProjectZipArchive();
      if (ok) {
        showToast('success', 'Complete project ZIP bundle downloaded successfully!');
      } else {
        showToast('error', 'Browser blocked archive download. You can download or copy individual files below.');
      }
    } catch (err) {
      console.error('ZIP error:', err);
      showToast('error', 'Could not generate ZIP archive in current environment.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
                : toastMsg.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-700'
                : 'bg-sky-950 text-sky-100 border-sky-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{toastMsg.text}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-white ml-3 p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Quick Action Center */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold tracking-tight text-white">
              Complete Python & Streamlit Machine Learning Pipeline Code
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Production-grade modular Python implementation with Scikit-Learn, XGBoost, SHAP, and Streamlit. Ready for local training, evaluation, and interactive dashboard execution.
          </p>
        </div>

        {/* Global Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Complete ZIP */}
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download full project repository as a .ZIP archive"
          >
            {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
            <span>Download All (.ZIP)</span>
          </button>

          {/* Download Sample Dataset */}
          <button
            onClick={handleDownloadDataset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Download synthetic cohort CSV dataset"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Dataset (.CSV)</span>
          </button>

          {/* Copy Active File */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Copy current module code to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copy File</span>
          </button>

          {/* Download Active File */}
          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            title={`Download ${activeModule.filename}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Quick Setup CLI Instructions & OS Switcher */}
      <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
            <Terminal className="w-4 h-4" />
            <span>Terminal Setup & Execution Commands</span>
          </div>

          {/* OS Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setSelectedOs('powershell')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                selectedOs === 'powershell'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows PowerShell
            </button>
            <button
              onClick={() => setSelectedOs('windows_cmd')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                selectedOs === 'windows_cmd'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows CMD
            </button>
            <button
              onClick={() => setSelectedOs('unix')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                selectedOs === 'unix'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              macOS / Linux (Bash)
            </button>
          </div>
        </div>

        {/* Selected OS Code Block */}
        {selectedOs === 'powershell' && (
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 text-slate-300 space-y-2 select-all overflow-x-auto">
            <div className="text-slate-500 font-sans text-[11px]"># Step 1: Install dependencies using Python module runner</div>
            <div className="text-emerald-400 font-mono">python -m pip install -r requirements.txt</div>

            <div className="text-slate-500 font-sans text-[11px] mt-2"># Step 2: Train ML models & verify cross-validation metrics</div>
            <div className="text-emerald-400 font-mono">python train.py</div>

            <div className="text-slate-500 font-sans text-[11px] mt-2 flex items-center justify-between">
              <span># Step 3: Launch Streamlit (Direct Python module runner — avoids 'streamlit is not recognized' error!)</span>
            </div>
            <div className="text-amber-300 font-bold font-mono bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
              python -m streamlit run app_streamlit.py
            </div>
          </div>
        )}

        {selectedOs === 'windows_cmd' && (
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 text-slate-300 space-y-2 select-all overflow-x-auto">
            <div className="text-slate-500 font-sans text-[11px]"># Option 1: Double click 'run_pipeline.bat' in the downloaded folder</div>
            <div className="text-slate-500 font-sans text-[11px] mt-1"># Option 2: Run in Command Prompt (cmd.exe):</div>
            <div className="text-emerald-400 font-mono">python -m pip install -r requirements.txt</div>
            <div className="text-emerald-400 font-mono">python train.py</div>
            <div className="text-amber-300 font-bold font-mono bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
              python -m streamlit run app_streamlit.py
            </div>
          </div>
        )}

        {selectedOs === 'unix' && (
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 text-slate-300 space-y-2 select-all overflow-x-auto">
            <div className="text-slate-500 font-sans text-[11px]"># Option 1: Run automated bash script</div>
            <div className="text-emerald-400 font-mono">bash run_pipeline.sh</div>
            <div className="text-slate-500 font-sans text-[11px] mt-2"># Option 2: Step-by-step terminal execution:</div>
            <div className="text-emerald-400 font-mono">python3 -m venv venv && source venv/bin/activate</div>
            <div className="text-emerald-400 font-mono">pip install -r requirements.txt</div>
            <div className="text-emerald-400 font-mono">python train.py</div>
            <div className="text-emerald-400 font-mono">python3 -m streamlit run app_streamlit.py</div>
          </div>
        )}

        {/* Dedicated Troubleshooting Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTroubleshoot(!showTroubleshoot)}>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-[11px] font-sans">
              <Info className="w-3.5 h-3.5" />
              <span>Fix: "The term 'streamlit' is not recognized as the name of a cmdlet..."</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans hover:text-slate-200">
              {showTroubleshoot ? 'Hide ▲' : 'Show Solution ▼'}
            </span>
          </div>

          {showTroubleshoot && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 text-slate-300 font-sans text-[11px]">
              <p>
                <strong>Why this occurs on Windows:</strong> The <code className="bg-slate-950 text-rose-300 px-1.5 py-0.5 rounded font-mono text-[10px]">streamlit.exe</code> binary was installed in Python's local Scripts directory, which is not registered in Windows' global system PATH.
              </p>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400"># Solution: Execute directly via Python's module launcher flag:</div>
                <div className="text-emerald-400 font-bold select-all">python -m streamlit run app_streamlit.py</div>
                <div className="text-slate-500 text-[10px] mt-1 font-sans">
                  (Or with py launcher: <code className="text-amber-300 font-mono">py -m streamlit run app_streamlit.py</code>)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Explorer & Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Sidebar File List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Project Modules ({PYTHON_MODULES.length})</span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">Ready</span>
          </div>

          {PYTHON_MODULES.map((mod) => {
            const isSelected = mod.filename === selectedFile;
            return (
              <button
                key={mod.filename}
                onClick={() => setSelectedFile(mod.filename)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
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

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={handleDownloadDataset}
              className="w-full text-left p-2.5 rounded-xl text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4 text-sky-600" />
              <div className="truncate">
                <div className="font-semibold font-mono">cardiovascular_dataset.csv</div>
                <div className="text-[10px] text-sky-600/80">Synthetic Cohort (4,240 rows)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          {/* File Header Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {activeModule.filename}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                — {activeModule.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Raw View Modal Trigger */}
              <button
                onClick={() => setIsRawModalOpen(true)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors px-2 py-1 bg-slate-800/80 rounded-md border border-slate-700 cursor-pointer"
                title="Open fullscreen raw text view for easy selection"
              >
                <Maximize2 className="w-3 h-3" />
                <span>View Raw</span>
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono transition-colors px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-amber-400" />
                <span>Copy</span>
              </button>

              {/* Direct Download Button */}
              <button
                onClick={handleDownloadSingle}
                className="text-xs text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1 font-mono transition-colors px-2.5 py-1 rounded-md font-semibold cursor-pointer shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Textarea / Display */}
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-all">
            <code>{activeModule.code}</code>
          </pre>
        </div>
      </div>

      {/* Raw Code Modal (Guaranteed Zero-Friction Copy & Inspection) */}
      <AnimatePresence>
        {isRawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-rose-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">
                    Raw File: {activeModule.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={handleDownloadSingle}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-xs text-white font-mono rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setIsRawModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-auto flex-1 bg-slate-900">
                <textarea
                  readOnly
                  value={activeModule.code}
                  onFocus={(e) => e.target.select()}
                  className="w-full h-full min-h-[450px] font-mono text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Click inside the text area to automatically select all code.</span>
                <span className="font-mono">{activeModule.code.split('\n').length} lines</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

