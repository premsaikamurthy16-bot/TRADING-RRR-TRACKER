import { Account, AccountMonthStats, CalculatedTrade, MonthlyGoal, Trade } from '../types';

export function getDayOfWeek(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return '';
  } catch {
    return '';
  }
}

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatSignedCurrency(amount: number): string {
  if (amount === 0) return '$0';
  const prefix = amount > 0 ? '+' : '-';
  const absFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return `${prefix}${absFormatted}`;
}

export function formatRR(rr: number): string {
  if (rr === 0) return '0R';
  const prefix = rr > 0 ? '+' : '';
  const formattedNum = Number.isInteger(rr) ? rr.toString() : rr.toFixed(2);
  return `${prefix}${formattedNum}R`;
}

export function formatPercentage(val: number): string {
  if (isNaN(val)) return '0%';
  const rounded = Math.round(val * 10) / 10;
  return `${rounded}%`;
}

/**
 * Resolves the monthly goals for a given account and month.
 * If specific month goals are configured, they take precedence over account defaults.
 */
export function getActiveMonthGoal(account: Account, month: string): MonthlyGoal {
  if (account.monthlyGoals && account.monthlyGoals[month]) {
    return account.monthlyGoals[month];
  }
  return {
    monthlyRTarget: account.monthlyRTarget,
    monthlyProfitTarget: account.monthlyProfitTarget,
    personalProfitGoal: account.personalProfitGoal,
    targetBalance: account.targetBalance,
  };
}

/**
 * Calculates enriched trade records preserving historical trade risk & P&L.
 */
export function calculateEnrichedTrades(
  trades: Trade[],
  account: Account,
  month: string // e.g. "2026-10"
): CalculatedTrade[] {
  const monthGoal = getActiveMonthGoal(account, month);
  const monthTrades = trades.filter((t) => t.accountId === account.id && t.date.startsWith(month));

  // Sort chronologically ascending to compute running cumulatives
  const sorted = [...monthTrades].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.time && b.time && a.time !== b.time) {
      return a.time.localeCompare(b.time);
    }
    return (a.createdAt || 0) - (b.createdAt || 0);
  });

  let runningR = 0;
  let runningPnl = 0;

  const enriched: CalculatedTrade[] = sorted.map((trade) => {
    // Preserve historical trade risk
    const tradeRisk = trade.risk !== undefined && trade.risk > 0 ? trade.risk : account.riskPerTrade;
    // Calculate P&L: if explicit pnl is provided use it, otherwise captured ? rr * tradeRisk : 0
    const calculatedPnl = trade.pnl !== undefined
      ? trade.pnl
      : (trade.captured ? trade.rr * tradeRisk : 0);

    if (trade.captured) {
      runningR += trade.rr;
    }
    runningPnl += calculatedPnl;

    const goalProgressPercent =
      monthGoal.personalProfitGoal > 0 ? (runningPnl / monthGoal.personalProfitGoal) * 100 : 0;

    return {
      ...trade,
      day: trade.day || getDayOfWeek(trade.date),
      risk: tradeRisk,
      calculatedPnl,
      cumulativeR: Math.round(runningR * 100) / 100,
      cumulativePnl: Math.round(runningPnl * 100) / 100,
      goalProgressPercent: Math.round(goalProgressPercent * 10) / 10,
    };
  });

  return enriched;
}

/**
 * Calculates summary stats for an account for the selected month.
 */
export function calculateAccountMonthStats(
  account: Account,
  allTrades: Trade[],
  selectedMonth: string
): AccountMonthStats {
  const monthGoal = getActiveMonthGoal(account, selectedMonth);

  // All trades for this account prior to selected month (preserving historical risk/pnl)
  const priorTrades = allTrades.filter(
    (t) => t.accountId === account.id && t.date.localeCompare(selectedMonth) < 0
  );
  const priorPnl = priorTrades.reduce((sum, t) => {
    const tradeRisk = t.risk !== undefined && t.risk > 0 ? t.risk : account.riskPerTrade;
    const pnl = t.pnl !== undefined ? t.pnl : (t.captured ? t.rr * tradeRisk : 0);
    return sum + pnl;
  }, 0);

  // Trades in selected month
  const monthTrades = allTrades.filter(
    (t) => t.accountId === account.id && t.date.startsWith(selectedMonth)
  );

  let currentMonthR = 0;
  let currentMonthPnl = 0;
  let winCount = 0;
  let lossCount = 0;
  let beCount = 0;

  monthTrades.forEach((t) => {
    const tradeRisk = t.risk !== undefined && t.risk > 0 ? t.risk : account.riskPerTrade;
    const pnl = t.pnl !== undefined ? t.pnl : (t.captured ? t.rr * tradeRisk : 0);

    if (t.captured) {
      currentMonthR += t.rr;
      currentMonthPnl += pnl;
      if (t.rr > 0) winCount++;
      else if (t.rr < 0) lossCount++;
      else beCount++;
    }
  });

  currentMonthR = Math.round(currentMonthR * 100) / 100;
  currentMonthPnl = Math.round(currentMonthPnl * 100) / 100;

  // Current balance computation
  const baseStarting = account.currentBalanceOverride !== undefined && account.currentBalanceOverride !== null
    ? account.currentBalanceOverride
    : account.startingBalance + account.existingProfit;

  const currentBalance = baseStarting + priorPnl + currentMonthPnl;

  const remainingR = Math.max(0, Math.round((monthGoal.monthlyRTarget - currentMonthR) * 100) / 100);
  const remainingToStrategyTarget = Math.max(
    0,
    Math.round((monthGoal.monthlyProfitTarget - currentMonthPnl) * 100) / 100
  );
  const remainingToPersonalGoal = Math.max(
    0,
    Math.round((monthGoal.personalProfitGoal - currentMonthPnl) * 100) / 100
  );

  const rProgressPercent =
    monthGoal.monthlyRTarget > 0 ? (currentMonthR / monthGoal.monthlyRTarget) * 100 : 0;
  const strategyProgressPercent =
    monthGoal.monthlyProfitTarget > 0 ? (currentMonthPnl / monthGoal.monthlyProfitTarget) * 100 : 0;
  const personalProgressPercent =
    monthGoal.personalProfitGoal > 0 ? (currentMonthPnl / monthGoal.personalProfitGoal) * 100 : 0;

  let status: AccountMonthStats['status'] = 'Behind Target';
  if (currentMonthPnl >= monthGoal.personalProfitGoal && monthGoal.personalProfitGoal > 0) {
    status = 'Personal Goal Achieved';
  } else if (currentMonthPnl >= monthGoal.monthlyProfitTarget && monthGoal.monthlyProfitTarget > 0) {
    status = 'Strategy Target Achieved';
  } else if (currentMonthPnl > 0) {
    status = 'On Track';
  } else {
    status = 'Behind Target';
  }

  const capturedTradesCount = winCount + lossCount + beCount;
  const winRate = capturedTradesCount > 0 ? (winCount / capturedTradesCount) * 100 : 0;

  return {
    accountId: account.id,
    accountName: account.name,
    month: selectedMonth,
    accountSize: account.accountSize,
    startingBalance: account.startingBalance,
    existingProfit: account.existingProfit,
    riskPerTrade: account.riskPerTrade,
    currentBalance: Math.round(currentBalance * 100) / 100,
    currentMonthR,
    currentMonthPnl,
    monthlyRTarget: monthGoal.monthlyRTarget,
    monthlyProfitTarget: monthGoal.monthlyProfitTarget,
    personalProfitGoal: monthGoal.personalProfitGoal,
    targetBalance: monthGoal.targetBalance ?? account.targetBalance,
    remainingR,
    remainingToStrategyTarget,
    remainingToPersonalGoal,
    rProgressPercent: Math.round(rProgressPercent * 10) / 10,
    strategyProgressPercent: Math.round(strategyProgressPercent * 10) / 10,
    personalProgressPercent: Math.round(personalProgressPercent * 10) / 10,
    tradesCount: monthTrades.length,
    winCount,
    lossCount,
    beCount,
    winRate: Math.round(winRate * 10) / 10,
    status,
  };
}

export function getMonthLabel(yearMonth: string): string {
  try {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return yearMonth;
  }
}
