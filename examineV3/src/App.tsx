import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { WalletProvider } from './context/WalletContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { DiceGame } from './games/DiceGame';
import { LimboGame } from './games/LimboGame';
import { CoinFlipGame } from './games/CoinFlipGame';
import { CrashGame } from './games/CrashGame';
import { BlackjackGame } from './games/BlackjackGame';
import { DiamondMinesGame } from './games/DiamondMinesGame';
import { SlotsGame } from './games/SlotsGame';
import { HistoryPanel } from './components/HistoryPanel';
import { EarnPanel } from './components/EarnPanel';
import { CryptoPriceTicker, CryptoPriceList } from './components/CryptoPrices';
import { useWallet, getDailyBonusAvailable, getNextDailyBonusTime } from './context/WalletContext';
import { playClick, playNavSwitch, stopAllGameSounds, playWin } from './utils/sounds';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { LiveWinsFeed } from './components/LiveWinsFeed';
import { SplashScreen } from './components/SplashScreen';
import { ProfilePanel } from './components/ProfilePanel';
import {
  IconCrash, IconMines, IconDice, IconBlackjack, IconCoinFlip, IconSlots, IconLimbo,
  IconBitcoin, IconTON, IconUSDT, IconStars, IconEthereum,
  IconHistory, IconWallet, IconEarn, IconProfile
} from './components/Icons';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ProvablyFairPage } from './components/ProvablyFairPage';
import { Analytics } from '@vercel/analytics/react';
import { Tab } from './types';

type GameId = 'dice' | 'coinflip' | 'crash' | 'blackjack' | 'mines' | 'slots' | 'limbo';

const GAME_COLORS: Record<GameId, { neon: string; bg: string; border: string }> = {
  dice:      { neon: '#00FFAA', bg: 'rgba(0,255,170,0.06)', border: 'rgba(0,255,170,0.2)' },
  coinflip:  { neon: '#FFD700', bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.2)' },
  crash:     { neon: '#FF0055', bg: 'rgba(255,0,85,0.06)', border: 'rgba(255,0,85,0.2)' },
  blackjack: { neon: '#A855F7', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },
  mines:     { neon: '#06B6D4', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
  slots:     { neon: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  limbo:     { neon: '#8B5CF6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)' },
};
const GAME_ICONS: Record<GameId, React.ReactNode> = {
  dice: <IconDice className="w-full h-full" />,
  coinflip: <IconCoinFlip className="w-full h-full" />,
  crash: <IconCrash className="w-full h-full" />,
  blackjack: <IconBlackjack className="w-full h-full" />,
  mines: <IconMines className="w-full h-full" />,
  slots: <IconSlots className="w-full h-full" />,
  limbo: <IconLimbo className="w-full h-full" />,
};

function PremiumBackground() {
  return (
    <>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #FFD700, transparent 70%)', animation: 'orb-float-1 20s ease-in-out infinite' }} />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #00FFAA, transparent 70%)', animation: 'orb-float-2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.015]"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }} />
      </div>
      {/* Subtle noise texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
    </>
  );
}

// ─── Wallet Tab ──────────────────────────────────────────────────────────────
function WalletTab() {
  const { wallet, transactions, redeemReferral } = useWallet();
  const { t } = useLanguage();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  
  const handleRedeem = () => {
    if (!promoCode) return;
    const success = redeemReferral(promoCode);
    if (success) {
      playWin();
      setShowRedeem(false);
      setPromoCode('');
      // Optionally show success message
    } else {
      // Show error (already referred or invalid)
      const input = document.getElementById('promo-input');
      if (input) {
        input.classList.add('animate-shake');
        setTimeout(() => input.classList.remove('animate-shake'), 500);
      }
    }
  };

  const CURRENCY_ICONS: Record<string, React.ReactNode> = {
    BTC: <IconBitcoin className="w-6 h-6" />,
    ETH: <IconEthereum className="w-6 h-6" />,
    TON: <IconTON className="w-6 h-6" />,
    USDT: <IconUSDT className="w-6 h-6" />,
    STARS: <IconStars className="w-6 h-6" />
  };
  const CURRENCY_COLORS: Record<string, string> = { BTC: '#f7931a', ETH: '#627eea', TON: '#06B6D4', USDT: '#26a17b', STARS: '#FFD700' };
  const CURRENCY_NAMES: Record<string, string> = { BTC: 'Bitcoin', ETH: 'Ethereum', TON: 'TON', USDT: 'Tether', STARS: 'Telegram Stars' };
  const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };
  const fmtUSD = (amount: number, currency: string) => {
    const usd = (Number(amount) || 0) * (USD_RATES[currency] ?? 0);
    if (usd >= 1000) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${usd.toFixed(2)}`;
  };

  const totalDeposited = transactions?.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0) || 0;
  const totalWon = transactions?.filter(t => t.won && t.type !== 'deposit').reduce((s, t) => s + t.amount, 0) || 0;
  const totalLost = transactions?.filter(t => !t.won).reduce((s, t) => s + t.amount, 0) || 0;

  const DISPLAY_CURRENCIES = ['BTC', 'ETH', 'TON', 'USDT', 'STARS'];

  return (
    <div className="space-y-5">
      {/* Deposit + Withdraw + Redeem Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { playClick(); setShowDeposit(true); }}
          className="btn-premium-gold py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-heading)' }}>
          ⚡ {t.deposit}
        </button>
        <button
          onClick={() => { playClick(); setShowWithdraw(true); }}
          className="py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all active:scale-95"
          style={{
            background: 'rgba(255,0,85,0.08)',
            border: '1px solid rgba(255,0,85,0.2)',
            color: '#FF0055',
            fontFamily: 'var(--font-heading)',
          }}>
          💸 {t.withdraw}
        </button>
        <button
          onClick={() => { playClick(); setShowRedeem(true); }}
          className="py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all active:scale-95"
          style={{
            background: 'rgba(0,255,170,0.08)',
            border: '1px solid rgba(0,255,170,0.2)',
            color: '#00FFAA',
            fontFamily: 'var(--font-heading)',
          }}>
          🎟 REDEEM
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'DEPOSITED', value: totalDeposited.toFixed(2), color: '#FFD700' },
          { label: 'WON', value: totalWon.toFixed(2), color: '#00FFAA' },
          { label: 'LOST', value: totalLost.toFixed(2), color: '#FF0055' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xl font-extrabold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] mt-1 font-semibold tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Wallet Cards */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: 'rgba(255,215,0,0.4)' }}>{(t.walletBalances || 'Wallet Balances').toUpperCase?.() ?? 'WALLET BALANCES'}</p>
        {DISPLAY_CURRENCIES.map(currency => {
          const balance = wallet[currency as keyof typeof wallet] as number;
          if (typeof balance !== 'number') return null;
          
          const color = CURRENCY_COLORS[currency];
          const pct = Math.min(100, (balance / (currency === 'BTC' ? 0.1 : currency === 'ETH' ? 5 : currency === 'STARS' ? 10000 : 2000)) * 100);
          const fmt = fmtUSD(balance, currency);

          return (
            <div key={currency} className="rounded-2xl p-4" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <span style={{ color }}>{CURRENCY_ICONS[currency]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{currency}</p>
                      <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{CURRENCY_NAMES[currency]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold tabular-nums" style={{ color }}>{fmt}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent deposits */}
      {transactions.filter(t => t.type === 'deposit').length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: 'rgba(168,85,247,0.4)' }}>{t.recentDeposits.toUpperCase?.() ?? t.recentDeposits}</p>
          {transactions.filter(t => t.type === 'deposit').slice(0, 5).map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: 'rgba(0,255,170,0.08)', border: '1px solid rgba(0,255,170,0.15)' }}>💳</div>
                <div>
                  <p className="text-xs font-bold text-white">{t.deposit}</p>
                  <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums" style={{ color: '#00FFAA' }}>
                +{tx.amount.toFixed(4)} {tx.currency}
              </p>
            </div>
          ))}
        </div>
      )}

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
      
      {/* Redeem Modal */}
      {showRedeem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRedeem(false)}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{ background: '#13131f', border: '1px solid #1e1e3a' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.2)' }}>
                  🎟
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Redeem Code</h3>
                <p className="text-xs text-gray-400">Enter your promo code to claim bonus</p>
              </div>
              
              <input
                id="promo-input"
                type="text"
                placeholder="Enter Code (e.g. BONUS2026)"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                className="w-full bg-[#0a0a0f] border border-[#1e1e3a] rounded-xl px-4 py-3 text-center font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00FFAA]"
              />
              
              <button
                onClick={handleRedeem}
                disabled={!promoCode}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ background: '#00FFAA', color: '#000' }}>
                ACTIVATE BONUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────
// (moved to src/components/ProfilePanel.tsx)

// ─── Main App ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { t } = useLanguage();
  const { claimDailyBonus } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('games');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [dailyAvailable, setDailyAvailable] = useState(getDailyBonusAvailable);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const available = getDailyBonusAvailable();
      setDailyAvailable(available);
      if (!available) {
        const nextTime = getNextDailyBonusTime();
        const diff = Math.max(0, nextTime - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };
    
    updateTimer(); // Initial check
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const GAMES: { id: GameId; name: string; tag: string; desc: string; imageColor: string }[] = [
    { id: 'crash',     name: 'CRASH',     tag: 'LIVE',     desc: 'Cash out before crash', imageColor: 'linear-gradient(135deg, #ff0055 0%, #ff00aa 100%)' },
    { id: 'dice',      name: 'CLASSIC DICE', tag: 'CLASSIC',  desc: 'Roll over or under', imageColor: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 'blackjack', name: 'BLACKJACK', tag: 'CARD',     desc: 'Beat the dealer', imageColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'mines',     name: 'MINES',     tag: 'SKILL',    desc: 'Avoid the mines', imageColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'coinflip',  name: 'COIN FLIP', tag: '50/50',    desc: 'Heads or tails', imageColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'limbo',     name: 'LIMBO',     tag: 'ROCKET',   desc: 'Fly to moon',    imageColor: 'linear-gradient(135deg, #8b5cf6 0%, #d8b4fe 100%)' },
    { id: 'slots',     name: 'SLOTS',     tag: 'CASINO',   desc: 'Spin to win', imageColor: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  ];

  const NAV_TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'games',   label: t.games,   icon: <IconDice className="w-6 h-6" />, color: '#FFD700' },
    { id: 'history', label: t.history, icon: <IconHistory className="w-6 h-6" />, color: '#A855F7' },
    { id: 'wallet',  label: t.wallet,  icon: <IconWallet className="w-6 h-6" />, color: '#00FFAA' },
    { id: 'earn',    label: t.earn,    icon: <IconEarn className="w-6 h-6" />, color: '#06B6D4' },
    { id: 'profile', label: t.profile, icon: <IconProfile className="w-6 h-6" />, color: '#FF0055' },
  ];

  // Зупинити всі звуки гри при виході з гри або перемиканні табу (щоб на головному меню не лишався звук crash)
  useEffect(() => {
    return () => { stopAllGameSounds(); };
  }, [activeGame, activeTab]);

  // На головному меню (список ігор) гарантовано вимкнути всі звуки ігор
  useLayoutEffect(() => {
    if (activeTab === 'games' && !activeGame) stopAllGameSounds();
  }, [activeTab, activeGame]);

  const handleBackFromGame = () => {
    stopAllGameSounds();
    playClick();
    setActiveGame(null);
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'dice':      return <DiceGame />;
      case 'coinflip':  return <CoinFlipGame />;
      case 'crash':     return <CrashGame />;
      case 'blackjack': return <BlackjackGame />;
      case 'mines':     return <DiamondMinesGame />;
      case 'slots':     return <SlotsGame />;
      case 'limbo':     return <LimboGame />;
      default:          return null;
    }
  };

  const currentGame = GAMES.find(g => g.id === activeGame);

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-screen-2xl min-h-screen flex flex-col relative shadow-2xl overflow-hidden" style={{ background: '#0D0D0D', color: 'white', fontFamily: 'var(--font-body)' }}>
      <PremiumBackground />
      <Header />
      <CryptoPriceTicker />
      <div className="hidden lg:block relative z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2">
            {NAV_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playNavSwitch();
                    if (tab.id !== 'games') { stopAllGameSounds(); setActiveGame(null); }
                    setActiveTab(tab.id as Tab);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                  style={
                    isActive
                      ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: tab.color }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <span style={{ color: isActive ? tab.color : 'inherit' }}>{tab.icon}</span>
                    {tab.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-28 lg:pb-6 relative z-10">

        {/* ═══ GAMES TAB ═══ */}
        {activeTab === 'games' && (
          <div className="p-4 lg:p-6 xl:p-8 space-y-4">
            {activeGame ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackFromGame}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8">{GAME_ICONS[activeGame]}</div>
                    <h1 className="text-base font-extrabold truncate font-heading tracking-wide"
                      style={{ color: GAME_COLORS[activeGame].neon }}>
                      {currentGame?.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold tracking-[0.15em] flex-shrink-0"
                      style={{ background: GAME_COLORS[activeGame].bg, border: `1px solid ${GAME_COLORS[activeGame].border}`, color: GAME_COLORS[activeGame].neon }}>
                      {currentGame?.tag}
                    </span>
                  </div>
                </div>
                {renderGame()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl p-5" style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] font-medium" style={{ color: 'rgba(255,215,0,0.5)' }}>PREMIUM GAMES</p>
                      <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide">GAME LOBBY</h2>
                    </div>
                    <div className="flex gap-1.5">
                      {['ALL', 'ORIGINALS', 'LIVE', 'SLOTS'].map((tab, i) => (
                        <span key={tab} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider transition-all cursor-pointer"
                          style={{
                            background: i === 0 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            color: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.4)',
                          }}>
                          {tab}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1800px]:grid-cols-7 min-[2200px]:grid-cols-8 gap-4 lg:gap-6">
                  {GAMES.map(game => {
                    return (
                      <button key={game.id}
                        onClick={() => { playClick(); setActiveGame(game.id as GameId); }}
                        className="game-card group relative h-48 sm:h-56 lg:h-60 xl:h-64 transition-all duration-400 active:scale-[0.97]"
                        style={{ background: game.imageColor }}>

                        {/* Glass shine overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Tag badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-[0.15em] uppercase"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: 'rgba(255,255,255,0.9)',
                            }}>
                            {game.name}
                          </span>
                        </div>

                        {/* Icon — centered, large */}
                        <div className="absolute inset-0 flex items-center justify-center pb-8 z-10">
                          <div className="w-24 h-24 transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500 ease-out drop-shadow-2xl"
                            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}>
                            {GAME_ICONS[game.id as GameId]}
                          </div>
                        </div>

                        {/* Bottom info — glass overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 z-10">
                          <p className="text-sm font-extrabold text-white uppercase tracking-wider font-heading drop-shadow-lg">{game.name}</p>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md"
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                              RTP 99%
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FFAA', boxShadow: '0 0 6px #00FFAA' }} />
                              <span className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{game.tag}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Daily Bonus */}
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: !dailyAvailable ? 'rgba(0,255,170,0.04)' : 'rgba(255,215,0,0.04)',
                    border: `1px solid ${!dailyAvailable ? 'rgba(0,255,170,0.15)' : 'rgba(255,215,0,0.15)'}`,
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-float flex-shrink-0"
                    style={{
                      background: !dailyAvailable ? 'rgba(0,255,170,0.1)' : 'rgba(255,215,0,0.1)',
                      border: `1px solid ${!dailyAvailable ? 'rgba(0,255,170,0.2)' : 'rgba(255,215,0,0.2)'}`,
                    }}>
                    {!dailyAvailable ? '⏳' : '🎁'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{t.dailyBonus}</p>
                    <p className="text-xs mt-0.5" style={{ color: !dailyAvailable ? 'rgba(0,255,170,0.6)' : 'rgba(255,215,0,0.6)' }}>
                      {!dailyAvailable ? `Next bonus in: ${timeLeft}` : 'Claim 1 Star every day for free'}
                    </p>
                  </div>
                  {dailyAvailable && (
                    <button onClick={() => {
                      playClick();
                      const ok = claimDailyBonus();
                      if (ok) { setDailyAvailable(false); }
                    }}
                      className="btn-premium-gold flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold tracking-wide active:scale-95 disabled:opacity-40"
                      style={{ fontFamily: 'var(--font-heading)' }}>
                      {t.claim}
                    </button>
                  )}
                </div>

                {/* Live Wins Feed */}
                <LiveWinsFeed />

                {/* Earn promo banner */}
                <button
                  onClick={() => { playClick(); stopAllGameSounds(); setActiveTab('earn'); }}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] text-left"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,170,0.06), rgba(255,215,0,0.04))',
                    border: '1px solid rgba(0,255,170,0.12)',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-float flex-shrink-0"
                    style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.2)' }}>
                    <IconEarn size={28} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white font-heading tracking-wide">EARN FREE CRYPTO</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(0,255,170,0.5)' }}>Watch ads · Referrals · TikTok rewards</p>
                  </div>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgba(0,255,170,0.4)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Live Prices Section */}
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] mb-3" style={{ color: 'rgba(255,215,0,0.4)' }}>LIVE CRYPTO PRICES</p>
                  <CryptoPriceList />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {activeTab === 'history' && (
          <div className="p-4 lg:p-6 xl:p-8 space-y-4">
            <LiveWinsFeed />
            <HistoryPanel />
          </div>
        )}

        {/* ═══ WALLET TAB ═══ */}
        {activeTab === 'wallet' && <div className="p-4 lg:p-6 xl:p-8"><WalletTab /></div>}

        {/* ═══ EARN TAB ═══ */}
        {activeTab === 'earn' && <div className="p-4 lg:p-6 xl:p-8"><EarnPanel /></div>}

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div className="p-4 lg:p-6 xl:p-8 space-y-6">
            <ProfilePanel />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] mb-3" style={{ color: 'rgba(255,215,0,0.4)' }}>LIVE CRYPTO PRICES</p>
              <CryptoPriceList />
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Bottom Navigation — Premium Glass */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: 'rgba(13,13,13,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), rgba(0,255,170,0.15), rgba(168,85,247,0.12), transparent)' }} />
        <div className="flex items-center justify-around px-2 py-2.5 max-w-lg mx-auto">
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => {
                  playNavSwitch();
                  if (tab.id !== 'games') { stopAllGameSounds(); setActiveGame(null); }
                  setActiveTab(tab.id as Tab);
                }}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-300 relative"
                style={isActive ? { background: 'rgba(255,255,255,0.06)' } : {}}>
                {isActive && (
                  <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                    style={{ background: tab.color, boxShadow: `0 0 12px ${tab.color}88` }} />
                )}
                <span className="transition-all duration-300"
                  style={{
                    color: isActive ? tab.color : 'rgba(255,255,255,0.25)',
                    filter: isActive ? `drop-shadow(0 0 6px ${tab.color}66)` : 'none',
                  }}>
                  {tab.icon}
                </span>
                <span className="text-[9px] font-semibold tracking-wider transition-all duration-300"
                  style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.25)' }}>
                  {tab.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom,0px)' }} />
      </nav>
    </div>
  );
}

export function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  // Simple router for Privacy Policy
  if (window.location.pathname === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  // Simple router for Terms of Service
  if (window.location.pathname === '/terms-of-service') {
    return <TermsOfService />;
  }

  if (window.location.pathname === '/provably-fair') {
    return <ProvablyFairPage />;
  }

  return (
    <LanguageProvider>
      <WalletProvider>
        {!splashDone && <SplashScreen onDone={handleSplashDone} />}
        <AppInner />
        <Analytics />
      </WalletProvider>
    </LanguageProvider>
  );
}
