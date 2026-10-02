import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { AccountMonthStats } from '../types';

interface DisciplineBannerProps {
  stats: AccountMonthStats;
}

export const DisciplineBanner: React.FC<DisciplineBannerProps> = ({ stats }) => {
  const isPersonalGoalMet = stats.currentMonthPnl >= stats.personalProfitGoal && stats.personalProfitGoal > 0;
  const isStrategyTargetMet = stats.currentMonthPnl >= stats.monthlyProfitTarget && stats.monthlyProfitTarget > 0;

  if (isPersonalGoalMet) {
    return (
      <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3.5 sm:p-4 flex items-center justify-between gap-3 text-emerald-200 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-emerald-100 flex items-center gap-2">
              <span>Personal Goal Achieved ✓</span>
            </div>
            <p className="text-xs text-emerald-300/80">
              Outstanding execution! You reached your personal profit goal ({stats.personalProgressPercent}% achieved). Protect your capital and honor your monthly plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isStrategyTargetMet) {
    return (
      <div className="rounded-xl bg-teal-950/40 border border-teal-500/40 p-3.5 sm:p-4 flex items-center justify-between gap-3 text-teal-200 shadow-lg shadow-teal-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-teal-100 flex items-center gap-2">
              <span>Strategy Target Achieved ✓</span>
            </div>
            <p className="text-xs text-teal-300/80">
              Strategy milestone reached ({stats.strategyProgressPercent}%). Your edge is performing. Next milestone: Personal Profit Goal ({stats.remainingToPersonalGoal > 0 ? `$${stats.remainingToPersonalGoal} remaining` : 'Done'}).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Section 11 requirement:
  // "If I am behind target, simply show: 'Behind Target — Continue Following Your Risk Plan.'"
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 flex items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold text-xs sm:text-sm text-slate-200">
            Behind Target — Continue Following Your Risk Plan.
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Do not inflate risk or force trades to make up R. Strict discipline preserves your edge.
          </span>
        </div>
      </div>
      <div className="text-[11px] font-mono text-slate-400 shrink-0">
        Risk: ${stats.riskPerTrade} / trade
      </div>
    </div>
  );
};
