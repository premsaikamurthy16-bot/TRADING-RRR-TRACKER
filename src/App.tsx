import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Account, CalculatedTrade, GlobalAppData, MonthlyGoal, Trade } from './types';
import {
  DEFAULT_INITIAL_ACCOUNT,
  DEFAULT_INITIAL_TRADES,
  executeFactoryReset,
  loadAppData,
  saveAppData,
} from './utils/storage';
import {
  calculateAccountMonthStats,
  calculateEnrichedTrades,
} from './utils/calculations';
import { Header } from './components/Header';
import { AccountView } from './components/AccountView';
import { AllAccountsView } from './components/AllAccountsView';
import { AccountManagementPage } from './components/AccountManagementPage';
import { TradeModal } from './components/TradeModal';
import { MonthManagementModal } from './components/MonthManagementModal';
import { DataManagementModal } from './components/DataManagementModal';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';

export default function App() {
  const [appData, setAppData] = useState<GlobalAppData>(() => loadAppData());
  const [activeView, setActiveView] = useState<'single' | 'all' | 'management'>('single');

  // Modal & Dialog states
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<CalculatedTrade | null>(null);
  const [isMonthManagerOpen, setIsMonthManagerOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // Delete Account Confirmation
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Undo Delete Trade State
  const [lastDeletedTrade, setLastDeletedTrade] = useState<Trade | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Persistent auto-save
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Selected Account (fallback to first non-archived account or first account)
  const selectedAccount = useMemo(() => {
    if (appData.accounts.length === 0) return null;
    const found = appData.accounts.find((a) => a.id === appData.selectedAccountId);
    if (found) return found;
    const firstActive = appData.accounts.find((a) => !a.isArchived);
    return firstActive || appData.accounts[0] || null;
  }, [appData.accounts, appData.selectedAccountId]);

  // Calculations for current selected account
  const enrichedTrades = useMemo(() => {
    if (!selectedAccount) return [];
    return calculateEnrichedTrades(appData.trades, selectedAccount, appData.selectedMonth);
  }, [appData.trades, selectedAccount, appData.selectedMonth]);

  const currentStats = useMemo(() => {
    if (!selectedAccount) return null;
    return calculateAccountMonthStats(selectedAccount, appData.trades, appData.selectedMonth);
  }, [selectedAccount, appData.trades, appData.selectedMonth]);

  // Calculations for all active accounts
  const allStats = useMemo(() => {
    return appData.accounts.map((acc) =>
      calculateAccountMonthStats(acc, appData.trades, appData.selectedMonth)
    );
  }, [appData.accounts, appData.trades, appData.selectedMonth]);

  // Account Navigation
  const handleSelectAccount = (accountId: string) => {
    setAppData((prev) => ({
      ...prev,
      selectedAccountId: accountId,
    }));
  };

  const handleMonthChange = (month: string) => {
    setAppData((prev) => {
      const months = prev.availableMonths.includes(month)
        ? prev.availableMonths
        : [...prev.availableMonths, month].sort();
      return {
        ...prev,
        selectedMonth: month,
        availableMonths: months,
      };
    });
  };

  // Trade CRUD Operations
  const handleAddTrade = (newTradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setAppData((prev) => ({
      ...prev,
      trades: [...prev.trades, newTrade],
    }));
  };

  const handleSaveTradeFromModal = (
    tradeData: Omit<Trade, 'id' | 'createdAt'>,
    tradeId?: string
  ) => {
    if (tradeId) {
      setAppData((prev) => ({
        ...prev,
        trades: prev.trades.map((t) =>
          t.id === tradeId ? { ...t, ...tradeData, updatedAt: Date.now() } : t
        ),
      }));
    } else {
      handleAddTrade(tradeData);
    }
  };

  const handleOpenEditTrade = (trade: CalculatedTrade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleDuplicateTrade = (trade: CalculatedTrade) => {
    const duplicated: Trade = {
      ...trade,
      id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reason: `${trade.reason} (Copy)`,
      createdAt: Date.now(),
    };
    setAppData((prev) => ({
      ...prev,
      trades: [...prev.trades, duplicated],
    }));
  };

  const handleDeleteTrade = (tradeId: string) => {
    const tradeToRemove = appData.trades.find((t) => t.id === tradeId);
    if (tradeToRemove) {
      setLastDeletedTrade(tradeToRemove);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setLastDeletedTrade(null);
      }, 7000);
    }
    setAppData((prev) => ({
      ...prev,
      trades: prev.trades.filter((t) => t.id !== tradeId),
    }));
  };

  const handleUndoDeleteTrade = () => {
    if (lastDeletedTrade) {
      setAppData((prev) => ({
        ...prev,
        trades: [...prev.trades, lastDeletedTrade],
      }));
      setLastDeletedTrade(null);
    }
  };

  // Account Management CRUD
  const handleSaveAccount = (updatedAccount: Account) => {
    setAppData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === updatedAccount.id ? updatedAccount : a
      ),
    }));
  };

  const handleCreateAccount = (newAccount: Account) => {
    setAppData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      selectedAccountId: newAccount.id,
    }));
    setActiveView('single');
  };

  const handleDuplicateAccount = (acc: Account) => {
    const duplicated: Account = {
      ...acc,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${acc.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setAppData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, duplicated],
      selectedAccountId: duplicated.id,
    }));
  };

  const handleToggleArchive = (accountId: string) => {
    setAppData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === accountId ? { ...a, isArchived: !a.isArchived } : a
      ),
    }));
  };

  const handleRequestDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
  };

  const handleConfirmDeleteAccount = (accountId: string) => {
    setAppData((prev) => {
      const remainingAccounts = prev.accounts.filter((a) => a.id !== accountId);
      const nextSelected =
        prev.selectedAccountId === accountId
          ? remainingAccounts[0]?.id || ''
          : prev.selectedAccountId;

      return {
        ...prev,
        accounts: remainingAccounts,
        selectedAccountId: nextSelected,
        trades: prev.trades.filter((t) => t.accountId !== accountId),
      };
    });
  };

  // Requirement #8: Recalculate historical trades risk upon explicit user choice
  const handleRecalculateHistoricalTrades = (accountId: string, newRisk: number) => {
    setAppData((prev) => ({
      ...prev,
      trades: prev.trades.map((t) => {
        if (t.accountId === accountId) {
          const updatedPnl = t.captured ? t.rr * newRisk : 0;
          return {
            ...t,
            risk: newRisk,
            pnl: updatedPnl,
            updatedAt: Date.now(),
          };
        }
        return t;
      }),
    }));
  };

  // Month Management Operations
  const handleAddMonth = (month: string) => {
    setAppData((prev) => ({
      ...prev,
      availableMonths: prev.availableMonths.includes(month)
        ? prev.availableMonths
        : [...prev.availableMonths, month].sort(),
    }));
  };

  const handleSaveMonthGoals = (accountId: string, month: string, goals: MonthlyGoal) => {
    setAppData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => {
        if (a.id === accountId) {
          return {
            ...a,
            monthlyGoals: {
              ...(a.monthlyGoals || {}),
              [month]: goals,
            },
          };
        }
        return a;
      }),
    }));
  };

  const handleClearMonthTrades = (accountId: string, month: string) => {
    setAppData((prev) => ({
      ...prev,
      trades: prev.trades.filter(
        (t) => !(t.accountId === accountId && t.date.startsWith(month))
      ),
    }));
  };

  const handleDeleteMonth = (month: string) => {
    setAppData((prev) => ({
      ...prev,
      availableMonths: prev.availableMonths.filter((m) => m !== month),
      trades: prev.trades.filter((t) => !t.date.startsWith(month)),
    }));
  };

  // Data Management Operations
  const handleClearCurrentMonth = () => {
    if (!selectedAccount) return;
    handleClearMonthTrades(selectedAccount.id, appData.selectedMonth);
  };

  const handleClearCurrentAccount = () => {
    if (!selectedAccount) return;
    setAppData((prev) => ({
      ...prev,
      trades: prev.trades.filter((t) => t.accountId !== selectedAccount.id),
    }));
  };

  const handleFactoryReset = () => {
    const fresh = executeFactoryReset();
    setAppData(fresh);
    setActiveView('single');
  };

  const handleImportSuccess = (importedData: GlobalAppData) => {
    setAppData(importedData);
    setActiveView('single');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        accounts={appData.accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={handleSelectAccount}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedMonth={appData.selectedMonth}
        availableMonths={appData.availableMonths}
        onMonthChange={handleMonthChange}
        onOpenTradeModal={() => {
          setEditingTrade(null);
          setIsTradeModalOpen(true);
        }}
        onOpenMonthManager={() => setIsMonthManagerOpen(true)}
        onOpenDataManagement={() => setIsDataManagementOpen(true)}
        onOpenNewAccount={() => setActiveView('management')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'single' ? (
          <AccountView
            account={selectedAccount}
            stats={currentStats}
            enrichedTrades={enrichedTrades}
            selectedMonth={appData.selectedMonth}
            onAddTrade={handleAddTrade}
            onEditTrade={handleOpenEditTrade}
            onDuplicateTrade={handleDuplicateTrade}
            onDeleteTrade={handleDeleteTrade}
            onOpenAddModal={() => {
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
            onOpenAccountSettings={() => setActiveView('management')}
            onOpenManageAccounts={() => setActiveView('management')}
            onCreateNewAccount={() => setActiveView('management')}
            lastDeletedTrade={lastDeletedTrade}
            onUndoDeleteTrade={handleUndoDeleteTrade}
          />
        ) : activeView === 'all' ? (
          <AllAccountsView
            accounts={appData.accounts}
            allStats={allStats}
            selectedMonth={appData.selectedMonth}
            onSelectAccount={(accId) => {
              handleSelectAccount(accId);
              setActiveView('single');
            }}
            onOpenNewAccountModal={() => setActiveView('management')}
            onOpenAccountSettings={(acc) => {
              handleSelectAccount(acc.id);
              setActiveView('management');
            }}
            onDuplicateAccount={handleDuplicateAccount}
            onToggleArchive={handleToggleArchive}
            onRequestDeleteAccount={handleRequestDeleteAccount}
          />
        ) : (
          <AccountManagementPage
            accounts={appData.accounts}
            selectedAccountId={appData.selectedAccountId}
            onSelectAccount={handleSelectAccount}
            onSaveAccount={handleSaveAccount}
            onCreateAccount={handleCreateAccount}
            onDuplicateAccount={handleDuplicateAccount}
            onToggleArchive={handleToggleArchive}
            onRequestDeleteAccount={handleRequestDeleteAccount}
            onRecalculateHistoricalTrades={handleRecalculateHistoricalTrades}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Personal Trading R:R Matrix · Full Owner Control</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setIsMonthManagerOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Month Goals ({appData.selectedMonth})
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsDataManagementOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Data Management & Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {selectedAccount && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => {
            setIsTradeModalOpen(false);
            setEditingTrade(null);
          }}
          onSave={handleSaveTradeFromModal}
          account={selectedAccount}
          initialTrade={editingTrade}
          selectedMonth={appData.selectedMonth}
        />
      )}

      <MonthManagementModal
        isOpen={isMonthManagerOpen}
        onClose={() => setIsMonthManagerOpen(false)}
        selectedMonth={appData.selectedMonth}
        availableMonths={appData.availableMonths}
        account={selectedAccount}
        onSelectMonth={handleMonthChange}
        onAddMonth={handleAddMonth}
        onSaveMonthGoals={handleSaveMonthGoals}
        onClearMonthTrades={handleClearMonthTrades}
        onDeleteMonth={handleDeleteMonth}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
        appData={appData}
        selectedAccount={selectedAccount}
        onImportSuccess={handleImportSuccess}
        onClearCurrentMonth={handleClearCurrentMonth}
        onClearCurrentAccount={handleClearCurrentAccount}
        onFactoryReset={handleFactoryReset}
      />

      <DeleteAccountDialog
        isOpen={Boolean(accountToDelete)}
        account={accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirmDelete={handleConfirmDeleteAccount}
      />
    </div>
  );
}
