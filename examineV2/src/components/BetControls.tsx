import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { playClick } from '../utils/sounds';
import type { Currency } from '../types';

const CURRENCY_ICONS: Record<Currency, string> = {
  BTC: '₿', ETH: 'Ξ', TON: '◈', USDT: '₮', STARS: '⭐',
};
const CURRENCY_COLORS: Record<Currency, string> = {
  BTC: '#f7931a', ETH: '#627eea', TON: '#00f5ff', USDT: '#26a17b', STARS: '#ffd700',
};
const QUICK_AMOUNTS: Record<Currency, number[]> = {
  BTC:   [0.0001, 0.0005, 0.001, 0.005],
  ETH:   [0.01,   0.05,   0.1,   0.5],
  TON:   [1,      5,      10,    50],
  USDT:  [1,      5,      10,    50],
  STARS: [50,     100,    500,   1000],
};

interface BetControlsProps {
  onBet: (amount: number, currency: Currency) => void;
  disabled?: boolean;
  label?: string;
}

function formatBalance(amount: number, currency: Currency): string {
  if (currency === 'BTC') return amount.toFixed(5);
  if (currency === 'ETH') return amount.toFixed(4);
  return amount.toFixed(2);
}

export function BetControls({ onBet, disabled = false, label }: BetControlsProps) {
  const { wallet, selectedCurrency } = useWallet();
  const { t } = useLanguage();
  const [betAmount, setBetAmount] = useState('');

  const currency = selectedCurrency;
  const balance = wallet[currency];
  const numericBet = parseFloat(betAmount) || 0;
  const isValid = numericBet > 0 && numericBet <= balance;
  const color = CURRENCY_COLORS[currency];

  const handleSubmit = () => {
    if (!isValid || disabled) return;
    onBet(numericBet, currency);
  };

  return (
    <div className="rounded-2xl p-4 space-y-3 cyber-card" style={{ border: `1px solid ${color}33` }}>
      {/* Balance */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold" style={{ color: `${color}88` }}>
          {t.balance.toUpperCase()}
        </span>
        <span className="text-sm font-black font-mono" style={{ color }}>
          {CURRENCY_ICONS[currency]} {formatBalance(balance, currency)} {currency}
        </span>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black font-mono" style={{ color }}>
          {CURRENCY_ICONS[currency]}
        </span>
        <input
          type="number"
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          placeholder="0.00"
          disabled={disabled}
          className="w-full rounded-xl pl-8 pr-28 py-3 text-white font-black text-lg font-mono outline-none transition-all"
          style={{
            background: '#0a0a0f',
            border: `1px solid ${color}44`,
            boxShadow: isValid ? `0 0 8px ${color}22` : 'none',
          }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {[
            { l: t.half, fn: () => setBetAmount(formatBalance(balance / 2, currency)) },
            { l: t.max,  fn: () => setBetAmount(formatBalance(balance, currency)) },
          ].map(btn => (
            <button key={btn.l} onClick={() => { playClick(); btn.fn(); }} disabled={disabled}
              className="px-2 py-1 rounded-lg text-xs font-black font-mono transition-all"
              style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
              {btn.l}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS[currency].map(amt => (
          <button
            key={amt}
            onClick={() => { playClick(); setBetAmount(formatBalance(amt, currency)); }}
            disabled={disabled || amt > balance}
            className="py-2 rounded-xl text-xs font-black font-mono transition-all disabled:opacity-30"
            style={{
              background: `${color}11`,
              border: `1px solid ${color}33`,
              color,
            }}
          >
            {formatBalance(amt, currency)}
          </button>
        ))}
      </div>

      {/* Bet Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || disabled}
        className="w-full py-3.5 rounded-xl font-black text-base font-mono transition-all active:scale-95 disabled:opacity-40"
        style={isValid && !disabled ? {
          background: `linear-gradient(135deg, ${color}33, ${color}55)`,
          border: `1px solid ${color}66`,
          color,
          boxShadow: `0 0 20px ${color}33`,
          textShadow: `0 0 10px ${color}`,
        } : {
          background: '#13131f',
          border: '1px solid #1e1e3a',
          color: '#ffffff33',
        }}
      >
        {label || t.placeBet}
      </button>
    </div>
  );
}
