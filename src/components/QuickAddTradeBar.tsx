import React, { useState, useEffect } from 'react';
import { Plus, Check, DollarSign, Sparkles } from 'lucide-react';
import { Account, Trade } from '../types';
import { formatSignedCurrency, getDayOfWeek } from '../utils/calculations';

interface QuickAddTradeBarProps {
  account: Account;
  selectedMonth: string; // YYYY-MM
  onAddTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
}

const COMMON_REASONS = [
  'Valid setup',
  'Trend continuation',
  'Key level retest',
  'Liquidity sweep',
  'Break of structure',
  'Failed breakout',
  'Choppy market early exit',
  'HTF support bounce',
];

export const QuickAddTradeBar: React.FC<QuickAddTradeBarProps> = ({
  account,
  selectedMonth,
  onAddTrade,
}) => {
  // Generate a default date within selected month
  const getDefaultDate = () => {
    const today = new Date();
    const todayMonth = today.toISOString().slice(0, 7);
    if (todayMonth === selectedMonth) {
      return today.toISOString().slice(0, 10);
    }
    return `${selectedMonth}-01`;
  };

  const [date, setDate] = useState<string>(getDefaultDate());
  const [result, setResult] = useState<string>('TP');
  const [rr, setRr] = useState<number>(2);
  const [captured, setCaptured] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('Valid setup');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Sync date when selected month changes
  useEffect(() => {
    if (!date.startsWith(selectedMonth)) {
      setDate(`${selectedMonth}-01`);
    }
  }, [selectedMonth]);

  // Live calculation of preview P&L
  const previewPnl = captured ? rr * account.riskPerTrade : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onAddTrade({
      accountId: account.id,
      date,
      day: getDayOfWeek(date),
      result: result.trim() || 'TP',
      rr: Number(rr) || 0,
      risk: account.riskPerTrade,
      captured,
      reason: reason.trim() || 'Standard trade',
      asset: 'NQ',
    });

    // Reset with smart next trade defaults
    setReason('Valid setup');
  };

  const handleResultSelect = (res: string) => {
    setResult(res);
    if (res === 'TP') setRr(2);
    else if (res === 'SL') setRr(-1);
    else if (res === 'BE') setRr(0);
  };

  return (
    <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
            Daily Trade Entry — {account.name}
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Risk: <strong className="text-slate-200">${account.riskPerTrade}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Calculated: <strong className={previewPnl > 0 ? 'text-emerald-400 font-mono' : previewPnl < 0 ? 'text-rose-400 font-mono' : 'text-slate-300 font-mono'}>{formatSignedCurrency(previewPnl)}</strong></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Fast Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-center">
          {/* Date */}
          <div className="col-span-2 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Date ({getDayOfWeek(date) || '—'})
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Result */}
          <div className="col-span-2 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Result</label>
            <div className="flex items-center gap-1">
              {['TP', 'SL', 'BE'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleResultSelect(r)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    result === r
                      ? r === 'TP'
                        ? 'bg-emerald-600 text-white'
                        : r === 'SL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* RR Input */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">RR (R)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={rr}
                onChange={(e) => setRr(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="+2"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-slate-500 font-mono pointer-events-none">
                R
              </span>
            </div>
          </div>

          {/* Captured YES/NO */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Captured?</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCaptured(true)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  captured
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setCaptured(false)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  !captured
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Reason */}
          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">Reason</label>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300"
              >
                {isExpanded ? 'Hide suggestions' : 'Suggestions'}
              </button>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Valid setup"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-2 sm:col-span-1 sm:self-end">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/30 active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Quick Reasons:</span>
            {COMMON_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
