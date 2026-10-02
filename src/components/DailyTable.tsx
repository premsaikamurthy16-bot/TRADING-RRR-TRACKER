import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Copy,
  Search,
  ArrowUpDown,
  Plus,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { CalculatedTrade } from '../types';
import { formatCurrency, formatRR, formatSignedCurrency } from '../utils/calculations';

interface DailyTableProps {
  trades: CalculatedTrade[];
  riskPerTrade: number;
  onEditTrade: (trade: CalculatedTrade) => void;
  onDuplicateTrade: (trade: CalculatedTrade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onOpenAddModal: () => void;
  accountName: string;
  selectedMonth: string;
}

export const DailyTable: React.FC<DailyTableProps> = ({
  trades,
  riskPerTrade,
  onEditTrade,
  onDuplicateTrade,
  onDeleteTrade,
  onOpenAddModal,
  accountName,
  selectedMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [showExtendedColumns, setShowExtendedColumns] = useState<boolean>(false);

  // Filter trades
  const filtered = trades.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (t.reason && t.reason.toLowerCase().includes(term)) ||
      (t.date && t.date.includes(term)) ||
      (t.result && t.result.toLowerCase().includes(term)) ||
      (t.asset && t.asset.toLowerCase().includes(term)) ||
      (t.setup && t.setup.toLowerCase().includes(term));

    const matchesResult =
      resultFilter === 'all'
        ? true
        : resultFilter === 'TP'
        ? t.result.toUpperCase().includes('TP') || t.rr > 0
        : resultFilter === 'SL'
        ? t.result.toUpperCase().includes('SL') || t.rr < 0
        : t.result.toUpperCase() === 'BE' || t.rr === 0;

    return matchesSearch && matchesResult;
  });

  // Sort display
  const displayTrades = [...filtered].sort((a, b) => {
    const diff = a.date.localeCompare(b.date);
    if (diff !== 0) return sortAsc ? diff : -diff;
    if (a.time && b.time && a.time !== b.time) {
      return sortAsc ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
    }
    return sortAsc ? (a.createdAt || 0) - (b.createdAt || 0) : (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Totals
  const totalR = trades.reduce((sum, t) => sum + (t.captured ? t.rr : 0), 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.calculatedPnl, 0);

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <span>Daily Trading Log</span>
            <span className="text-xs font-normal text-slate-400">
              ({trades.length} entries in {selectedMonth})
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-calculates R, P&L, running cumulative balance, and goal progression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search trade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700/80 p-0.5 text-xs">
            {['all', 'TP', 'SL', 'BE'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResultFilter(r)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  resultFilter === r
                    ? r === 'TP'
                      ? 'bg-emerald-600 text-white'
                      : r === 'SL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Extended columns toggle */}
          <button
            type="button"
            onClick={() => setShowExtendedColumns(!showExtendedColumns)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              showExtendedColumns
                ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle extra columns (Asset, Direction, Setup, Session)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </button>

          {/* Sort direction */}
          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 text-xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortAsc ? 'Oldest' : 'Newest'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Trade</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#090d18] text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-3.5 py-3 font-semibold">Date</th>
              <th scope="col" className="px-2 py-3 font-semibold">Day</th>
              {showExtendedColumns && (
                <>
                  <th scope="col" className="px-2.5 py-3 font-semibold">Asset</th>
                  <th scope="col" className="px-2.5 py-3 font-semibold">Dir</th>
                </>
              )}
              <th scope="col" className="px-3 py-3 font-semibold">Result</th>
              <th scope="col" className="px-3 py-3 font-semibold text-right">RR</th>
              <th scope="col" className="px-2.5 py-3 font-semibold text-center">Captured</th>
              {showExtendedColumns && (
                <th scope="col" className="px-3 py-3 font-semibold">Setup</th>
              )}
              <th scope="col" className="px-3.5 py-3 font-semibold">Reason</th>
              <th scope="col" className="px-3 py-3 font-semibold text-right">Risk</th>
              <th scope="col" className="px-3.5 py-3 font-semibold text-right">P&L</th>
              <th scope="col" className="px-3.5 py-3 font-semibold text-right">Cum. R</th>
              <th scope="col" className="px-3.5 py-3 font-semibold text-right">Cum. P&L</th>
              <th scope="col" className="px-3 py-3 font-semibold text-right">Goal %</th>
              <th scope="col" className="px-3 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {displayTrades.length === 0 ? (
              <tr>
                <td colSpan={showExtendedColumns ? 15 : 12} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium text-slate-400">No trades recorded for this period</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "+ Add Trade" or use the fast daily entry bar above.
                  </p>
                </td>
              </tr>
            ) : (
              displayTrades.map((trade) => {
                const isTp = trade.result.toUpperCase().includes('TP') || trade.rr > 0;
                const isSl = trade.result.toUpperCase().includes('SL') || trade.rr < 0;
                const isPositivePnl = trade.calculatedPnl > 0;
                const isNegativePnl = trade.calculatedPnl < 0;

                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="px-3.5 py-3 font-mono font-medium text-slate-200 whitespace-nowrap">
                      {trade.date}
                    </td>

                    {/* Day */}
                    <td className="px-2 py-3 text-slate-400 whitespace-nowrap">
                      {trade.day}
                    </td>

                    {/* Extended: Asset & Dir */}
                    {showExtendedColumns && (
                      <>
                        <td className="px-2.5 py-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                          {trade.asset || '—'}
                        </td>
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <span
                            className={`font-semibold text-[11px] ${
                              trade.direction === 'Long'
                                ? 'text-emerald-400'
                                : trade.direction === 'Short'
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {trade.direction || '—'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Result */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          isTp ? 'text-emerald-400' : isSl ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {trade.result}
                      </span>
                    </td>

                    {/* RR */}
                    <td
                      className={`px-3 py-3 font-mono font-bold text-right whitespace-nowrap ${
                        trade.rr > 0
                          ? 'text-emerald-400'
                          : trade.rr < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatRR(trade.rr)}
                    </td>

                    {/* Captured */}
                    <td className="px-2.5 py-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold ${
                          trade.captured ? 'text-indigo-400' : 'text-amber-400'
                        }`}
                      >
                        {trade.captured ? 'YES' : 'NO'}
                      </span>
                    </td>

                    {/* Extended: Setup */}
                    {showExtendedColumns && (
                      <td className="px-3 py-3 text-slate-400 truncate max-w-[130px]" title={trade.setup}>
                        {trade.setup || '—'}
                      </td>
                    )}

                    {/* Reason */}
                    <td className="px-3.5 py-3 max-w-[180px] truncate text-slate-300" title={trade.reason}>
                      {trade.reason}
                    </td>

                    {/* Trade Risk */}
                    <td className="px-3 py-3 font-mono text-slate-400 text-right whitespace-nowrap">
                      ${trade.risk ?? riskPerTrade}
                    </td>

                    {/* P&L */}
                    <td
                      className={`px-3.5 py-3 font-mono font-bold text-right whitespace-nowrap ${
                        isPositivePnl
                          ? 'text-emerald-400'
                          : isNegativePnl
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatSignedCurrency(trade.calculatedPnl)}
                    </td>

                    {/* Cumulative R */}
                    <td
                      className={`px-3.5 py-3 font-mono font-bold text-right whitespace-nowrap ${
                        trade.cumulativeR > 0
                          ? 'text-emerald-400'
                          : trade.cumulativeR < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatRR(trade.cumulativeR)}
                    </td>

                    {/* Cumulative P&L */}
                    <td
                      className={`px-3.5 py-3 font-mono font-bold text-right whitespace-nowrap ${
                        trade.cumulativePnl > 0
                          ? 'text-emerald-400'
                          : trade.cumulativePnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatSignedCurrency(trade.cumulativePnl)}
                    </td>

                    {/* Goal Progress */}
                    <td className="px-3 py-3 font-mono text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          trade.goalProgressPercent >= 100
                            ? 'text-emerald-400'
                            : trade.goalProgressPercent > 0
                            ? 'text-indigo-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {trade.goalProgressPercent}%
                      </span>
                    </td>

                    {/* Actions: Edit, Duplicate, Delete */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditTrade(trade)}
                          className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-slate-200 transition-colors"
                          title="Edit trade"
                          aria-label="Edit trade"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateTrade(trade)}
                          className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-slate-200 transition-colors"
                          title="Duplicate trade"
                          aria-label="Duplicate trade"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTrade(trade.id)}
                          className="p-1 hover:bg-rose-950/80 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete trade"
                          aria-label="Delete trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          {trades.length > 0 && (
            <tfoot className="bg-[#090d18] border-t-2 border-slate-800 text-xs font-mono font-bold text-slate-300">
              <tr>
                <td colSpan={showExtendedColumns ? 5 : 3} className="px-3.5 py-3 text-slate-400 uppercase font-sans text-[11px]">
                  Total ({trades.length} trades)
                </td>
                <td
                  className={`px-3 py-3 text-right ${
                    totalR > 0 ? 'text-emerald-400' : totalR < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {formatRR(totalR)}
                </td>
                <td colSpan={showExtendedColumns ? 3 : 2} className="px-3.5 py-3 text-slate-500 text-center font-sans text-[11px]">
                  —
                </td>
                <td
                  className={`px-3.5 py-3 text-right ${
                    totalPnl > 0 ? 'text-emerald-400' : totalPnl < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {formatSignedCurrency(totalPnl)}
                </td>
                <td
                  className={`px-3.5 py-3 text-right ${
                    totalR > 0 ? 'text-emerald-400' : totalR < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {formatRR(totalR)}
                </td>
                <td
                  className={`px-3.5 py-3 text-right ${
                    totalPnl > 0 ? 'text-emerald-400' : totalPnl < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {formatSignedCurrency(totalPnl)}
                </td>
                <td colSpan={2} className="px-3 py-3 text-slate-500 text-center font-sans text-[11px]">
                  —
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
