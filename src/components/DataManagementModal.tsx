import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  AlertCircle,
  FileJson,
  ShieldAlert,
} from 'lucide-react';
import { Account, GlobalAppData } from '../types';
import {
  exportAppDataJson,
  exportTradesCsv,
  validateAndParseImport,
} from '../utils/storage';
import { getMonthLabel } from '../utils/calculations';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: GlobalAppData;
  selectedAccount: Account | null;
  onImportSuccess: (importedData: GlobalAppData) => void;
  onClearCurrentMonth: () => void;
  onClearCurrentAccount: () => void;
  onFactoryReset: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  appData,
  selectedAccount,
  onImportSuccess,
  onClearCurrentMonth,
  onClearCurrentAccount,
  onFactoryReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [factoryConfirmInput, setFactoryConfirmInput] = useState<string>('');
  const [showFactoryConfirm, setShowFactoryConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExportJson = () => {
    exportAppDataJson(appData);
    setFeedback({
      type: 'success',
      message: `Exported ${appData.accounts.length} accounts and ${appData.trades.length} trades to JSON backup.`,
    });
  };

  const handleExportCsv = () => {
    exportTradesCsv(appData.trades, appData.accounts);
    setFeedback({
      type: 'success',
      message: `Exported ${appData.trades.length} trade records to CSV.`,
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
        setFeedback({
          type: 'success',
          message: `Successfully restored ${parsed.accounts.length} accounts and ${parsed.trades.length} trades!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Invalid file format. Please upload a valid R:R Tracker JSON file.',
        });
      }
    };
    reader.onerror = () => {
      setFeedback({
        type: 'error',
        message: 'Failed to read file. Please try again.',
      });
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearMonth = () => {
    if (!selectedAccount) return;
    if (confirm(`Clear all trades for ${getMonthLabel(appData.selectedMonth)} in "${selectedAccount.name}"? This only removes this month's trades.`)) {
      onClearCurrentMonth();
      setFeedback({
        type: 'success',
        message: `Cleared trades for ${getMonthLabel(appData.selectedMonth)}.`,
      });
    }
  };

  const handleClearAccount = () => {
    if (!selectedAccount) return;
    if (confirm(`Clear ALL trade data for "${selectedAccount.name}"? The account settings will remain, but its trade history will be wiped.`)) {
      onClearCurrentAccount();
      setFeedback({
        type: 'success',
        message: `Cleared all trades for ${selectedAccount.name}.`,
      });
    }
  };

  const handleFactoryResetConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (factoryConfirmInput.trim().toUpperCase() === 'RESET') {
      onFactoryReset();
      setShowFactoryConfirm(false);
      setFactoryConfirmInput('');
      setFeedback({
        type: 'success',
        message: 'Factory reset complete. All local records wiped.',
      });
      onClose();
    } else {
      setFeedback({
        type: 'error',
        message: 'Confirmation word did not match. Type "RESET" to confirm.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Data Management & Ownership
              </h3>
              <p className="text-xs text-slate-400">
                Full backup, CSV export, selective clears, and factory reset.
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {feedback.type && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Backup & Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* JSON Export */}
            <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export All Data (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Complete database backup including all accounts, monthly goals, and trades.
              </p>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
              >
                Download JSON Backup
              </button>
            </div>

            {/* CSV Export */}
            <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Trades (CSV)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Export trade history for spreadsheet analysis in Excel or Google Sheets.
              </p>
              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
              >
                Download Trades CSV
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Import Data Backup</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Restore your complete trading journal from a previously exported JSON backup.
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
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Select JSON File to Restore
            </button>
          </div>

          {/* Selective Clears (Current Month / Current Account) */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3.5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selective Clear Controls
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleClearMonth}
                disabled={!selectedAccount}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-900/60 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear {getMonthLabel(appData.selectedMonth)}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAccount}
                disabled={!selectedAccount}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-rose-300 border border-rose-900/60 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear {selectedAccount?.name || 'Account'} Trades</span>
              </button>
            </div>
          </div>

          {/* Factory Reset Section */}
          <div className="border border-rose-900/60 bg-rose-950/20 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertOctagon className="w-4 h-4" />
              <span>Factory Reset Application</span>
            </div>
            <p className="text-[11px] text-rose-300/80 leading-relaxed">
              Permanently wipes all accounts, trades, and configuration from browser storage.
            </p>

            {!showFactoryConfirm ? (
              <button
                type="button"
                onClick={() => setShowFactoryConfirm(true)}
                className="w-full py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition-colors"
              >
                Initiate Factory Reset...
              </button>
            ) : (
              <form onSubmit={handleFactoryResetConfirm} className="space-y-2 pt-2 border-t border-rose-900/60">
                <p className="text-xs text-rose-300">
                  Type <strong className="text-white font-mono">RESET</strong> to confirm permanent erasure:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={factoryConfirmInput}
                    onChange={(e) => setFactoryConfirmInput(e.target.value)}
                    placeholder="Type RESET"
                    className="flex-1 bg-slate-950 border border-rose-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFactoryConfirm(false);
                      setFactoryConfirmInput('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
