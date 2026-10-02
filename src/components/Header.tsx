import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Layers,
  LayoutDashboard,
  Download,
  Calendar,
  Sliders,
  Check,
} from 'lucide-react';
import { Account } from '../types';
import { formatCurrency, getMonthLabel } from '../utils/calculations';

interface HeaderProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (accountId: string) => void;
  activeView: 'single' | 'all' | 'management';
  setActiveView: (view: 'single' | 'all' | 'management') => void;
  selectedMonth: string; // YYYY-MM
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  onOpenTradeModal: () => void;
  onOpenMonthManager: () => void;
  onOpenDataManagement: () => void;
  onOpenNewAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  activeView,
  setActiveView,
  selectedMonth,
  availableMonths,
  onMonthChange,
  onOpenTradeModal,
  onOpenMonthManager,
  onOpenDataManagement,
  onOpenNewAccount,
}) => {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthShift = (deltaMonths: number) => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const date = new Date(year, month + deltaMonths, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Zone 1: Wordmark & Navigation Tabs */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveView('single')}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                R:R
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-base leading-none">
                  R:R Tracker
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                  Personal Matrix
                </span>
              </div>
            </div>

            {/* Navigation View Tabs */}
            <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === 'single'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Accounts ({accounts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('management')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === 'management'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Zone 2: Account Selector & Month Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Switcher */}
            {selectedAccount ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800/90 text-slate-100 rounded-lg border border-slate-700/80 text-xs sm:text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label="Select trading account"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{selectedAccount.name}</span>
                  <span className="hidden lg:inline text-slate-400 text-xs font-normal">
                    ({formatCurrency(selectedAccount.startingBalance + selectedAccount.existingProfit)})
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-[#0d1322] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 divide-y divide-slate-800">
                    <div className="py-1">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Trading Accounts</span>
                        <span className="text-[10px] text-indigo-400">{activeAccounts.length} active</span>
                      </div>
                      {activeAccounts.map((acc) => {
                        const isSelected = acc.id === selectedAccount.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              onSelectAccount(acc.id);
                              setActiveView('single');
                              setAccountDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs transition-colors ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="font-semibold text-slate-100 truncate">{acc.name}</span>
                              <span className="text-[11px] text-slate-400">
                                Risk: ${acc.riskPerTrade} · Size: {formatCurrency(acc.accountSize)}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1.5 pb-0.5 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onOpenNewAccount();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add New Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setActiveView('management');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Manage All Accounts...</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenNewAccount}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                + Create Account
              </button>
            )}

            {/* Month Selector */}
            <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5" ref={monthRef}>
              <button
                type="button"
                onClick={() => handleMonthShift(-1)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                className="px-2 py-1 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5"
                aria-label="Choose month"
              >
                <span>{getMonthLabel(selectedMonth)}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${monthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => handleMonthShift(1)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {monthDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0d1322] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 divide-y divide-slate-800">
                  <div className="py-1">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Month
                    </div>
                    {availableMonths.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          onMonthChange(m);
                          setMonthDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          m === selectedMonth
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{getMonthLabel(m)}</span>
                        {m === selectedMonth && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 pb-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMonthDropdownOpen(false);
                        onOpenMonthManager();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Configure Months & Goals...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {selectedAccount && (
              <button
                type="button"
                onClick={onOpenTradeModal}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Trade</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenMonthManager}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Month Trackers & Goals"
              aria-label="Month Trackers & Goals"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDataManagement}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Data Management & Backup"
              aria-label="Data Management & Backup"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Tab Bar */}
        <div className="md:hidden flex items-center justify-center pb-2 pt-1 border-t border-slate-800/40 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveView('single')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeView === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeView === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>All ({accounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('management')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeView === 'management' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
