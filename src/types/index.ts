export interface MonthlyGoal {
  monthlyRTarget: number;
  monthlyProfitTarget: number;
  personalProfitGoal: number;
  targetBalance?: number;
}

export interface Account {
  id: string;
  name: string;
  accountSize: number;
  startingBalance: number;
  currentBalanceOverride?: number | null; // Optional manual balance adjustment
  existingProfit: number; // profit earned prior to this tracking period
  riskPerTrade: number;
  standardRR: string; // e.g. "1:2"
  monthlyRTarget: number; // default monthly R target
  monthlyProfitTarget: number; // default strategy profit target
  personalProfitGoal: number; // default personal profit goal
  targetBalance: number; // target balance
  maxTradesPerDay?: number;
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
  monthlyGoals?: Record<string, MonthlyGoal>; // YYYY-MM -> custom monthly goals
}

export type TradeResult = 'TP' | 'SL' | 'BE' | 'Partial TP' | 'Runner' | string;
export type TradeDirection = 'Long' | 'Short' | 'None';

export interface Trade {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  day?: string; // Mon, Tue, etc.
  asset?: string; // e.g. EURUSD, NQ, ES, BTC
  direction?: TradeDirection;
  result: TradeResult;
  rr: number; // e.g. 2, 1, -1, 0, 1.5
  risk: number; // Risk in dollars at the time trade was taken
  pnl?: number; // P&L in dollars (calculated or overridden)
  captured: boolean; // YES or NO
  reason: string;
  setup?: string; // e.g. Liquidity sweep, Trend pullback
  session?: string; // London, NY AM, NY PM, Asian
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface CalculatedTrade extends Trade {
  calculatedPnl: number;
  cumulativeR: number;
  cumulativePnl: number;
  goalProgressPercent: number;
}

export interface AccountMonthStats {
  accountId: string;
  accountName: string;
  month: string; // YYYY-MM
  accountSize: number;
  startingBalance: number;
  existingProfit: number;
  riskPerTrade: number;
  currentBalance: number;
  currentMonthR: number;
  currentMonthPnl: number;
  monthlyRTarget: number;
  monthlyProfitTarget: number;
  personalProfitGoal: number;
  targetBalance: number;
  remainingR: number;
  remainingToStrategyTarget: number;
  remainingToPersonalGoal: number;
  rProgressPercent: number;
  strategyProgressPercent: number;
  personalProgressPercent: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  beCount: number;
  winRate: number;
  status: 'Personal Goal Achieved' | 'Strategy Target Achieved' | 'On Track' | 'Behind Target';
}

export interface GlobalAppData {
  accounts: Account[];
  trades: Trade[];
  selectedAccountId: string;
  selectedMonth: string; // YYYY-MM, e.g. '2026-10'
  availableMonths: string[]; // Custom tracked months list
  version: number;
  lastUpdated: string;
}
