import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Account } from '../types';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onConfirmDelete: (accountId: string) => void;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  account,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0f1524] border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Delete this account permanently?
            </h3>
            <p className="text-xs text-rose-300/80">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Account Name:</span>
            <span className="font-bold text-slate-100">{account.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Account Size:</span>
            <span className="font-mono text-slate-200">${account.accountSize.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Risk Setting:</span>
            <span className="font-mono text-slate-200">${account.riskPerTrade} / trade</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Deleting this account will remove all its recorded trade entries and monthly targets. Other accounts will remain completely untouched.
        </p>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(account.id);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/40 active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
