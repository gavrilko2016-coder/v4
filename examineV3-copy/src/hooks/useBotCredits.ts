import { useState, useEffect, useCallback, useRef } from 'react';

// Bot API base URL — change to your production URL when deploying
const BOT_API_URL = 'http://localhost:3001';

interface BotUser {
  telegram_id: number;
  balance: number;
  total_deposited: number;
  total_wagered: number;
  total_won: number;
}

interface UseBotCreditsReturn {
  /** Credits balance from bot DB */
  credits: number;
  /** Whether we're loading from API */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Telegram user ID (null if not in Telegram) */
  telegramId: number | null;
  /** Telegram user name */
  telegramName: string | null;
  /** Full user data from bot */
  botUser: BotUser | null;
  /** Refresh balance from bot API */
  refreshBalance: () => Promise<number>;
  /** Place a bet via bot API — returns { ok, bet_id, balance_after } */
  placeBet: (game: string, amount: number) => Promise<{ ok: boolean; bet_id?: number; balance_after?: number; error?: string }>;
  /** Resolve a bet via bot API */
  resolveBet: (betId: number, result: 'win' | 'loss', multiplier: number, winAmount: number) => Promise<{ ok: boolean; balance_after?: number }>;
  /** Open bot chat to buy credits */
  openBuyCredits: () => void;
  /** Whether running inside Telegram WebApp */
  isInTelegram: boolean;
}

function getTelegramUser(): { id: number; username?: string; first_name?: string; last_name?: string } | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  } catch {}
  return null;
}

export function useBotCredits(): UseBotCreditsReturn {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [botUser, setBotUser] = useState<BotUser | null>(null);
  const tgUser = useRef(getTelegramUser());

  const telegramId = tgUser.current?.id ?? null;
  const telegramName = tgUser.current?.first_name ?? tgUser.current?.username ?? null;
  const isInTelegram = telegramId !== null;

  // Sync user with bot on mount
  const syncUser = useCallback(async () => {
    if (!telegramId) {
      setLoading(false);
      return 0;
    }

    try {
      const res = await fetch(`${BOT_API_URL}/api/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          username: tgUser.current?.username,
          first_name: tgUser.current?.first_name,
          last_name: tgUser.current?.last_name,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: BotUser = await res.json();
      setBotUser(data);
      setCredits(data.balance);
      setError(null);
      return data.balance;
    } catch (err: any) {
      setError(err.message);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  // Refresh balance only (lighter call)
  const refreshBalance = useCallback(async () => {
    if (!telegramId) return 0;
    try {
      const res = await fetch(`${BOT_API_URL}/api/user/${telegramId}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: BotUser = await res.json();
      setBotUser(data);
      setCredits(data.balance);
      setError(null);
      return data.balance;
    } catch (err: any) {
      setError(err.message);
      return credits;
    }
  }, [telegramId, credits]);

  // Place bet via API
  const placeBet = useCallback(async (game: string, amount: number) => {
    if (!telegramId) return { ok: false, error: 'Not in Telegram' };
    try {
      const res = await fetch(`${BOT_API_URL}/api/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId, game, amount }),
      });
      const data = await res.json();
      if (data.ok) {
        setCredits(data.balance_after);
      }
      return data;
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, [telegramId]);

  // Resolve bet via API
  const resolveBet = useCallback(async (betId: number, result: 'win' | 'loss', multiplier: number, winAmount: number) => {
    try {
      const res = await fetch(`${BOT_API_URL}/api/bet/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet_id: betId, result, multiplier, win_amount: winAmount }),
      });
      const data = await res.json();
      if (data.ok) {
        setCredits(data.balance_after);
      }
      return data;
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, []);

  // Open bot chat to buy credits
  const openBuyCredits = useCallback(() => {
    window.open('https://t.me/Peyment322_bot?start=buy', '_blank');
  }, []);

  // Sync on mount + poll every 10s to catch new deposits
  useEffect(() => {
    syncUser();

    if (!telegramId) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [syncUser, refreshBalance, telegramId]);

  // Refresh when window regains focus (user returns from bot chat)
  useEffect(() => {
    if (!telegramId) return;

    const handleFocus = () => {
      refreshBalance();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshBalance();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [telegramId, refreshBalance]);

  return {
    credits,
    loading,
    error,
    telegramId,
    telegramName,
    botUser,
    refreshBalance,
    placeBet,
    resolveBet,
    openBuyCredits,
    isInTelegram,
  };
}
