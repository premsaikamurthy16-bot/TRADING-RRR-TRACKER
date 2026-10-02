import React from 'react';
import {
  TrendingUp,
  Target,
  DollarSign,
  Shield,
  Layers,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
  Plus,
  Settings,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Account, AccountMonthStats, CalculatedTrade, Trade } from '../types';
import {
  formatCurrency,
  formatRR,
  formatSignedCurrency,
  getMonthLabel,
} from '../utils/calculations';
import { DisciplineBanner } from './DisciplineBanner';
import { QuickAddTradeBar } from './QuickAddTradeBar';
import { DailyTable } from './DailyTable';

interface AccountViewProps {
  account: Account | null;
  stats: AccountMonthStats | null;
  enrichedTrades: CalculatedTrade[];
  selectedMonth: string;
  onAddTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  onEditTrade: (trade: CalculatedTrade) => void;
  onDuplicateTrade: (trade: CalculatedTrade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onOpenAddModal: () => void;
  onOpenAccountSettings: () => void;
  onOpenManageAccounts: () => void;
  onCreateNewAccount: () => void;
  lastDeletedTrade: Trade | null;
  onUndoDeleteTrade: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  account,
  stats,
  enrichedTrades,
  selectedMonth,
  onAddTrade,
  onEditTrade,
  onDuplicateTrade,
  onDeleteTrade,
  onOpenAddModal,
  onOpenAccountSettings,
  onOpenManageAccounts,
  onCreateNewAccount,
  lastDeletedTrade,
  onUndoDeleteTrade,
}) => {
  // Requirement #4: If user deletes all accounts, show clean empty state
  if (!account || !stats) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No accounts yet.</h2>
          <p className="text-xs text-slate-400 mt-1">
            You have deleted or archived all accounts. Create a new personal trading account to begin tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNewAccount}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Account</span>
        </button>
      </div>
    );
  }

  // Visual bar width clamps
  const rBarWidth = Math.min(100, Math.max(0, stats.rProgressPercent));
  const strategyBarWidth = Math.min(100, Math.max(0, stats.strategyProgressPercent));
  const personalBarWidth = Math.min(100, Math.max(0, stats.personalProgressPercent));

  return (
    <div className="space-y-6">
      {/* Undo Delete Trade Toast (Requirement #13) */}
      {lastDeletedTrade && (
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <span>
              Deleted trade from <strong>{lastDeletedTrade.date}</strong> ({lastDeletedTrade.result} {formatRR(lastDeletedTrade.rr)})
            </span>
          </div>
          <button
            type="button"
            onClick={onUndoDeleteTrade}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Undo
          </button>
        </div>
      )}

      {/* Account Info & Required Visible Dashboard Actions (Requirement #16) */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {account.name}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Risk: ${account.riskPerTrade} / trade
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Standard RR: {account.standardRR}
            </span>
            {account.maxTradesPerDay && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Max: {account.maxTradesPerDay} trades/day
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span>Size: <strong className="text-slate-200 font-mono">{formatCurrency(account.accountSize)}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Starting: <strong className="text-slate-200 font-mono">{formatCurrency(account.startingBalance)}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Existing Buffer: <strong className="text-emerald-400 font-mono">+{formatCurrency(account.existingProfit)}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Target Balance: <strong className="text-indigo-300 font-mono">{formatCurrency(account.targetBalance)}</strong></span>
          </div>
        </div>

        {/* Visible Dashboard Action Buttons (Requirement #16) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add Trade</span>
          </button>

          <button
            type="button"
            onClick={onOpenAccountSettings}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>⚙ Account Settings</span>
          </button>

          <button
            type="button"
            onClick={onOpenManageAccounts}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Accounts</span>
          </button>
        </div>
      </div>

      {/* Discipline Banner */}
      <DisciplineBanner stats={stats} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CURRENT BALANCE */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Current Balance
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(stats.currentBalance)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Base: {formatCurrency(account.startingBalance + account.existingProfit)}</span>
            <span aria-hidden="true">·</span>
            <span className={stats.currentMonthPnl >= 0 ? 'text-emerald-400 font-mono font-semibold' : 'text-rose-400 font-mono font-semibold'}>
              {formatSignedCurrency(stats.currentMonthPnl)}
            </span>
          </div>
        </div>

        {/* CURRENT MONTH R */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Current Month R</span>
            <span className="text-[10px] text-slate-500 font-mono font-normal">Target: {stats.monthlyRTarget}R</span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              stats.currentMonthR > 0
                ? 'text-emerald-400'
                : stats.currentMonthR < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {formatRR(stats.currentMonthR)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Remaining: <strong className="text-slate-200 font-mono">{stats.remainingR}R</strong></span>
            <span aria-hidden="true">·</span>
            <span>{stats.rProgressPercent}% of goal</span>
          </div>
        </div>

        {/* CURRENT MONTH P&L */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Current Month P&L
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              stats.currentMonthPnl > 0
                ? 'text-emerald-400'
                : stats.currentMonthPnl < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {formatSignedCurrency(stats.currentMonthPnl)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Win Rate: <strong className="text-slate-200 font-mono">{stats.winRate}%</strong></span>
            <span aria-hidden="true">·</span>
            <span>{stats.winCount}W - {stats.lossCount}L</span>
          </div>
        </div>

        {/* MONTHLY TARGETS SUMMARY */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Strategy vs Personal
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-200 font-mono mt-0.5">
            {formatCurrency(stats.monthlyProfitTarget)} <span className="text-xs font-normal text-slate-500">/</span> {formatCurrency(stats.personalProfitGoal)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Target Progress: <strong className="text-indigo-300 font-mono">{stats.personalProgressPercent}%</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bars */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Goal Progress & Targets ({getMonthLabel(selectedMonth)})
            </h3>
            <p className="text-xs text-slate-400">
              Real-time progress towards your monthly R, strategy profit, and personal goals.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">
            Monthly Target: {stats.monthlyRTarget}R ({formatCurrency(stats.monthlyProfitTarget)})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Progress Bar 1: R TARGET */}
          <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wide">
                R Target
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {stats.currentMonthR}R / {stats.monthlyRTarget}R
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${rBarWidth}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{stats.rProgressPercent}%</span>
              <span>
                Remaining: <strong className="text-slate-200 font-mono">{stats.remainingR}R</strong>
              </span>
            </div>
          </div>

          {/* Progress Bar 2: STRATEGY PROFIT TARGET */}
          <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wide">
                Strategy Profit Target
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(stats.currentMonthPnl)} / {formatCurrency(stats.monthlyProfitTarget)}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${strategyBarWidth}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{stats.strategyProgressPercent}%</span>
              <span>
                Remaining: <strong className="text-slate-200 font-mono">{formatCurrency(stats.remainingToStrategyTarget)}</strong>
              </span>
            </div>
          </div>

          {/* Progress Bar 3: PERSONAL PROFIT GOAL */}
          <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wide">
                Personal Profit Goal
              </span>
              <span className="font-mono font-bold text-violet-400">
                {formatCurrency(stats.currentMonthPnl)} / {formatCurrency(stats.personalProfitGoal)}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${personalBarWidth}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{stats.personalProgressPercent}%</span>
              <span>
                Remaining: <strong className="text-slate-200 font-mono">{formatCurrency(stats.remainingToPersonalGoal)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Daily Entry Bar */}
      <QuickAddTradeBar
        account={account}
        selectedMonth={selectedMonth}
        onAddTrade={onAddTrade}
      />

      {/* Daily Table */}
      <DailyTable
        trades={enrichedTrades}
        riskPerTrade={account.riskPerTrade}
        onEditTrade={onEditTrade}
        onDuplicateTrade={onDuplicateTrade}
        onDeleteTrade={onDeleteTrade}
        onOpenAddModal={onOpenAddModal}
        accountName={account.name}
        selectedMonth={selectedMonth}
      />
    </div>
  );
};
