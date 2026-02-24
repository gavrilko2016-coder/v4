import { useState, useEffect } from 'react';
import { IconBitcoin, IconEthereum, IconTON, IconUSDT, IconSolana, IconBNB } from './Icons';

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
  color: string;
}

// Seed prices that simulate realistic values
const SEED_PRICES: Omit<CoinPrice, 'price' | 'change24h'>[] = [
  { id: 'bitcoin',  symbol: 'BTC',  name: 'Bitcoin',  icon: <IconBitcoin className="w-5 h-5" />, color: '#f7931a' },
  { id: 'ethereum', symbol: 'ETH',  name: 'Ethereum', icon: <IconEthereum className="w-5 h-5" />, color: '#627eea' },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin', icon: <IconTON className="w-5 h-5" />, color: '#00f5ff' },
  { id: 'tether',   symbol: 'USDT', name: 'Tether',   icon: <IconUSDT className="w-5 h-5" />, color: '#26a17b' },
  { id: 'solana',   symbol: 'SOL',  name: 'Solana',   icon: <IconSolana className="w-5 h-5" />, color: '#9945ff' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB',    icon: <IconBNB className="w-5 h-5" />, color: '#f3ba2f' },
];

const BASE_PRICES: Record<string, number> = {
  bitcoin: 67420,
  ethereum: 3521,
  'the-open-network': 5.84,
  tether: 1.00,
  solana: 178,
  binancecoin: 608,
};

const BASE_CHANGES: Record<string, number> = {
  bitcoin: 2.34,
  ethereum: -1.12,
  'the-open-network': 5.67,
  tether: 0.01,
  solana: 3.45,
  binancecoin: -0.89,
};

// Simulate live price updates locally (no API key needed)
function simulatePriceUpdate(price: number, change: number): { price: number; change: number } {
  const priceDelta = price * (Math.random() * 0.003 - 0.0015); // ±0.15%
  const changeDelta = (Math.random() * 0.1 - 0.05); // ±0.05% on 24h change
  return {
    price: Math.max(0, price + priceDelta),
    change: Math.max(-15, Math.min(15, change + changeDelta)),
  };
}

function formatPrice(price: number, symbol: string): string {
  if (symbol === 'USDT' || symbol === 'BNB') return `$${price.toFixed(2)}`;
  if (symbol === 'TON' || symbol === 'SOL') return `$${price.toFixed(2)}`;
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `$${price.toFixed(4)}`;
}

// ─── Ticker (horizontal scrolling strip) ─────────────────────────────────────
export function CryptoPriceTicker() {
  const [prices, setPrices] = useState<CoinPrice[]>(
    SEED_PRICES.map(s => ({
      ...s,
      price: BASE_PRICES[s.id],
      change24h: BASE_CHANGES[s.id],
    }))
  );

  useEffect(() => {
    const simInterval = setInterval(() => {
      setPrices(prev => prev.map(coin => {
        const updated = simulatePriceUpdate(coin.price, coin.change24h);
        return { ...coin, ...updated };
      }));
    }, 3000);

    return () => {
      clearInterval(simInterval);
    };
  }, []);

  return (
    <div className="overflow-hidden relative"
      style={{ background: '#0a0a0f', borderBottom: '1px solid #1e1e3a' }}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg,#0a0a0f,transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg,#0a0a0f,transparent)' }} />

      <div className="flex gap-6 px-4 py-1.5 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[...prices, ...prices].map((coin, i) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-black" style={{ color: coin.color }}>{coin.icon}</span>
            <span className="text-[10px] font-black font-mono" style={{ color: '#ffffff88' }}>{coin.symbol}</span>
            <span className="text-[10px] font-black font-mono text-white">{formatPrice(coin.price, coin.symbol)}</span>
            <span className={`text-[10px] font-black font-mono`}
              style={{ color: coin.change24h >= 0 ? '#00ff88' : '#ff003c' }}>
              {coin.change24h >= 0 ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full price card list (for dedicated view) ────────────────────────────────
export function CryptoPriceList() {
  const [prices, setPrices] = useState<CoinPrice[]>(
    SEED_PRICES.map(s => ({
      ...s,
      price: BASE_PRICES[s.id],
      change24h: BASE_CHANGES[s.id],
    }))
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    setLoading(false);
    const simInterval = setInterval(() => {
      setPrices(prev => prev.map(coin => {
        const updated = simulatePriceUpdate(coin.price, coin.change24h);
        return { ...coin, ...updated };
      }));
      setLastUpdated(new Date());
    }, 3000);

    return () => { clearInterval(simInterval); };
  }, []);

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <p className="text-[10px] font-black font-mono" style={{ color: '#00ff8888' }}>◈ LIVE PRICES</p>
        </div>
        <p className="text-[10px] font-mono" style={{ color: '#ffffff22' }}>
          {loading ? 'Loading...' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
        </p>
      </div>

      {prices.map(coin => {
        const isUp = coin.change24h >= 0;
        const absPct = Math.abs(coin.change24h);
        const barWidth = Math.min(100, absPct * 5); // visual bar

        return (
          <div key={coin.id}
            className="p-4 rounded-2xl cyber-card transition-all"
            style={{ border: `1px solid ${coin.color}22` }}>
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ background: `${coin.color}22`, border: `1px solid ${coin.color}44`, color: coin.color, boxShadow: `0 0 10px ${coin.color}22` }}>
                {coin.icon}
              </div>

              {/* Name & symbol */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black font-mono" style={{ color: coin.color }}>{coin.symbol}</p>
                    <p className="text-[10px] font-mono" style={{ color: `${coin.color}66` }}>{coin.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black font-mono text-white">
                      {formatPrice(coin.price, coin.symbol)}
                    </p>
                    <p className="text-xs font-black font-mono"
                      style={{ color: isUp ? '#00ff88' : '#ff003c' }}>
                      {isUp ? '▲' : '▼'} {absPct.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* 24h change bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: '#1e1e3a' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      background: isUp
                        ? 'linear-gradient(90deg,#00ff8866,#00ff88)'
                        : 'linear-gradient(90deg,#ff003c66,#ff003c)',
                      boxShadow: `0 0 4px ${isUp ? '#00ff88' : '#ff003c'}66`,
                    }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="p-2.5 rounded-xl text-center text-[10px] font-mono"
        style={{ background: '#00f5ff08', border: '1px solid #00f5ff22', color: '#00f5ff44' }}>
        📡 Prices are simulated locally · Auto-refresh every 3s
      </div>
    </div>
  );
}
