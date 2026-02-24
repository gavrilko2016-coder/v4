import { useState, useEffect, useRef } from 'react';

interface WinEntry {
  id: string;
  username: string;
  game: string;
  amount: number;
  currency: string;
  multiplier: number;
  timestamp: Date;
  avatar: string;
}

const TG_USERNAMES = [
  'crypto_wolf','ton_whale','degen_king','moon_bet','satoshi99','eth_rider',
  'hodl_master','neon_tiger','cyber_fox','blast_bet','lucky_ace','dark_horse',
  'ape_gang','bull_run','bear_trap','flash_win','ton_god','jet_setter',
  'crypto_q','nft_legend','spin_king','gg_player','ultra_bet','vip_roller',
  'diamond_hands','paper_hands','big_brain','zero_loss','max_profit','fire_lord',
];

const GAMES = ['DICE', 'COIN FLIP', 'CRASH', 'BLACKJACK', 'MINES', 'SLOTS'];
const CURRENCIES = ['TON', 'USDT', 'ETH', 'BTC'];
const AVATARS = ['🐺','🐋','👑','🚀','🎯','💎','🔥','⚡','🎰','🃏','🦁','🐯','🦊','🤖','👾'];

const CURRENCY_COLORS: Record<string, string> = {
  TON: '#00f5ff', USDT: '#26a17b', ETH: '#627eea', BTC: '#f7931a',
};

function generateWin(): WinEntry {
  const currency = CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)];
  const multiplier = +(1.5 + Math.random() * 18).toFixed(2);
  const baseAmounts: Record<string, number> = { TON: 5, USDT: 10, ETH: 0.01, BTC: 0.0003 };
  const base = baseAmounts[currency];
  const betAmt = +(base * (0.5 + Math.random() * 4)).toFixed(4);
  const amount = +(betAmt * multiplier).toFixed(4);

  return {
    id: crypto.randomUUID(),
    username: TG_USERNAMES[Math.floor(Math.random() * TG_USERNAMES.length)],
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    amount,
    currency,
    multiplier,
    timestamp: new Date(),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  };
}

// Pre-generate initial entries
function generateInitialFeed(): WinEntry[] {
  return Array.from({ length: 12 }, () => {
    const entry = generateWin();
    // Stagger timestamps
    entry.timestamp = new Date(Date.now() - Math.random() * 300000);
    return entry;
  });
}

export function LiveWinsFeed() {
  const [entries, setEntries] = useState<WinEntry[]>(generateInitialFeed);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add a new win every 2.5–5 seconds
    const schedule = () => {
      const delay = 2500 + Math.random() * 2500;
      return setTimeout(() => {
        const newEntry = generateWin();
        setEntries(prev => [newEntry, ...prev.slice(0, 19)]);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  function timeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <p className="text-[10px] font-black font-mono" style={{ color: '#00ff8888' }}>
            ◈ LIVE WINS FEED
          </p>
        </div>
        <p className="text-[10px] font-mono" style={{ color: '#ffffff22' }}>
          real-time
        </p>
      </div>

      {/* Feed list */}
      <div
        ref={listRef}
        className="space-y-1.5 overflow-y-auto"
        style={{ maxHeight: 280, scrollbarWidth: 'none' }}
      >
        {entries.map((entry, i) => {
          const color = CURRENCY_COLORS[entry.currency] || '#00f5ff';
          const isNew = i === 0;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: isNew ? `${color}0a` : '#13131f',
                border: `1px solid ${isNew ? color + '33' : '#1e1e3a'}`,
                transition: 'all 0.4s ease',
              }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}33`,
                }}
              >
                {entry.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black font-mono text-white truncate max-w-[80px]">
                    @{entry.username}
                  </span>
                  <span
                    className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}22` }}
                  >
                    {entry.game}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-black font-mono" style={{ color: '#ffd700' }}>
                    {entry.multiplier}×
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: '#ffffff33' }}>
                    · {timeAgo(entry.timestamp)}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black font-mono" style={{ color, textShadow: `0 0 8px ${color}66` }}>
                  +{entry.amount < 0.001 ? entry.amount.toFixed(6) : entry.amount < 1 ? entry.amount.toFixed(4) : entry.amount.toFixed(2)}
                </p>
                <p className="text-[9px] font-mono" style={{ color: `${color}66` }}>
                  {entry.currency}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
