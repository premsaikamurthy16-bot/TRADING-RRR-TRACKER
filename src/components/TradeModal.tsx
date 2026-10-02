import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Sparkles } from 'lucide-react';
import { Account, CalculatedTrade, Trade, TradeDirection } from '../types';
import { formatSignedCurrency, getDayOfWeek } from '../utils/calculations';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeData: Omit<Trade, 'id' | 'createdAt'>, tradeId?: string) => void;
  account: Account;
  initialTrade?: CalculatedTrade | null;
  selectedMonth: string;
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

const COMMON_SETUPS = [
  'Liquidity Sweep & Reversal',
  'Trend Pullback (Fib 61.8)',
  'Order Block Retest',
  'Fair Value Gap (FVG)',
  'Breakout & Retest',
  'Range Bound Fade',
];

const COMMON_SESSIONS = ['London', 'NY AM', 'NY PM', 'Asian'];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  account,
  initialTrade,
  selectedMonth,
}) => {
  const [date, setDate] = useState<string>(`${selectedMonth}-01`);
  const [time, setTime] = useState<string>('09:30');
  const [asset, setAsset] = useState<string>('NQ');
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [result, setResult] = useState<string>('TP');
  const [rr, setRr] = useState<number>(2);
  const [risk, setRisk] = useState<number>(account.riskPerTrade);
  const [customPnl, setCustomPnl] = useState<string>('');
  const [captured, setCaptured] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('Valid setup');
  const [setup, setSetup] = useState<string>('Liquidity sweep & retest');
  const [session, setSession] = useState<string>('NY AM');
  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialTrade) {
      setDate(initialTrade.date);
      setTime(initialTrade.time || '09:30');
      setAsset(initialTrade.asset || 'NQ');
      setDirection(initialTrade.direction || 'Long');
      setResult(initialTrade.result);
      setRr(initialTrade.rr);
      setRisk(initialTrade.risk !== undefined ? initialTrade.risk : account.riskPerTrade);
      setCustomPnl(initialTrade.pnl !== undefined ? String(initialTrade.pnl) : '');
      setCaptured(initialTrade.captured);
      setReason(initialTrade.reason || 'Valid setup');
      setSetup(initialTrade.setup || '');
      setSession(initialTrade.session || 'NY AM');
      setEntry(initialTrade.entry !== undefined ? String(initialTrade.entry) : '');
      setStopLoss(initialTrade.stopLoss !== undefined ? String(initialTrade.stopLoss) : '');
      setTakeProfit(initialTrade.takeProfit !== undefined ? String(initialTrade.takeProfit) : '');
      setNotes(initialTrade.notes || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const initialDate = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
      setDate(initialDate);
      setTime('09:30');
      setAsset('NQ');
      setDirection('Long');
      setResult('TP');
      setRr(2);
      setRisk(account.riskPerTrade);
      setCustomPnl('');
      setCaptured(true);
      setReason('Valid setup');
      setSetup('Liquidity sweep & retest');
      setSession('NY AM');
      setEntry('');
      setStopLoss('');
      setTakeProfit('');
      setNotes('');
    }
  }, [initialTrade, isOpen, selectedMonth, account]);

  if (!isOpen) return null;

  // Auto-calculated P&L preview
  const autoCalculatedPnl = captured ? rr * risk : 0;
  const effectivePnl = customPnl.trim() !== '' ? Number(customPnl) : autoCalculatedPnl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        accountId: account.id,
        date,
        time,
        day: getDayOfWeek(date),
        asset: asset.trim().toUpperCase() || 'NQ',
        direction,
        result: result.trim() || 'TP',
        rr: Number(rr) || 0,
        risk: Number(risk) || account.riskPerTrade,
        pnl: customPnl.trim() !== '' ? Number(customPnl) : undefined,
        captured,
        reason: reason.trim() || 'Standard trade',
        setup: setup.trim(),
        session: session.trim(),
        entry: entry.trim() !== '' ? Number(entry) : undefined,
        stopLoss: stopLoss.trim() !== '' ? Number(stopLoss) : undefined,
        takeProfit: takeProfit.trim() !== '' ? Number(takeProfit) : undefined,
        notes: notes.trim(),
      },
      initialTrade?.id
    );
    onClose();
  };

  const handleResultPreset = (res: string) => {
    setResult(res);
    if (res === 'TP') setRr(2);
    else if (res === 'SL') setRr(-1);
    else if (res === 'BE') setRr(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {initialTrade ? 'Edit Trade Entry' : 'Log New Daily Trade'}
            </h3>
            <p className="text-xs text-slate-400">
              Account: <span className="text-indigo-400 font-semibold">{account.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Row 1: Date, Time, Asset, Direction */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date ({getDayOfWeek(date) || '—'})
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Asset
              </label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="e.g. NQ, ES, EURUSD"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-slate-100 uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Direction
              </label>
              <div className="flex gap-1 h-[36px]">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    direction === 'Long'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    direction === 'Short'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Short
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Result, RR, Risk, Captured */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Result Type
              </label>
              <div className="flex gap-1 mb-1">
                {['TP', 'SL', 'BE'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleResultPreset(r)}
                    className={`flex-1 py-1 rounded text-xs font-semibold ${
                      result === r
                        ? r === 'TP'
                          ? 'bg-emerald-600 text-white'
                          : r === 'SL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Or custom result"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                RR Multiple
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={rr}
                  onChange={(e) => setRr(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">R</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Risk For This Trade ($)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  value={risk}
                  onChange={(e) => setRisk(parseFloat(e.target.value) || 1)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Captured?
              </label>
              <div className="flex gap-1 h-[36px]">
                <button
                  type="button"
                  onClick={() => setCaptured(true)}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    captured ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setCaptured(false)}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    !captured ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: P&L & Override */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <span className="text-xs text-slate-400">
                Auto Calculated P&L ({rr}R × ${risk}):
              </span>
              <div
                className={`font-mono font-bold text-lg ${
                  autoCalculatedPnl > 0
                    ? 'text-emerald-400'
                    : autoCalculatedPnl < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {formatSignedCurrency(autoCalculatedPnl)}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Custom P&L Override ($)
                </label>
                <span className="text-[10px] text-slate-500">Optional</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={customPnl}
                onChange={(e) => setCustomPnl(e.target.value)}
                placeholder="Leave blank to use auto P&L"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Row 4: Reason, Setup, Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Valid setup"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Setup Model
              </label>
              <input
                type="text"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                placeholder="e.g. Liquidity sweep"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
              >
                {COMMON_SESSIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Entry, Stop Loss, Take Profit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="e.g. 20450"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="e.g. 20420"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="e.g. 20510"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Trade Notes & Execution Review
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good patience on pullback. Resisted entering early."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
            >
              {initialTrade ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
