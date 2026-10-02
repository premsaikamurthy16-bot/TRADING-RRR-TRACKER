import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { GlobalAppData } from '../types';
import { exportAppDataJson, validateAndParseImport } from '../utils/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: GlobalAppData;
  onImportSuccess: (importedData: GlobalAppData) => void;
  onResetDemo: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  appData,
  onImportSuccess,
  onResetDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleExport = () => {
    exportAppDataJson(appData);
    setImportStatus({
      type: 'success',
      message: `Successfully exported ${appData.accounts.length} accounts and ${appData.trades.length} trades!`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = validateAndParseImport(content);

      if (parsed) {
        onImportSuccess(parsed);
        setImportStatus({
          type: 'success',
          message: `Successfully restored ${parsed.accounts.length} accounts and ${parsed.trades.length} trades!`,
        });
      } else {
        setImportStatus({
          type: 'error',
          message: 'Invalid file format. Please upload a valid R:R Tracker JSON backup file.',
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Failed to read file. Please try again.',
      });
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the default demo accounts ($5K Instant, $25K Evaluation, $50K Funded, $100K Apex)? All custom changes will be overwritten.')) {
      onResetDemo();
      setImportStatus({
        type: 'success',
        message: 'Demo accounts restored successfully.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Backup & Data Management
              </h3>
              <p className="text-xs text-slate-400">
                Export and import your entire multi-account trading journal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Alert */}
          {importStatus.type && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Current Storage Snapshot */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Accounts:</span>
              <span className="font-mono font-bold text-slate-100">{appData.accounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Recorded Trades:</span>
              <span className="font-mono font-bold text-slate-100">{appData.trades.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Local Persistence:</span>
              <span className="font-medium text-emerald-400">Active (Auto-Saved)</span>
            </div>
          </div>

          {/* Export Section */}
          <div className="border border-slate-800 rounded-xl p-4 bg-[#0a0f1c] space-y-2">
            <div className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Tracker Backup</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download your complete accounts, trades, risk rules, and monthly performance as a JSON file to your device.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="mt-1 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data (JSON)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="border border-slate-800 rounded-xl p-4 bg-[#0a0f1c] space-y-2">
            <div className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Tracker Backup</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore previously exported accounts and trades from a JSON file.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select File to Import</span>
            </button>
          </div>

          {/* Reset Demo Section */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Demo Accounts</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
