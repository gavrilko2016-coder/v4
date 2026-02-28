import { useRef, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { BetControls } from '../components/BetControls';
import { useLanguage } from '../context/LanguageContext';
import { playCoinFlip, playWin, playLoss, playClick } from '../utils/sounds';
import { pfCreateRound, pfRandom, pfReveal } from '../api/provablyFair';
import type { Currency } from '../types';

type Side = 'heads' | 'tails';

const RTP_99_MULTIPLIER = 1.98;

export function CoinFlipGame() {
  const { placeBet, addWinnings, recordLoss, userId } = useWallet();
  const { t } = useLanguage();
  const [flipping, setFlipping] = useState(false);
  const [chosen, setChosen] = useState<Side>('heads');
  const [coinFace, setCoinFace] = useState<Side>('heads');
  const [result, setResult] = useState<{ won: boolean; side: Side; payout: number; currency: Currency } | null>(null);
  const [animPhase, setAnimPhase] = useState(0);
  const nonceRef = useRef(0);

  const handleBet = (amount: number, currency: Currency) => {
    if (!placeBet(amount, currency)) return;
    setFlipping(true);
    setResult(null);
    setAnimPhase(0);
    playCoinFlip();

    nonceRef.current += 1;
    const clientSeed = userId || 'guest';

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setCoinFace(tick % 2 === 0 ? 'heads' : 'tails');
      setAnimPhase(tick % 4);
      if (tick >= 16) {
        clearInterval(interval);
        (async () => {
          try {
            const { roundId } = await pfCreateRound();
            const { random } = await pfRandom(roundId, clientSeed, nonceRef.current);
            const outcome: Side = random < 0.5 ? 'heads' : 'tails';
            void (await pfReveal(roundId));

            setCoinFace(outcome);
            setAnimPhase(0);
            const won = outcome === chosen;
            const payout = won ? +(amount * RTP_99_MULTIPLIER).toFixed(8) : 0;
            if (won) { addWinnings(payout, currency, 'Coin Flip'); playWin(); }
            else { recordLoss(amount, currency, 'Coin Flip'); playLoss(); }
            setResult({ won, side: outcome, payout, currency });
          } catch {
            recordLoss(amount, currency, 'Coin Flip');
            playLoss();
            setResult({ won: false, side: chosen === 'heads' ? 'tails' : 'heads', payout: 0, currency });
          } finally {
            setFlipping(false);
          }
        })();
      }
    }, 90);
  };

  const scaleX = flipping ? Math.abs(Math.cos(animPhase * Math.PI / 2)) : 1;

  return (
    <div className="space-y-4">
      {/* Coin Display */}
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center cyber-card"
        style={{ border: '1px solid #ffd70033', minHeight: 180 }}>
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black transition-all"
          style={{
            background: coinFace === 'heads'
              ? 'radial-gradient(circle at 35% 35%, #ffd700, #b8860b)'
              : 'radial-gradient(circle at 35% 35%, #d0d0d0, #888)',
            border: `4px solid ${coinFace === 'heads' ? '#ffd700' : '#cccccc'}`,
            boxShadow: `0 0 30px ${coinFace === 'heads' ? '#ffd70066' : '#cccccc44'}`,
            transform: `scaleX(${flipping ? scaleX : 1})`,
            transition: flipping ? 'transform 0.05s' : 'all 0.3s ease',
          }}
        >
          {coinFace === 'heads' ? '₿' : '🌕'}
        </div>
        <p className="mt-4 text-xs font-mono font-black"
          style={{ color: coinFace === 'heads' ? '#ffd700' : '#cccccc' }}>
          {flipping ? 'FLIPPING...' : (coinFace === 'heads' ? t.heads : t.tails)}
        </p>
      </div>

      {/* Result */}
      {result && !flipping && (
        <div className={`text-center py-3 rounded-xl font-black font-mono text-sm ${result.won
          ? 'bg-[#00ff8811] border border-[#00ff8844] text-[#00ff88]'
          : 'bg-[#ff003c11] border border-[#ff003c44] text-[#ff003c]'}`}>
          {result.won
            ? `🎉 ${result.side.toUpperCase()}! +${result.payout.toFixed(4)} ${result.currency}`
            : `💸 ${result.side.toUpperCase()}! NO WIN!`}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: t.winChance, value: '50%', color: '#ffd700' },
          { label: t.multiplier, value: '1.98×', color: '#00f5ff' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center cyber-card" style={{ border: `1px solid ${s.color}33` }}>
            <p className="text-sm font-black font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] mt-0.5 font-mono" style={{ color: `${s.color}66` }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Side picker */}
      <div className="rounded-2xl p-4 cyber-card space-y-2" style={{ border: '1px solid #1e1e3a' }}>
        <p className="text-xs font-mono font-black mb-2" style={{ color: '#ffd70088' }}>{t.chooseSide.toUpperCase()}</p>
        <div className="grid grid-cols-2 gap-3">
          {(['heads', 'tails'] as const).map(s => (
            <button key={s}
              onClick={() => { playClick(); setChosen(s); }}
              disabled={flipping}
              className="py-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95 flex flex-col items-center gap-2"
              style={chosen === s ? {
                background: s === 'heads' ? '#ffd70022' : '#cccccc22',
                border: `1px solid ${s === 'heads' ? '#ffd700' : '#cccccc'}66`,
                color: s === 'heads' ? '#ffd700' : '#cccccc',
                boxShadow: `0 0 15px ${s === 'heads' ? '#ffd700' : '#cccccc'}33`,
              } : { background: '#0f0f1a', border: '1px solid #1e1e3a', color: '#ffffff44' }}>
              <span className="text-2xl">{s === 'heads' ? '₿' : '🌕'}</span>
              <span>{s === 'heads' ? t.heads : t.tails}</span>
            </button>
          ))}
        </div>
      </div>

      <BetControls onBet={handleBet} disabled={flipping} label={flipping ? t.flipping : t.flipCoin} />
    </div>
  );
}
