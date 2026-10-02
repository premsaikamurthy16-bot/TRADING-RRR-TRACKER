import { Account, GlobalAppData, Trade } from '../types';

const STORAGE_KEY = 'rr_tracker_owner_matrix_v2';
const INITIALIZED_KEY = 'rr_tracker_owner_initialized_v2';

// Single clean starting template on first-ever launch (100% editable & deletable)
export const DEFAULT_INITIAL_ACCOUNT: Account = {
  id: 'acc-5k-instant',
  name: '$5K Instant',
  accountSize: 5000,
  startingBalance: 5000,
  existingProfit: 120,
  riskPerTrade: 35,
  standardRR: '1:2',
  monthlyRTarget: 14,
  monthlyProfitTarget: 490,
  personalProfitGoal: 550,
  targetBalance: 5550,
  maxTradesPerDay: 2,
  notes: 'My primary personal trading account. Strict risk preservation.',
  isArchived: false,
  createdAt: '2026-09-01T08:00:00.000Z',
  monthlyGoals: {
    '2026-10': {
      monthlyRTarget: 14,
      monthlyProfitTarget: 490,
      personalProfitGoal: 550,
      targetBalance: 5550,
    },
  },
};

export const DEFAULT_INITIAL_TRADES: Trade[] = [
  {
    id: 'trade-demo-1',
    accountId: 'acc-5k-instant',
    date: '2026-10-01',
    time: '09:30',
    day: 'Thu',
    asset: 'NQ',
    direction: 'Long',
    result: 'TP',
    rr: 2,
    risk: 35,
    pnl: 70,
    captured: true,
    reason: 'Valid setup',
    setup: 'Liquidity sweep + pullback',
    session: 'NY AM',
    entry: 20450,
    stopLoss: 20420,
    takeProfit: 20510,
    notes: 'Clean execution',
    createdAt: 1727773200000,
  },
  {
    id: 'trade-demo-2',
    accountId: 'acc-5k-instant',
    date: '2026-10-02',
    time: '10:15',
    day: 'Fri',
    asset: 'NQ',
    direction: 'Long',
    result: 'TP',
    rr: 1,
    risk: 35,
    pnl: 35,
    captured: true,
    reason: 'Trend pullback entry',
    setup: 'Bullish order block',
    session: 'NY AM',
    entry: 20520,
    stopLoss: 20490,
    takeProfit: 20550,
    notes: 'Took partial at 1R ahead of weekend',
    createdAt: 1727859600000,
  },
];

export const EMPTY_APP_DATA: GlobalAppData = {
  accounts: [],
  trades: [],
  selectedAccountId: '',
  selectedMonth: '2026-10',
  availableMonths: ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01'],
  version: 2,
  lastUpdated: new Date().toISOString(),
};

/**
 * Loads data synchronously from storage.
 * If user has visited before and deleted accounts, we NEVER re-seed!
 */
export function loadAppData(): GlobalAppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasInitialized = localStorage.getItem(INITIALIZED_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        trades: Array.isArray(parsed.trades) ? parsed.trades : [],
        selectedAccountId: parsed.selectedAccountId || (parsed.accounts?.[0]?.id ?? ''),
        selectedMonth: parsed.selectedMonth || '2026-10',
        availableMonths: Array.isArray(parsed.availableMonths) && parsed.availableMonths.length > 0
          ? parsed.availableMonths
          : ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01'],
        version: 2,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }

    // First time ever opened
    if (!hasInitialized) {
      const initial: GlobalAppData = {
        accounts: [DEFAULT_INITIAL_ACCOUNT],
        trades: DEFAULT_INITIAL_TRADES,
        selectedAccountId: DEFAULT_INITIAL_ACCOUNT.id,
        selectedMonth: '2026-10',
        availableMonths: ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01'],
        version: 2,
        lastUpdated: new Date().toISOString(),
      };
      saveAppData(initial);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return initial;
    }

    return EMPTY_APP_DATA;
  } catch (err) {
    console.error('Storage load error:', err);
    return EMPTY_APP_DATA;
  }
}

/**
 * Saves data to localStorage and IndexedDB
 */
export function saveAppData(data: GlobalAppData): void {
  try {
    const payload = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(INITIALIZED_KEY, 'true');

    // Asynchronously backup to IndexedDB for safety
    saveToIndexedDb(payload).catch((err) => console.warn('IndexedDB backup note:', err));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

// IndexedDB Helper
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TradingRRTrackerDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDb(data: GlobalAppData): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await openDatabase();
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    store.put({ id: 'app_data', ...data });
  } catch {
    // Silently continue if IndexedDB is restricted
  }
}

/**
 * JSON Export of complete application
 */
export function exportAppDataJson(data: GlobalAppData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `trading-rr-tracker-complete-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * CSV Export for trades
 */
export function exportTradesCsv(trades: Trade[], accounts: Account[]): void {
  const accountMap = new Map<string, string>();
  accounts.forEach((a) => accountMap.set(a.id, a.name));

  const headers = [
    'Trade ID',
    'Account Name',
    'Date',
    'Time',
    'Day',
    'Asset',
    'Direction',
    'Result',
    'RR',
    'Recorded Risk ($)',
    'P&L ($)',
    'Captured',
    'Setup',
    'Session',
    'Entry',
    'Stop Loss',
    'Take Profit',
    'Reason',
    'Notes',
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = trades.map((t) => {
    const accName = accountMap.get(t.accountId) || t.accountId;
    const pnl = t.pnl !== undefined ? t.pnl : (t.captured ? t.rr * (t.risk || 0) : 0);
    return [
      escapeCsv(t.id),
      escapeCsv(accName),
      escapeCsv(t.date),
      escapeCsv(t.time || ''),
      escapeCsv(t.day || ''),
      escapeCsv(t.asset || ''),
      escapeCsv(t.direction || ''),
      escapeCsv(t.result),
      escapeCsv(t.rr),
      escapeCsv(t.risk),
      escapeCsv(pnl),
      escapeCsv(t.captured ? 'YES' : 'NO'),
      escapeCsv(t.setup || ''),
      escapeCsv(t.session || ''),
      escapeCsv(t.entry || ''),
      escapeCsv(t.stopLoss || ''),
      escapeCsv(t.takeProfit || ''),
      escapeCsv(t.reason),
      escapeCsv(t.notes || ''),
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', `trading-trades-export-${dateStr}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validates and restores imported JSON backup
 */
export function validateAndParseImport(jsonContent: string): GlobalAppData | null {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || !Array.isArray(parsed.accounts)) {
      return null;
    }
    return {
      accounts: parsed.accounts,
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      selectedAccountId: parsed.selectedAccountId || (parsed.accounts[0]?.id ?? ''),
      selectedMonth: parsed.selectedMonth || '2026-10',
      availableMonths: Array.isArray(parsed.availableMonths) && parsed.availableMonths.length > 0
        ? parsed.availableMonths
        : ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01'],
      version: 2,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Factory reset: wipes all local records completely
 */
export function executeFactoryReset(): GlobalAppData {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(INITIALIZED_KEY, 'true');
  const fresh: GlobalAppData = {
    accounts: [],
    trades: [],
    selectedAccountId: '',
    selectedMonth: '2026-10',
    availableMonths: ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01'],
    version: 2,
    lastUpdated: new Date().toISOString(),
  };
  saveAppData(fresh);
  return fresh;
}
