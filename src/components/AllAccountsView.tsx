import React from 'react';
import {
  Layers,
  ArrowRight,
  Plus,
  Sliders,
  Copy,
  Archive,
  Trash2,
} from 'lucide-react';
import { Account, AccountMonthStats } from '../types';
import {
  formatCurrency,
  formatRR,
  formatSignedCurrency,
  getMonthLabel,
} from '../utils/calculations';

interface AllAccountsViewProps {
  accounts: Account[];
  allStats: AccountMonthStats[];
  selectedMonth: string;
  onSelectAccount: (accountId: string) => void;
  onOpenNewAccountModal: () => void;
  onOpenAccountSettings: (account: Account) => void;
  onDuplicateAccount: (account: Account) => void;
  onToggleArchive: (accountId: string) => void;
  onRequestDeleteAccount: (account: Account) => void;
}

export const AllAccountsView: React.FC<AllAccountsViewProps> = ({
  accounts,
  allStats,
  selectedMonth,
  onSelectAccount,
  onOpenNewAccountModal,
  onOpenAccountSettings,
  onDuplicateAccount,
  onToggleArchive,
  onRequestDeleteAccount,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No accounts created yet.</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create your first trading account to track your risk and performance across portfolios.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewAccountModal}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Account</span>
        </button>
      </div>
    );
  }

  // Summary Metrics
  const totalAccounts = accounts.length;
  const totalPnl = allStats.reduce((sum, s) => sum + s.currentMonthPnl, 0);
  const totalR = allStats.reduce((sum, s) => sum + s.currentMonthR, 0);
  const accountsAtTarget = allStats.filter(
    (s) => s.currentMonthPnl >= s.monthlyProfitTarget && s.monthlyProfitTarget > 0
  ).length;
  const accountsBelowTarget = totalAccounts - accountsAtTarget;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Multi-Account Portfolio Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated performance and target progress across all trading accounts for {getMonthLabel(selectedMonth)}.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewAccountModal}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Add Account</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* TOTAL ACCOUNTS */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Accounts
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {totalAccounts}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Active portfolios
          </div>
        </div>

        {/* TOTAL P&L */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total P&L ({getMonthLabel(selectedMonth).slice(0, 3)})
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              totalPnl > 0
                ? 'text-emerald-400'
                : totalPnl < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {formatSignedCurrency(totalPnl)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Portfolio net profit
          </div>
        </div>

        {/* TOTAL R */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total R Captured
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              totalR > 0
                ? 'text-emerald-400'
                : totalR < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {formatRR(totalR)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Combined R efficiency
          </div>
        </div>

        {/* ACCOUNTS AT TARGET */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Accounts At Target
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {accountsAtTarget}
          </div>
          <div className="mt-2 text-xs text-emerald-400/80">
            Goals fulfilled
          </div>
        </div>

        {/* ACCOUNTS BELOW TARGET */}
        <div className="col-span-2 lg:col-span-1 bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Accounts Below Target
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 font-mono">
            {accountsBelowTarget}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Continue risk plan
          </div>
        </div>
      </div>

      {/* Multi-Account Comparison Table */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm sm:text-base">
            All Accounts Performance Comparison
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {getMonthLabel(selectedMonth)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d18] text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Account</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">Balance</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">Monthly R</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">Monthly P&L</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">R Target</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">R Progress</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-right">Personal Goal</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-center">Status</th>
                <th scope="col" className="px-3.5 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {allStats.map((stat) => {
                const acc = accounts.find((a) => a.id === stat.accountId);
                if (!acc) return null;

                const isPersonalGoalMet = stat.status === 'Personal Goal Achieved';
                const isStrategyTargetMet = stat.status === 'Strategy Target Achieved';
                const isOnTrack = stat.status === 'On Track';

                return (
                  <tr
                    key={stat.accountId}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectAccount(stat.accountId)}
                  >
                    {/* Account */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                          {stat.accountName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Risk: ${stat.riskPerTrade} · Size: {formatCurrency(stat.accountSize)}
                        </span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-3.5 py-3.5 font-mono font-bold text-right text-slate-100 whitespace-nowrap text-sm">
                      {formatCurrency(stat.currentBalance)}
                    </td>

                    {/* Monthly R */}
                    <td
                      className={`px-3.5 py-3.5 font-mono font-bold text-right whitespace-nowrap ${
                        stat.currentMonthR > 0
                          ? 'text-emerald-400'
                          : stat.currentMonthR < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatRR(stat.currentMonthR)}
                    </td>

                    {/* Monthly P&L */}
                    <td
                      className={`px-3.5 py-3.5 font-mono font-bold text-right whitespace-nowrap ${
                        stat.currentMonthPnl > 0
                          ? 'text-emerald-400'
                          : stat.currentMonthPnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatSignedCurrency(stat.currentMonthPnl)}
                    </td>

                    {/* R Target */}
                    <td className="px-3.5 py-3.5 font-mono text-right text-slate-300 whitespace-nowrap">
                      {stat.monthlyRTarget}R
                    </td>

                    {/* R Progress */}
                    <td className="px-3.5 py-3.5 font-mono text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-900 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, stat.rProgressPercent))}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-200">
                          {stat.rProgressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Personal Goal */}
                    <td className="px-3.5 py-3.5 font-mono text-right text-slate-300 whitespace-nowrap">
                      {formatCurrency(stat.personalProfitGoal)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isPersonalGoalMet
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : isStrategyTargetMet
                            ? 'bg-teal-950/80 text-teal-400 border border-teal-500/30'
                            : isOnTrack
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {stat.status}
                      </span>
                    </td>

                    {/* Action buttons (Open, Duplicate, Settings, Delete) */}
                    <td
                      className="px-3.5 py-3.5 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectAccount(stat.accountId)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateAccount(acc)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                          title="Duplicate Account"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAccountSettings(acc)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                          title="Account Settings"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteAccount(acc)}
                          className="p-1 hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-400"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
