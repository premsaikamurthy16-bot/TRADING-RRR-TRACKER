import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { Account, MonthlyGoal } from '../types';
import { formatCurrency, getActiveMonthGoal, getMonthLabel } from '../utils/calculations';

interface MonthManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  availableMonths: string[];
  account: Account | null;
  onSelectMonth: (month: string) => void;
  onAddMonth: (month: string) => void;
  onSaveMonthGoals: (accountId: string, month: string, goals: MonthlyGoal) => void;
  onClearMonthTrades: (accountId: string, month: string) => void;
  onDeleteMonth: (month: string) => void;
}

export const MonthManagementModal: React.FC<MonthManagementModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  availableMonths,
  account,
  onSelectMonth,
  onAddMonth,
  onSaveMonthGoals,
  onClearMonthTrades,
  onDeleteMonth,
}) => {
  const [activeMonth, setActiveMonth] = useState<string>(selectedMonth);
  const [newMonthInput, setNewMonthInput] = useState<string>('2026-11');

  // Goals for active month
  const initialGoals = account ? getActiveMonthGoal(account, activeMonth) : {
    monthlyRTarget: 14,
    monthlyProfitTarget: 490,
    personalProfitGoal: 550,
  };

  const [rTarget, setRTarget] = useState(initialGoals.monthlyRTarget);
  const [profitTarget, setProfitTarget] = useState(initialGoals.monthlyProfitTarget);
  const [personalGoal, setPersonalGoal] = useState(initialGoals.personalProfitGoal);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMonthTabClick = (m: string) => {
    setActiveMonth(m);
    if (account) {
      const g = getActiveMonthGoal(account, m);
      setRTarget(g.monthlyRTarget);
      setProfitTarget(g.monthlyProfitTarget);
      setPersonalGoal(g.personalProfitGoal);
    }
  };

  const handleAddNewMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthInput || availableMonths.includes(newMonthInput)) return;
    onAddMonth(newMonthInput);
    setActiveMonth(newMonthInput);
    setStatusMessage(`Month ${getMonthLabel(newMonthInput)} created!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    const goals: MonthlyGoal = {
      monthlyRTarget: Number(rTarget) || 0,
      monthlyProfitTarget: Number(profitTarget) || 0,
      personalProfitGoal: Number(personalGoal) || 0,
    };
    onSaveMonthGoals(account.id, activeMonth, goals);
    setStatusMessage(`Goals for ${getMonthLabel(activeMonth)} updated!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClearTrades = () => {
    if (!account) return;
    if (confirm(`Are you sure you want to clear all trades for ${getMonthLabel(activeMonth)} in "${account.name}"? Historical trades in other months will NOT be deleted.`)) {
      onClearMonthTrades(account.id, activeMonth);
      setStatusMessage(`Trades for ${getMonthLabel(activeMonth)} cleared.`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Monthly Trackers & Specific Goals
              </h3>
              <p className="text-xs text-slate-400">
                Configure unique R targets and profit goals for each individual month.
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Month Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Month To Configure:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableMonths.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMonthTabClick(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMonth === m
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {getMonthLabel(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Add New Month Form */}
          <form onSubmit={handleAddNewMonth} className="flex items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-300 font-medium">Create New Month:</span>
            <input
              type="month"
              value={newMonthInput}
              onChange={(e) => setNewMonthInput(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Goals for Selected Month */}
          {account ? (
            <form onSubmit={handleSaveGoals} className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-sm text-slate-100">
                  Goals for {getMonthLabel(activeMonth)} ({account.name})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onSelectMonth(activeMonth);
                    onClose();
                  }}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Switch active view to this month
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly R Target
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={rTarget}
                      onChange={(e) => setRTarget(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">R</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Strategy Profit Target ($)
                  </label>
                  <input
                    type="number"
                    value={profitTarget}
                    onChange={(e) => setProfitTarget(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Personal Profit Goal ($)
                  </label>
                  <input
                    type="number"
                    value={personalGoal}
                    onChange={(e) => setPersonalGoal(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-violet-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleClearTrades}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear trades for {getMonthLabel(activeMonth)}</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Save Goals for {getMonthLabel(activeMonth)}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-slate-500">Select an account to configure its monthly goals.</p>
          )}
        </div>
      </div>
    </div>
  );
};
