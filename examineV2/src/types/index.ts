export type Currency = 'BTC' | 'ETH' | 'TON' | 'USDT' | 'STARS';

export interface Wallet {
  BTC: number;
  ETH: number;
  TON: number;
  USDT: number;
  STARS: number;
}

export type GameType = 'dice' | 'coinflip' | 'crash' | 'slots' | 'blackjack' | 'mines';

export interface BetResult {
  won: boolean;
  multiplier: number;
  payout: number;
  message: string;
}

export interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'deposit';
  game: string;
  amount: number;
  currency: Currency;
  timestamp: Date;
  won?: boolean;
}
