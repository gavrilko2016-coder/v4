import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage, LANGUAGE_NAMES, type Language } from '../context/LanguageContext';
import { setSoundEnabled, isSoundEnabled, playClick, playNavSwitch } from '../utils/sounds';
import { IconBitcoin, IconEthereum, IconTON, IconUSDT, IconStars } from './Icons';
import type { Currency } from '../types';
import { AdminPanel } from './AdminPanel';

export function ProfilePanel() {
  const { wallet, transactions, userId, redeemReferral } = useWallet();
  const { t, language, setLanguage } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [refStatus, setRefStatus] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const safeTx = Array.isArray(transactions) ? transactions : [];
  const totalWins = safeTx.filter(t => t.won).length;
  const winRate = safeTx.length > 0 ? ((totalWins / safeTx.length) * 100).toFixed(1) : '0.0';
  const totalDeposits = safeTx.filter(t => t.type === 'deposit').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const handleRedeem = () => {
    if (redeemReferral(refCode)) {
      setRefStatus('Success! $50 Bonus Added.');
      playClick();
    } else {
      setRefStatus('Invalid code or already redeemed.');
    }
    setTimeout(() => setRefStatus(''), 3000);
  };

  const CURRENCIES: Currency[] = ['STARS', 'TON', 'USDT', 'ETH', 'BTC'];
  const CURRENCY_COLORS: Record<string, string> = { 
    BTC: 'from-orange-500 to-yellow-500', 
    ETH: 'from-purple-500 to-indigo-500', 
    TON: 'from-blue-500 to-cyan-500', 
    USDT: 'from-green-500 to-emerald-500', 
    STARS: 'from-yellow-400 to-amber-400' 
  };
  
  const CURRENCY_ICONS: Record<string, React.ReactNode> = {
    BTC: <IconBitcoin className="w-5 h-5" />,
    ETH: <IconEthereum className="w-5 h-5" />,
    TON: <IconTON className="w-5 h-5" />,
    USDT: <IconUSDT className="w-5 h-5" />,
    STARS: <IconStars className="w-5 h-5" />,
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClick();
  };

  const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };
  function formatUsd(amount: number, currency: string): string {
    const usd = (Number(amount) || 0) * (USD_RATES[currency] ?? 0);
    if (usd >= 1000) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${usd.toFixed(2)}`;
  }

  return (
    <div className="space-y-4">
      {/* Avatar + Name */}
      <div className="bg-gray-800/60 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
          🎰
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg">CryptoBetter</p>
          <p className="text-gray-400 text-sm">ID: {userId}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs text-green-400">{t.online}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total deposited</p>
          <p className="text-sm font-bold text-yellow-400">${totalDeposits.toFixed(2)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/60 rounded-xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-black text-white">{safeTx.filter(t => t.type !== 'deposit').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t?.totalBets || 'Bets'}</p>
        </div>
        <div className="bg-gray-800/60 rounded-xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-black text-green-400">{totalWins}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t?.wins || 'Wins'}</p>
        </div>
        <div className="bg-gray-800/60 rounded-xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-black text-yellow-400">{winRate}%</p>
          <p className="text-xs text-gray-500 mt-0.5">{t?.winRate || 'Rate'}</p>
        </div>
      </div>

      {/* Wager Progress */}
      {(wallet.wagering_required > 0 || wallet.bonus_balance > 0) && (
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-sm font-bold text-white">Bonus Wager Progress</p>
            <p className="text-xs text-gray-400">
              ${wallet.wagering_progress.toFixed(2)} / ${wallet.wagering_required.toFixed(2)}
            </p>
          </div>
          <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (wallet.wagering_progress / (wallet.wagering_required || 1)) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500">
            Wager x15 of bonus amount to unlock withdrawals.
          </p>
        </div>
      )}

      {/* Referral Code Redemption */}
      {!wallet.referred_by && (
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-white/5 space-y-3">
          <p className="text-sm font-bold text-white">Redeem Referral Code</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              placeholder="Enter code (e.g. REF123)"
              className="flex-1 bg-gray-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
            />
            <button 
              onClick={handleRedeem}
              className="px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded-xl active:scale-95 transition-transform"
            >
              Redeem
            </button>
          </div>
          {refStatus && (
            <p className={`text-xs ${refStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
              {refStatus}
            </p>
          )}
        </div>
      )}

      {/* Wallet Balances */}
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-white/5 space-y-3">
        <p className="text-sm font-bold text-gray-300">{t?.walletBalances || 'Wallet'}</p>
        {CURRENCIES.map((currency) => {
          const balance = (wallet as any)?.[currency] ?? 0;
          const gradient = CURRENCY_COLORS[currency] ?? 'from-gray-600 to-gray-700';
          const icon = CURRENCY_ICONS[currency] ?? '◈';
          const val = Number(balance) || 0;
          const pct = Math.min(100, (val / (currency === 'BTC' ? 0.1 : currency === 'ETH' ? 5 : 2000)) * 100);
          
          return (
          <div key={currency} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{currency}</span>
                <span className="text-sm font-bold text-white">{formatUsd(val, currency)}</span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Settings */}
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-white/5 space-y-3">
        <p className="text-sm font-bold text-gray-300">{t?.settings || 'Settings'}</p>

        {/* Admin Access (Hidden in production normally) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => { playClick(); setShowAdmin(true); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors"
          >
            Open Dashboard
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{soundOn ? '🔊' : '🔇'}</span>
            <span className="text-sm text-white">{t?.sound || 'Sound'}</span>
          </div>
          <button
            onClick={toggleSound}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${soundOn ? 'bg-yellow-500' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${soundOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="text-sm text-white">{t?.language || 'Language'}</span>
          </div>
          <button
            onClick={() => { playClick(); setShowLangPicker(v => !v); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition-colors"
          >
            {LANGUAGE_NAMES[language]}
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showLangPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Language Picker Dropdown */}
        {showLangPicker && (
          <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
            {(Object.keys(LANGUAGE_NAMES) as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => {
                  playNavSwitch();
                  setLanguage(lang);
                  setShowLangPicker(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-sm ${lang === language ? 'bg-gray-800/60 text-yellow-400 font-bold' : 'text-white'}`}
              >
                <span className="flex-1 text-left">{LANGUAGE_NAMES[lang]}</span>
                {lang === language && (
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-white/5 space-y-3">
        <p className="text-sm font-bold text-gray-300">{t?.achievements || 'Achievements'}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs font-semibold text-yellow-400">🎖 First Bet</span>
          <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-semibold text-blue-400">💎 HODLer</span>
          <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs font-semibold text-purple-400">🚀 Degen</span>
          <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-xs font-semibold text-green-400">🃏 Card Shark</span>
          <span className="px-3 py-1.5 bg-gray-700/50 border border-white/10 rounded-lg text-xs font-semibold text-gray-500">🔒 ???</span>
          <span className="px-3 py-1.5 bg-gray-700/50 border border-white/10 rounded-lg text-xs font-semibold text-gray-500">🔒 ???</span>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-xs text-gray-400 text-center">
        🛡 Play responsibly · 18+ · CryptoBet
      </div>

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
