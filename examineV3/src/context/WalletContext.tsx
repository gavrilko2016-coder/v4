import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Currency, Wallet, Transaction } from '../types';
import { useBotCredits } from '../hooks/useBotCredits';

interface WalletContextType {
  wallet: Wallet;
  selectedCurrency: Currency;
  setSelectedCurrency: (c: Currency) => void;
  transactions: Transaction[];
  placeBet: (amount: number, currency: Currency) => boolean;
  refundBet: (amount: number, currency: Currency, game: string) => void;
  addWinnings: (amount: number, currency: Currency, game: string) => void;
  recordLoss: (amount: number, currency: Currency, game: string) => void;
  addDeposit: (amount: number, currency: Currency, source?: string) => void;
  withdraw: (amount: number, currency: Currency, address: string) => boolean;
  updateTransactionStatus: (id: string, status: 'confirmed' | 'failed') => void;
  claimDailyBonus: () => boolean;
  redeemReferral: (code: string) => boolean;
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
  userId: string;
}

const WalletContext = createContext<WalletContextType | null>(null);

const INITIAL_WALLET: Wallet = {
  BTC: 0,
  ETH: 0,
  TON: 0,
  USDT: 0,
  STARS: 0,
  bonus_balance: 0,
  wagering_required: 0,
  wagering_progress: 0,
  free_spins: 0,
  total_deposited_usd: 0,
  userId: '',
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
  // Initialize state from localStorage directly to avoid flicker/reset
  const [wallet, setWallet] = useState<Wallet>(() => {
    try {
      const w = localStorage.getItem(WALLET_KEY);
      if (w) {
        const parsed = JSON.parse(w);
        return {
          ...INITIAL_WALLET,
          ...parsed,
          // Ensure these are preserved or initialized
          BTC: Number(parsed.BTC) || 0,
          ETH: Number(parsed.ETH) || 0,
          TON: Number(parsed.TON) || 0,
          USDT: Number(parsed.USDT) || 0,
          STARS: Number(parsed.STARS) || 0,
          bonus_balance: Number(parsed.bonus_balance) || 0,
          wagering_required: Number(parsed.wagering_required) || 0,
          wagering_progress: Number(parsed.wagering_progress) || 0,
          total_deposited_usd: Number(parsed.total_deposited_usd) || 0,
          // Important: preserve referred_by
          referred_by: parsed.referred_by,
        };
      }
    } catch {}
    return INITIAL_WALLET;
  });

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    try {
      const c = localStorage.getItem(CURR_KEY);
      if (c) return c as Currency;
    } catch {}
    return 'USDT';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const t = localStorage.getItem(TX_KEY);
      if (t) {
        const arr = JSON.parse(t) as any[];
        return arr.map(item => ({
          id: String(item.id),
          type: item.type,
          game: item.game,
          amount: Number(item.amount) || 0,
          currency: item.currency,
          timestamp: new Date(item.timestamp),
          won: !!item.won,
        })).slice(0, 200);
      }
    } catch {}
    return [];
  });

  const [userId, setUserId] = useState('');

  // Bot credits integration — syncs STARS balance from Telegram bot
  const bot = useBotCredits();

  // Generate/Load User ID
  useEffect(() => {
    // 1. Try to get ID from localStorage
    let stored = localStorage.getItem('cryptobet_userid');
    
    // 2. If not found, try to get from URL params (e.g. ?uid=...)
    if (!stored) {
      const params = new URLSearchParams(window.location.search);
      const urlUid = params.get('uid');
      if (urlUid) {
        stored = urlUid;
        localStorage.setItem('cryptobet_userid', stored);
      }
    }

    // 3. If still not found, generate a new persistent ID
    if (!stored) {
      // Use a more robust ID generation
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      const randomPart = Array.from(array).map(n => n.toString(16)).join('');
      stored = `User_${randomPart}`;
      localStorage.setItem('cryptobet_userid', stored);
    }
    
    setUserId(stored);
    setWallet(prev => ({ ...prev, userId: stored! }));
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
    if (!Number.isFinite(amount) || amount <= 0) return false;

    const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };
    const usdValue = amount * (USD_RATES[currency] || 0);

    let ok = true;
    setWallet(prev => {
      if ((prev[currency] ?? 0) < amount) {
        ok = false;
        return prev;
      }

      const nextBal = Math.max(0, +((prev[currency] ?? 0) - amount).toFixed(8));
      return {
        ...prev,
        [currency]: nextBal,
        wagering_progress: +(prev.wagering_progress + usdValue).toFixed(2)
      };
    });
    return ok;
  }, []);

  const refundBet = useCallback((amount: number, currency: Currency, game: string) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setWallet(prev => ({ ...prev, [currency]: +(prev[currency] + amount).toFixed(8) }));
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'deposit',
      game,
      amount,
      currency,
      timestamp: new Date(),
      won: true,
    }, ...prev.slice(0, 49)]);
  }, []);

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
    const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };
    const usdValue = amount * (USD_RATES[currency] || 0);

    setWallet(prev => ({ 
      ...prev, 
      [currency]: +(prev[currency] + amount).toFixed(8),
      total_deposited_usd: +(prev.total_deposited_usd + usdValue).toFixed(2)
    }));
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
    setWallet(prev => ({ 
      ...prev, 
      STARS: +(prev.STARS + 1).toFixed(2),
      free_spins: Math.random() < 0.2 ? prev.free_spins + 5 : prev.free_spins
    }));
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

  const redeemReferral = useCallback((code: string): boolean => {
    // Check if user already used a referral code
    if (wallet.referred_by) return false;
    
    // Check if the provided code is the valid bonus code
    const VALID_CODE = 'BONUS2026';
    if (code !== VALID_CODE) return false;
    
    // Bonus: $50 USDT, Wager x15
    const BONUS_AMOUNT = 50;
    const WAGER_REQ = BONUS_AMOUNT * 15;
    
    setWallet(prev => ({
      ...prev,
      USDT: +(prev.USDT + BONUS_AMOUNT).toFixed(2),
      wagering_required: +(prev.wagering_required + WAGER_REQ).toFixed(2),
      referred_by: code,
      bonus_balance: +(prev.bonus_balance + BONUS_AMOUNT).toFixed(2)
    }));
    
    setTransactions(prev => [{
      id: crypto.randomUUID(),
      type: 'deposit',
      game: 'Referral Bonus',
      amount: BONUS_AMOUNT,
      currency: 'USDT',
      timestamp: new Date(),
      won: true,
    }, ...prev.slice(0, 49)]);
    
    return true;
  }, [wallet.referred_by]);

  const withdraw = useCallback((amount: number, currency: Currency, address: string): boolean => {
    let ok = false;

    // Withdrawal is locked until user makes a real deposit of at least $10.
    // Promo bonuses do not increase total_deposited_usd (see redeemReferral), so they don't unlock withdrawals.
    if ((wallet.total_deposited_usd ?? 0) < 10) return false;
    
    // Check balance
    if (wallet[currency] >= amount) {
      ok = true;
      setWallet(prev => ({ ...prev, [currency]: +(prev[currency] - amount).toFixed(8) }));
      
      setTransactions(prev => [{
        id: crypto.randomUUID(),
        type: 'withdrawal',
        game: 'Withdrawal',
        amount,
        currency,
        timestamp: new Date(),
        won: false,
        status: 'pending',
        address
      }, ...prev]);
    }
    return ok;
  }, [wallet]);

  const updateTransactionStatus = useCallback((id: string, status: 'confirmed' | 'failed') => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        // If failed, refund the amount
        if (status === 'failed' && t.type === 'withdrawal' && t.status === 'pending') {
          setWallet(w => ({ ...w, [t.currency]: +(w[t.currency] + t.amount).toFixed(8) }));
        }
        return { ...t, status };
      }
      return t;
    }));
  }, []);

  return (
    <WalletContext.Provider value={{
      wallet,
      selectedCurrency,
      setSelectedCurrency,
      transactions,
      placeBet,
      refundBet,
      addWinnings,
      recordLoss,
      addDeposit,
      withdraw,
      updateTransactionStatus,
      claimDailyBonus,
      redeemReferral,
      botCredits: bot.credits,
      botLoading: bot.loading,
      telegramId: bot.telegramId,
      telegramName: bot.telegramName,
      isInTelegram: bot.isInTelegram,
      openBuyCredits: bot.openBuyCredits,
      refreshBotCredits: bot.refreshBalance,
      userId,
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
