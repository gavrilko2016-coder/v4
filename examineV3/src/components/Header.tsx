import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { OnlineCounter } from './OnlineCounter';
import { DepositModal } from './DepositModal';
import { playClick } from '../utils/sounds';
import type { Currency } from '../types';
import { IconUSDT, IconBitcoin, IconTON, IconStars, IconEthereum } from './Icons';
import { CryptoBetLogo } from './SplashScreen';

const CURRENCY_ICONS: Record<Currency, React.ReactNode> = {
  BTC: <IconBitcoin className="w-5 h-5" />,
  ETH: <IconEthereum className="w-5 h-5" />,
  TON: <IconTON className="w-5 h-5" />,
  USDT: <IconUSDT className="w-5 h-5" />,
  STARS: <IconStars className="w-5 h-5" />,
};
const CURRENCY_COLORS: Record<Currency, string> = {
  BTC: '#f7931a', ETH: '#627eea', TON: '#00f5ff', USDT: '#26a17b', STARS: '#ffd700',
};
const CURRENCIES: Currency[] = ['STARS', 'TON', 'USDT', 'ETH', 'BTC'];

function formatBalance(amount: number, currency: Currency): string {
  if (currency === 'BTC') return amount.toFixed(5);
  if (currency === 'ETH') return amount.toFixed(4);
  if (currency === 'STARS') return Math.floor(amount).toString();
  return amount.toFixed(2);
}

export function Header() {
  const { wallet, selectedCurrency, setSelectedCurrency } = useWallet();
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50"
        style={{
          background: 'rgba(13,13,13,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        {/* Top gold accent line */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), rgba(0,255,170,0.3), transparent)' }} />

        <div className="flex items-center justify-between px-4 py-3 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 flex-shrink-0">
              <CryptoBetLogo size={40} />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-wide leading-none font-heading"
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00ffcc, #bf00ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                CryptoBet
              </p>
              <p className="text-[9px] leading-none mt-0.5 tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>PREMIUM CASINO</p>
            </div>
          </div>

          {/* Online Counter */}
          <OnlineCounter />

          {/* Deposit Button — Premium Gold */}
          <button onClick={() => { playClick(); setShowDeposit(true); }}
            className="btn-premium-gold flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide active:scale-95 flex-shrink-0"
            style={{ fontFamily: 'var(--font-heading)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t.deposit}
          </button>

          {/* Wallet Balance */}
          <div className="relative flex-shrink-0">
            <button onClick={() => { playClick(); setShowDropdown(v => !v); }}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${CURRENCY_COLORS[selectedCurrency]}15` }}>
                <span style={{ color: CURRENCY_COLORS[selectedCurrency] }}>
                  {CURRENCY_ICONS[selectedCurrency]}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[9px] leading-none tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {selectedCurrency}
                </p>
                <p className="text-sm font-bold leading-tight text-white tabular-nums">
                  {formatBalance(wallet[selectedCurrency], selectedCurrency)}
                </p>
              </div>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 animate-slide-up"
                style={{
                  background: 'rgba(18,18,18,0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                }}>
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)' }} />
                {CURRENCIES.map(c => (
                  <button key={c}
                    onClick={() => { playClick(); setSelectedCurrency(c); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.04]"
                    style={{
                      background: c === selectedCurrency ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${CURRENCY_COLORS[c]}12` }}>
                      <span style={{ color: CURRENCY_COLORS[c] }}>{CURRENCY_ICONS[c]}</span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[10px] font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{c}</p>
                      <p className="text-sm font-bold text-white tabular-nums">{formatBalance(wallet[c], c)}</p>
                    </div>
                    {c === selectedCurrency && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#FFD700' }}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
    </>
  );
}
