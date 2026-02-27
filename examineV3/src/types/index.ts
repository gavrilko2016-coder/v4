export type Currency = 'BTC' | 'ETH' | 'TON' | 'USDT' | 'STARS';

export interface Wallet {
  BTC: number;
  ETH: number;
  TON: number;
  USDT: number;
  STARS: number;
  // Bonus System
  bonus_balance: number;
  wagering_required: number;
  wagering_progress: number;
  free_spins: number;
  // Stats
  total_deposited_usd: number;
  referral_code?: string;
  referred_by?: string;
}

export type Tab = 'games' | 'history' | 'wallet' | 'earn' | 'profile';

export type GameType = 'dice' | 'coinflip' | 'crash' | 'slots' | 'blackjack' | 'mines';

export interface BetResult {
  won: boolean;
  multiplier: number;
  payout: number;
  message: string;
}

export interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'deposit' | 'withdrawal';
  game: string;
  amount: number;
  currency: Currency;
  timestamp: Date;
  won?: boolean;
  status?: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  address?: string;
}
