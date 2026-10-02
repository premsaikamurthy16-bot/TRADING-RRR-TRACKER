import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Sparkles, Check, HelpCircle } from 'lucide-react';
import { Account } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  selectedAccount: Account;
  onSaveAccount: (account: Account) => void;
  onCreateAccount: (newAccount: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  mode?: 'edit' | 'create';
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  selectedAccount,
  onSaveAccount,
  onCreateAccount,
  onDeleteAccount,
  mode = 'edit',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'create'>(mode);
  const [targetAccountId, setTargetAccountId] = useState<string>(selectedAccount.id);

  // Form State
  const [name, setName] = useState('');
  const [accountSize, setAccountSize] = useState(5000);
  const [startingBalance, setStartingBalance] = useState(5000);
  const [existingProfit, setExistingProfit] = useState(120);
  const [riskPerTrade, setRiskPerTrade] = useState(35);
  const [standardRR, setStandardRR] = useState('1:2');
  const [monthlyRTarget, setMonthlyRTarget] = useState(14);
  const [monthlyProfitTarget, setMonthlyProfitTarget] = useState(490);
  const [personalProfitGoal, setPersonalProfitGoal] = useState(550);
  const [targetBalance, setTargetBalance] = useState(5550);
  const [notes, setNotes] = useState('');

  // When changing account or modal opening
  useEffect(() => {
    setActiveTab(mode);
  }, [mode, isOpen]);

  useEffect(() => {
    const acc = accounts.find((a) => a.id === targetAccountId) || selectedAccount;
    if (activeTab === 'edit' && acc) {
      setName(acc.name);
      setAccountSize(acc.accountSize);
      setStartingBalance(acc.startingBalance);
      setExistingProfit(acc.existingProfit);
      setRiskPerTrade(acc.riskPerTrade);
      setStandardRR(acc.standardRR);
      setMonthlyRTarget(acc.monthlyRTarget);
      setMonthlyProfitTarget(acc.monthlyProfitTarget);
      setPersonalProfitGoal(acc.personalProfitGoal);
      setTargetBalance(acc.targetBalance);
      setNotes(acc.notes || '');
    } else if (activeTab === 'create') {
      const nextNum = accounts.length + 1;
      setName(`Account ${nextNum} — $10K`);
      setAccountSize(10000);
      setStartingBalance(10000);
      setExistingProfit(0);
      setRiskPerTrade(100);
      setStandardRR('1:2');
      setMonthlyRTarget(12);
      setMonthlyProfitTarget(1200);
      setPersonalProfitGoal(1500);
      setTargetBalance(11500);
      setNotes('');
    }
  }, [activeTab, targetAccountId, selectedAccount, isOpen, accounts]);

  if (!isOpen) return null;

  // Auto-calculate helpers
  const handleAutoCalcStrategy = () => {
    const calculated = monthlyRTarget * riskPerTrade;
    setMonthlyProfitTarget(calculated);
  };

  const handleAutoCalcTargetBalance = () => {
    const calculated = startingBalance + personalProfitGoal;
    setTargetBalance(calculated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (activeTab === 'edit') {
      const updated: Account = {
        ...selectedAccount,
        id: targetAccountId,
        name: name.trim(),
        accountSize: Number(accountSize) || 0,
        startingBalance: Number(startingBalance) || 0,
        existingProfit: Number(existingProfit) || 0,
        riskPerTrade: Number(riskPerTrade) || 1,
        standardRR: standardRR.trim() || '1:2',
        monthlyRTarget: Number(monthlyRTarget) || 0,
        monthlyProfitTarget: Number(monthlyProfitTarget) || 0,
        personalProfitGoal: Number(personalProfitGoal) || 0,
        targetBalance: Number(targetBalance) || 0,
        notes: notes.trim(),
        createdAt: selectedAccount.createdAt,
      };
      onSaveAccount(updated);
    } else {
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        name: name.trim(),
        accountSize: Number(accountSize) || 0,
        startingBalance: Number(startingBalance) || 0,
        existingProfit: Number(existingProfit) || 0,
        riskPerTrade: Number(riskPerTrade) || 1,
        standardRR: standardRR.trim() || '1:2',
        monthlyRTarget: Number(monthlyRTarget) || 0,
        monthlyProfitTarget: Number(monthlyProfitTarget) || 0,
        personalProfitGoal: Number(personalProfitGoal) || 0,
        targetBalance: Number(targetBalance) || 0,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      onCreateAccount(newAcc);
    }
    onClose();
  };

  const handleDelete = () => {
    if (accounts.length <= 1) {
      alert('You must have at least one active trading account.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}"? All associated trade records will also be removed.`)) {
      onDeleteAccount(targetAccountId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Mode Tabs */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`text-sm font-bold pb-0.5 border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Edit Account Parameters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`text-sm font-bold pb-0.5 border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Selector if in Edit Tab */}
        {activeTab === 'edit' && (
          <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Select Account:
            </span>
            {accounts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setTargetAccountId(a.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  targetAccountId === a.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. $5K Instant, $50K Funded"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Account Size & Starting Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Size ($)
              </label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Starting Balance ($)
              </label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Existing Profit Buffer ($)
              </label>
              <input
                type="number"
                value={existingProfit}
                onChange={(e) => setExistingProfit(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Risk per trade & Standard RR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Risk Per Trade ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  value={riskPerTrade}
                  onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || 1)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Every +1R captured equals ${riskPerTrade}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard RR Ratio
              </label>
              <input
                type="text"
                value={standardRR}
                onChange={(e) => setStandardRR(e.target.value)}
                placeholder="e.g. 1:2"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Monthly R Target & Strategy Profit Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly R Target (R)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={monthlyRTarget}
                  onChange={(e) => setMonthlyRTarget(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400 pointer-events-none">
                  R
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Strategy Profit Target ($)
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalcStrategy}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  Auto: {monthlyRTarget}R × ${riskPerTrade} (${monthlyRTarget * riskPerTrade})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  value={monthlyProfitTarget}
                  onChange={(e) => setMonthlyProfitTarget(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Profit Goal & Target Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Personal Profit Goal ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  value={personalProfitGoal}
                  onChange={(e) => setPersonalProfitGoal(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-violet-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Target Balance ($)
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalcTargetBalance}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  Auto: ${startingBalance + personalProfitGoal}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  value={targetBalance}
                  onChange={(e) => setTargetBalance(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Strategy Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Strategy Notes / Rules
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strict 1:2 execution rule. Never risk more than 1R per session."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {activeTab === 'edit' && accounts.length > 1 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {activeTab === 'edit' ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
