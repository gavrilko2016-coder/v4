import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Currency, Wallet, Transaction } from '../types';
import { useBotCredits } from '../hooks/useBotCredits';

interface WalletContextType {
  wallet: Wallet;
  selectedCurrency: Currency;
  setSelectedCurrency: (c: Currency) => void;
  transactions: Transaction[];
  placeBet: (amount: number, currency: Currency) => boolean;
  addWinnings: (amount: number, currency: Currency, game: string) => void;
  recordLoss: (amount: number, currency: Currency, game: string) => void;
  addDeposit: (amount: number, currency: Currency, source?: string) => void;
  withdraw: (amount: number, currency: Currency) => boolean;
  claimDailyBonus: () => boolean;
  /** Bot credits balance (from Telegram Stars purchases) */
  botCredits: number;
  /** Whether bot credits are loading */
  botLoading: boolean;
  /** Telegram user ID */
  telegramId: number | null;
  /** Telegram user name */
  telegramName: string | null;
  /** Whether running inside Telegram */
  isInTelegram: boolean;
  /** Open bot chat to buy credits */
  openBuyCredits: () => void;
  /** Refresh bot credits balance */
  refreshBotCredits: () => Promise<number>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const INITIAL_WALLET: Wallet = {
  BTC: 0,
  ETH: 0,
  TON: 0,
  USDT: 0,
  STARS: 0,
};

const WALLET_KEY = 'cryptobet_wallet_v1';
const TX_KEY = 'cryptobet_tx_v1';
const CURR_KEY = 'cryptobet_selected_currency_v1';

// Daily bonus tracking
const DAILY_BONUS_KEY = 'cryptobet_daily_bonus_last';
export function getDailyBonusAvailable(): boolean {
  const last = localStorage.getItem(DAILY_BONUS_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last) > 86400000; // 24h
}
export function getNextDailyBonusTime(): number {
  const last = localStorage.getItem(DAILY_BONUS_KEY);
  if (!last) return 0;
  return parseInt(last) + 86400000;
}
export function markDailyBonusClaimed() {
  localStorage.setItem(DAILY_BONUS_KEY, Date.now().toString());
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('TON');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Bot credits integration — syncs STARS balance from Telegram bot
  const bot = useBotCredits();

  // Load persisted state on mount
  useEffect(() => {
    try {
      const w = localStorage.getItem(WALLET_KEY);
      if (w) {
        const parsed = JSON.parse(w);
        const next: Wallet = {
          BTC: Number(parsed.BTC) || 0,
          ETH: Number(parsed.ETH) || 0,
          TON: Number(parsed.TON) || 0,
          USDT: Number(parsed.USDT) || 0,
          STARS: Number(parsed.STARS) || 0,
        };
        setWallet(next);
      }
    } catch {}
    try {
      const t = localStorage.getItem(TX_KEY);
      if (t) {
        const arr = JSON.parse(t) as any[];
        const next: Transaction[] = arr.map(item => ({
          id: String(item.id),
          type: item.type,
          game: item.game,
          amount: Number(item.amount) || 0,
          currency: item.currency,
          timestamp: new Date(item.timestamp),
          won: !!item.won,
        })).slice(0, 200);
        setTransactions(next);
      }
    } catch {}
    try {
      const c = localStorage.getItem(CURR_KEY);
      if (c) setSelectedCurrency(c as Currency);
    } catch {}
  }, []);

  // Persist state when it changes
  useEffect(() => {
    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    } catch {}
  }, [wallet]);
  useEffect(() => {
    try {
      localStorage.setItem(TX_KEY, JSON.stringify(transactions));
    } catch {}
  }, [transactions]);
  useEffect(() => {
    try {
      localStorage.setItem(CURR_KEY, selectedCurrency);
    } catch {}
  }, [selectedCurrency]);

  // Keep wallet.STARS in sync with bot credits
  useEffect(() => {
    if (bot.credits > 0 || bot.isInTelegram) {
      setWallet(prev => {
        const synced = Math.max(prev.STARS ?? 0, bot.credits ?? 0);
        if (prev.STARS === synced) return prev;
        return { ...prev, STARS: synced };
      });
    }
  }, [bot.credits, bot.isInTelegram]);

  const placeBet = useCallback((amount: number, currency: Currency): boolean => {
    if (wallet[currency] < amount) return false;
    setWallet(prev => ({ ...prev, [currency]: +(prev[currency] - amount).toFixed(8) }));
    return true;
  }, [wallet]);

  const addWinnings = useCallback((amount: number, currency: Currency, game: string) => {
    setWallet(prev => ({ ...prev, [currency]: +(prev[currency] + amount).toFixed(8) }));
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'win',
      game,
      amount,
      currency,
      timestamp: new Date(),
      won: true,
    }, ...prev.slice(0, 49)]);
  }, []);

  const recordLoss = useCallback((amount: number, currency: Currency, game: string) => {
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'bet',
      game,
      amount,
      currency,
      timestamp: new Date(),
      won: false,
    }, ...prev.slice(0, 49)]);
  }, []);

  const addDeposit = useCallback((amount: number, currency: Currency, source: string = 'Deposit') => {
    setWallet(prev => ({ ...prev, [currency]: +(prev[currency] + amount).toFixed(8) }));
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'deposit',
      game: source,
      amount,
      currency,
      timestamp: new Date(),
      won: true,
    }, ...prev.slice(0, 49)]);
  }, []);

  const claimDailyBonus = useCallback((): boolean => {
    if (!getDailyBonusAvailable()) return false;
    setWallet(prev => ({ ...prev, STARS: +(prev.STARS + 1).toFixed(0) }));
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'deposit',
      game: 'Daily Bonus',
      amount: 1,
      currency: 'STARS' as Currency,
      timestamp: new Date(),
      won: true,
    }, ...prev.slice(0, 49)]);
    markDailyBonusClaimed();
    return true;
  }, []);

  const withdraw = useCallback((amount: number, currency: Currency): boolean => {
    let ok = false;
    setWallet(prev => {
      if (prev[currency] < amount) return prev;
      ok = true;
      return { ...prev, [currency]: +(prev[currency] - amount).toFixed(8) };
    });
    if (ok) {
      setTransactions(prev => [{
        id: crypto.randomUUID(),
        type: 'withdraw' as 'bet',   // reuse bet type for tx log
        game: 'Withdrawal',
        amount,
        currency,
        timestamp: new Date(),
        won: false,
      }, ...prev.slice(0, 49)]);
    }
    return ok;
  }, []);

  return (
    <WalletContext.Provider value={{
      wallet,
      selectedCurrency,
      setSelectedCurrency,
      transactions,
      placeBet,
      addWinnings,
      recordLoss,
      addDeposit,
      withdraw,
      claimDailyBonus,
      botCredits: bot.credits,
      botLoading: bot.loading,
      telegramId: bot.telegramId,
      telegramName: bot.telegramName,
      isInTelegram: bot.isInTelegram,
      openBuyCredits: bot.openBuyCredits,
      refreshBotCredits: bot.refreshBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
