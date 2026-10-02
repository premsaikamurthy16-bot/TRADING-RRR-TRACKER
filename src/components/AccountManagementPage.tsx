import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Check,
  RefreshCw,
  Calculator,
  Sliders,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Account } from '../types';
import { formatCurrency } from '../utils/calculations';

interface AccountManagementPageProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onSaveAccount: (account: Account) => void;
  onCreateAccount: (newAccount: Account) => void;
  onDuplicateAccount: (account: Account) => void;
  onToggleArchive: (accountId: string) => void;
  onRequestDeleteAccount: (account: Account) => void;
  onRecalculateHistoricalTrades: (accountId: string, newRisk: number) => void;
  onClose?: () => void;
}

export const AccountManagementPage: React.FC<AccountManagementPageProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onSaveAccount,
  onCreateAccount,
  onDuplicateAccount,
  onToggleArchive,
  onRequestDeleteAccount,
  onRecalculateHistoricalTrades,
}) => {
  const [activeAccount, setActiveAccount] = useState<Account | null>(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;
  });

  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [accountSize, setAccountSize] = useState(5000);
  const [startingBalance, setStartingBalance] = useState(5000);
  const [currentBalanceOverride, setCurrentBalanceOverride] = useState<string>('');
  const [existingProfit, setExistingProfit] = useState(0);
  const [riskPerTrade, setRiskPerTrade] = useState(35);
  const [standardRR, setStandardRR] = useState('1:2');
  const [monthlyRTarget, setMonthlyRTarget] = useState(14);
  const [monthlyProfitTarget, setMonthlyProfitTarget] = useState(490);
  const [personalProfitGoal, setPersonalProfitGoal] = useState(550);
  const [targetBalance, setTargetBalance] = useState(5550);
  const [maxTradesPerDay, setMaxTradesPerDay] = useState(2);
  const [notes, setNotes] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync form with activeAccount
  useEffect(() => {
    if (activeAccount && !isCreatingNew) {
      setName(activeAccount.name);
      setAccountSize(activeAccount.accountSize);
      setStartingBalance(activeAccount.startingBalance);
      setCurrentBalanceOverride(
        activeAccount.currentBalanceOverride !== undefined && activeAccount.currentBalanceOverride !== null
          ? String(activeAccount.currentBalanceOverride)
          : ''
      );
      setExistingProfit(activeAccount.existingProfit);
      setRiskPerTrade(activeAccount.riskPerTrade);
      setStandardRR(activeAccount.standardRR);
      setMonthlyRTarget(activeAccount.monthlyRTarget);
      setMonthlyProfitTarget(activeAccount.monthlyProfitTarget);
      setPersonalProfitGoal(activeAccount.personalProfitGoal);
      setTargetBalance(activeAccount.targetBalance);
      setMaxTradesPerDay(activeAccount.maxTradesPerDay || 2);
      setNotes(activeAccount.notes || '');
    }
  }, [activeAccount, isCreatingNew]);

  // Handle switching accounts
  const handleSelectAccountForEdit = (acc: Account) => {
    setIsCreatingNew(false);
    setActiveAccount(acc);
    onSelectAccount(acc.id);
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setName(`Account ${accounts.length + 1} — $10K`);
    setAccountSize(10000);
    setStartingBalance(10000);
    setCurrentBalanceOverride('');
    setExistingProfit(0);
    setRiskPerTrade(100);
    setStandardRR('1:2');
    setMonthlyRTarget(12);
    setMonthlyProfitTarget(1200);
    setPersonalProfitGoal(1500);
    setTargetBalance(11500);
    setMaxTradesPerDay(2);
    setNotes('');
  };

  const handleResetForm = () => {
    if (activeAccount && !isCreatingNew) {
      setName(activeAccount.name);
      setAccountSize(activeAccount.accountSize);
      setStartingBalance(activeAccount.startingBalance);
      setCurrentBalanceOverride('');
      setExistingProfit(activeAccount.existingProfit);
      setRiskPerTrade(activeAccount.riskPerTrade);
      setStandardRR(activeAccount.standardRR);
      setMonthlyRTarget(activeAccount.monthlyRTarget);
      setMonthlyProfitTarget(activeAccount.monthlyProfitTarget);
      setPersonalProfitGoal(activeAccount.personalProfitGoal);
      setTargetBalance(activeAccount.targetBalance);
      setMaxTradesPerDay(activeAccount.maxTradesPerDay || 2);
      setNotes(activeAccount.notes || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedOverride = currentBalanceOverride.trim() !== '' ? Number(currentBalanceOverride) : null;

    if (isCreatingNew) {
      const newAcc: Account = {
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        accountSize: Number(accountSize) || 0,
        startingBalance: Number(startingBalance) || 0,
        currentBalanceOverride: parsedOverride,
        existingProfit: Number(existingProfit) || 0,
        riskPerTrade: Number(riskPerTrade) || 1,
        standardRR: standardRR.trim() || '1:2',
        monthlyRTarget: Number(monthlyRTarget) || 0,
        monthlyProfitTarget: Number(monthlyProfitTarget) || 0,
        personalProfitGoal: Number(personalProfitGoal) || 0,
        targetBalance: Number(targetBalance) || 0,
        maxTradesPerDay: Number(maxTradesPerDay) || 2,
        notes: notes.trim(),
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      onCreateAccount(newAcc);
      setActiveAccount(newAcc);
      setIsCreatingNew(false);
      setSaveFeedback('New account created successfully!');
    } else if (activeAccount) {
      const updated: Account = {
        ...activeAccount,
        name: name.trim(),
        accountSize: Number(accountSize) || 0,
        startingBalance: Number(startingBalance) || 0,
        currentBalanceOverride: parsedOverride,
        existingProfit: Number(existingProfit) || 0,
        riskPerTrade: Number(riskPerTrade) || 1,
        standardRR: standardRR.trim() || '1:2',
        monthlyRTarget: Number(monthlyRTarget) || 0,
        monthlyProfitTarget: Number(monthlyProfitTarget) || 0,
        personalProfitGoal: Number(personalProfitGoal) || 0,
        targetBalance: Number(targetBalance) || 0,
        maxTradesPerDay: Number(maxTradesPerDay) || 2,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      onSaveAccount(updated);
      setActiveAccount(updated);
      setSaveFeedback('Account settings saved!');
    }

    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const filteredAccounts = accounts.filter((a) => (showArchived ? true : !a.isArchived));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            <span>Account Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete ownership of trading portfolios, risk parameters, rules, and goal targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column Accounts List, Right Column Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Accounts List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Accounts ({accounts.length})
            </span>
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>

          <div className="space-y-2">
            {filteredAccounts.length === 0 ? (
              <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-6 text-center text-slate-500">
                <p className="text-xs font-medium">No accounts in this view.</p>
                <button
                  type="button"
                  onClick={handleStartCreateNew}
                  className="mt-2 text-xs text-indigo-400 hover:underline"
                >
                  + Create Account
                </button>
              </div>
            ) : (
              filteredAccounts.map((acc) => {
                const isSelected = !isCreatingNew && activeAccount?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccountForEdit(acc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/60 shadow-md'
                        : 'bg-[#0e1424] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{acc.name}</span>
                          {acc.isArchived && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Size: <strong className="text-slate-200 font-mono">{formatCurrency(acc.accountSize)}</strong></span>
                          <span>·</span>
                          <span>Risk: <strong className="text-slate-200 font-mono">${acc.riskPerTrade}</strong></span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onDuplicateAccount(acc)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          title="Duplicate Account"
                          aria-label="Duplicate Account"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleArchive(acc.id)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          title={acc.isArchived ? 'Restore Account' : 'Archive Account'}
                          aria-label="Archive or restore account"
                        >
                          {acc.isArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteAccount(acc)}
                          className="p-1.5 hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-400"
                          title="Delete Account Permanently"
                          aria-label="Delete Account Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Complete Editable Parameters Form */}
        <div className="lg:col-span-8 bg-[#0b101c] border border-slate-800 rounded-xl p-6 shadow-xl">
          {saveFeedback && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveFeedback}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h3 className="font-bold text-base text-white">
                {isCreatingNew ? 'Create New Trading Account' : `Edit Account: ${activeAccount?.name || ''}`}
              </h3>
              <p className="text-xs text-slate-400">
                {isCreatingNew
                  ? 'Fill out all fields below to configure your account goals and risk rules.'
                  : 'Modify any parameter below. Changes take effect across all dashboards immediately.'}
              </p>
            </div>

            {!isCreatingNew && activeAccount && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDuplicateAccount(activeAccount)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleArchive(activeAccount.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{activeAccount.isArchived ? 'Restore' : 'Archive'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDeleteAccount(activeAccount)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs text-rose-300 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. $5K Instant, $25K Challenge, Personal Account"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Account Size, Starting Balance, Existing Profit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Current Balance Override (Optional) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Current Balance Override (Optional)
                </label>
                <span className="text-[11px] text-slate-500">
                  Leave blank for auto-calculation
                </span>
              </div>
              <input
                type="number"
                value={currentBalanceOverride}
                onChange={(e) => setCurrentBalanceOverride(e.target.value)}
                placeholder="Leave blank to use: Starting Balance + Existing Profit + Cumulative P&L"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Risk Per Trade & Standard RR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Trades / Day
                </label>
                <input
                  type="number"
                  value={maxTradesPerDay}
                  onChange={(e) => setMaxTradesPerDay(parseInt(e.target.value, 10) || 1)}
                  min="1"
                  max="50"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Historical Risk Recalculation Notice (Requirement #8) */}
            {!isCreatingNew && activeAccount && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Historical Trades Risk Option:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Historical trades normally preserve their original recorded risk (${activeAccount.riskPerTrade}).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Recalculate all historical trades in "${activeAccount.name}" to use current risk of $${riskPerTrade}?`)) {
                      onRecalculateHistoricalTrades(activeAccount.id, riskPerTrade);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                >
                  Recalculate Historical Trades
                </button>
              </div>
            )}

            {/* Monthly Goals (R, Profit, Personal Goal, Target Balance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Monthly Profit Target ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMonthlyProfitTarget(monthlyRTarget * riskPerTrade)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300"
                  >
                    Auto ({monthlyRTarget}R × ${riskPerTrade} = ${monthlyRTarget * riskPerTrade})
                  </button>
                </div>
                <input
                  type="number"
                  value={monthlyProfitTarget}
                  onChange={(e) => setMonthlyProfitTarget(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Personal Profit Goal ($)
                </label>
                <input
                  type="number"
                  value={personalProfitGoal}
                  onChange={(e) => setPersonalProfitGoal(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-violet-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Balance ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTargetBalance(startingBalance + personalProfitGoal)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300"
                  >
                    Auto (${startingBalance + personalProfitGoal})
                  </button>
                </div>
                <input
                  type="number"
                  value={targetBalance}
                  onChange={(e) => setTargetBalance(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Account Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Notes & Rules
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Strict 1:2 execution rule. Never trade high impact news directly."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons: Save Changes, Reset, Delete Account */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {!isCreatingNew && activeAccount ? (
                <button
                  type="button"
                  onClick={() => onRequestDeleteAccount(activeAccount)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {isCreatingNew ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
