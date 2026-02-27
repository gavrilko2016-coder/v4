import { useEffect, useState } from 'react';
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
const QUICK_USDT_AMOUNTS = [1, 5, 10, 50];

const USD_RATES: Record<Currency, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };

interface BetControlsProps {
  onBet: (amount: number, currency: Currency) => void;
  disabled?: boolean;
  label?: string;
}

export function BetControls({ onBet, disabled = false, label }: BetControlsProps) {
  const { wallet, selectedCurrency } = useWallet();
  useLanguage();
  const [betAmount, setBetAmount] = useState('');

  const currency = selectedCurrency;
  const balance = wallet[currency];
  const rate = USD_RATES[currency] || 0;
  const balanceUsdt = rate > 0 ? balance * rate : 0;
  const numericBetUsdt = parseFloat(betAmount) || 0;
  const isValid = numericBetUsdt > 0 && numericBetUsdt <= balanceUsdt;
  const color = CURRENCY_COLORS[currency];

  const storageKey = `bet_amount_usdt_${currency}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setBetAmount(stored);
        return;
      }
    } catch {}

    const fallback = QUICK_USDT_AMOUNTS[0];
    if (fallback !== undefined) setBetAmount(String(fallback));
  }, [storageKey, currency]);

  const updateBetAmount = (val: string) => {
    setBetAmount(val);
    try {
      localStorage.setItem(storageKey, val);
    } catch {}
  };

  const handleSubmit = () => {
    if (!isValid || disabled) return;
    const betInCurrency = rate > 0 ? (numericBetUsdt / rate) : 0;
    onBet(betInCurrency, currency);
  };

  return (
    <div className="rounded-2xl p-4 space-y-4 cyber-card bg-[#13131f] border border-white/5 relative z-20 max-md:sticky max-md:bottom-24 max-md:backdrop-blur-xl">
      
      {/* Balance Header */}
      <div className="flex items-center justify-between text-xs font-bold tracking-wider text-white/40 mb-1">
        <span>BALANCE</span>
        <span className="text-white font-mono flex items-center gap-1.5">
          <span style={{ color }}>{CURRENCY_ICONS[currency]}</span>
          {balance.toFixed(currency === 'BTC' ? 8 : 2)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-white/20 mt-1">
        <span>BET IN USDT</span>
        <span className="font-mono text-white/30">≈ ${balanceUsdt.toFixed(2)}</span>
      </div>

      {/* Amount Input */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-white" 
             style={{ color: `${color}66` }}>
          ₮
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={e => updateBetAmount(e.target.value)}
          placeholder="0.00"
          disabled={disabled}
          className="w-full bg-[#0a0a0f] border border-[#2a2a35] group-hover:border-[#3a3a45] group-focus-within:border-[#00ff88] rounded-xl pl-10 pr-24 py-3.5 text-white font-bold font-mono outline-none transition-all placeholder-white/10"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button 
            onClick={() => { playClick(); updateBetAmount((balanceUsdt / 2).toFixed(2)); }}
            disabled={disabled}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#1a1a20] text-white/50 hover:bg-[#2a2a30] hover:text-white transition-colors"
          >
            ½
          </button>
          <button 
            onClick={() => { playClick(); updateBetAmount(balanceUsdt.toFixed(2)); }}
            disabled={disabled}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#1a1a20] text-white/50 hover:bg-[#2a2a30] hover:text-white transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Bet Button (Big & Green) */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || disabled}
        className="w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_rgba(0,0,0,0.2)]"
        style={isValid && !disabled ? {
          background: '#00e701',
          color: '#0a0a0f',
          boxShadow: '0 4px 0 0 #00b301',
          textShadow: '0 1px 0 rgba(255,255,255,0.4)'
        } : {
          background: '#2a2a35',
          color: '#ffffff33',
          boxShadow: 'none'
        }}
      >
        {label || "BET"}
      </button>

      {/* Quick Amounts Grid */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {QUICK_USDT_AMOUNTS.map(amt => (
          <button
            key={amt}
            onClick={() => { playClick(); updateBetAmount(amt.toString()); }}
            disabled={disabled}
            className="py-2 rounded-lg text-[10px] font-bold bg-[#1a1a20] text-white/40 hover:bg-[#2a2a30] hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            {amt}
          </button>
        ))}
      </div>
    </div>
  );
}
