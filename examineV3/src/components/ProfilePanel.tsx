import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage, LANGUAGE_NAMES, type Language } from '../context/LanguageContext';
import { setSoundEnabled, isSoundEnabled, playClick, playNavSwitch } from '../utils/sounds';

const CURRENCY_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', TON: '💎', USDT: '₮', STARS: '⭐',
};

const CURRENCY_COLORS: Record<string, string> = {
  BTC: 'from-orange-500 to-yellow-500',
  ETH: 'from-purple-500 to-indigo-500',
  TON: 'from-blue-500 to-cyan-500',
  USDT: 'from-green-500 to-emerald-500',
  STARS: 'from-yellow-400 to-amber-400',
};

const CURRENCIES = ['BTC', 'ETH', 'TON', 'USDT', 'STARS'] as const;

function formatBalance(amount: number, currency: string): string {
  const val = Number(amount) || 0;
  if (currency === 'BTC') return val.toFixed(5);
  if (currency === 'ETH') return val.toFixed(4);
  return val.toFixed(2);
}

export function ProfilePanel() {
  const { wallet, transactions } = useWallet();
  const { t, language, setLanguage } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showLangPicker, setShowLangPicker] = useState(false);

  const safeTx = Array.isArray(transactions) ? transactions : [];
  const totalWins = safeTx.filter(t => t.won).length;
  const winRate = safeTx.length > 0 ? ((totalWins / safeTx.length) * 100).toFixed(1) : '0.0';
  const totalDeposits = safeTx.filter(t => t.type === 'deposit').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClick();
  };

  return (
    <div className="space-y-4">
      {/* Avatar + Name */}
      <div className="bg-gray-800/60 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
          🎰
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg">CryptoBetter</p>
          <p className="text-gray-400 text-sm">@telegram_user</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs text-green-400">Online</span>
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
                <span className="text-sm font-bold text-white">{formatBalance(val, currency)}</span>
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
    </div>
  );
}
