import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { BetControls } from '../components/BetControls';
import { useLanguage } from '../context/LanguageContext';
import { playDiceRoll, playWin, playLoss, playClick } from '../utils/sounds';
import type { Currency } from '../types';

const WIN_RATE = 0.7;

export function DiceGame() {
  const { placeBet, addWinnings, recordLoss } = useWallet();
  const { t } = useLanguage();
  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([3, 4]);
  const [target, setTarget] = useState(7);
  const [mode, setMode] = useState<'over' | 'under'>('over');
  const [result, setResult] = useState<{ won: boolean; payout: number; currency: Currency; roll: number } | null>(null);
  const [animating, setAnimating] = useState(false);

  // Helper to calculate probability for 2 dice (sum 2-12)
  const getWays = (val: number) => {
    if (val < 2 || val > 12) return 0;
    return 6 - Math.abs(7 - val);
  };

  const calculateStats = (m: 'over' | 'under', tVal: number) => {
    let ways = 0;
    if (m === 'over') {
      // sum > target
      for (let i = tVal + 1; i <= 12; i++) ways += getWays(i);
    } else {
      // sum <= target
      for (let i = 2; i <= tVal; i++) ways += getWays(i);
    }
    const chance = ways / 36;
    const wc = (chance * 100).toFixed(2);
    const mult = chance > 0 ? (0.95 / chance).toFixed(2) : '0.00';
    return { winChance: wc, multiplier: Number(mult) };
  };

  const { winChance, multiplier } = calculateStats(mode, target);

  const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

  const handleBet = (amount: number, currency: Currency) => {
    if (!placeBet(amount, currency)) return;
    setRolling(true);
    setResult(null);
    setAnimating(true);
    playDiceRoll();

    let ticks = 0;
    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      ticks++;
      if (ticks >= 14) {
        clearInterval(interval);
        const forceWin = Math.random() < WIN_RATE;

        const winSums: number[] = [];
        const loseSums: number[] = [];
        for (let sum = 2; sum <= 12; sum++) {
          const isWin = mode === 'over' ? sum > target : sum <= target;
          (isWin ? winSums : loseSums).push(sum);
        }
        const chosenPool = forceWin ? winSums : loseSums;
        const desiredSum = chosenPool[Math.floor(Math.random() * chosenPool.length)];

        const pairs: Array<[number, number]> = [];
        for (let a = 1; a <= 6; a++) {
          for (let b = 1; b <= 6; b++) {
            if (a + b === desiredSum) pairs.push([a, b]);
          }
        }
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const roll = desiredSum;
        setDiceValues([d1, d2]);
        setAnimating(false);
        
        const won = mode === 'over' ? roll > target : roll <= target;
        const payout = won ? +(amount * multiplier).toFixed(8) : 0;
        
        if (won) { addWinnings(payout, currency, 'Dice'); playWin(); }
        else { recordLoss(amount, currency, 'Dice'); playLoss(); }
        
        setResult({ won, payout, currency, roll });
        setRolling(false);
      }
    }, 80);
  };

  return (
    <div className="space-y-4">
      {/* Dice Display */}
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center cyber-card"
        style={{ border: '1px solid #00f5ff33', minHeight: 180 }}>
        <div className="flex gap-4">
          {diceValues.map((val, i) => (
            <div
              key={i}
              className="text-8xl select-none transition-all duration-100"
              style={{
                filter: animating ? 'blur(1px)' : 'none',
                transform: animating ? `rotate(${Math.random() * 30 - 15}deg) scale(1.08)` : 'scale(1)',
                textShadow: '0 0 30px #00f5ff66',
                animation: animating ? 'spin 0.1s linear infinite' : 'none',
              }}
            >
              {DICE_FACES[val - 1]}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-mono font-black" style={{ color: '#00f5ff66' }}>
          {animating ? 'ROLLING...' : `VALUE: ${diceValues[0] + diceValues[1]}`}
        </p>
      </div>

      {/* Result */}
      {result && !rolling && (
        <div className={`text-center py-3 rounded-xl font-black font-mono text-sm ${result.won
          ? 'bg-[#00ff8811] border border-[#00ff8844] text-[#00ff88]'
          : 'bg-[#ff003c11] border border-[#ff003c44] text-[#ff003c]'}`}>
          {result.won
            ? `🎉 ROLLED ${result.roll}! +${result.payout.toFixed(4)} ${result.currency}`
            : `💸 ROLLED ${result.roll}. NO WIN!`}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t.winChance, value: `${winChance}%`, color: '#00f5ff' },
          { label: t.multiplier, value: `${multiplier}×`, color: '#ffd700' },
          { label: t.mode, value: mode === 'over' ? t.over : t.under, color: '#bf00ff' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center cyber-card" style={{ border: `1px solid ${s.color}33` }}>
            <p className="text-sm font-black font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] mt-0.5 font-mono" style={{ color: `${s.color}66` }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Mode + Target */}
      <div className="rounded-2xl p-4 cyber-card space-y-3" style={{ border: '1px solid #1e1e3a' }}>
        <div className="grid grid-cols-2 gap-2">
          {(['over', 'under'] as const).map(m => (
            <button key={m}
              onClick={() => { playClick(); setMode(m); }}
              className="py-2.5 rounded-xl text-sm font-black font-mono transition-all active:scale-95"
              style={mode === m ? {
                background: m === 'over' ? '#00f5ff22' : '#bf00ff22',
                border: `1px solid ${m === 'over' ? '#00f5ff' : '#bf00ff'}66`,
                color: m === 'over' ? '#00f5ff' : '#bf00ff',
                boxShadow: `0 0 12px ${m === 'over' ? '#00f5ff' : '#bf00ff'}33`,
              } : { background: '#0f0f1a', border: '1px solid #1e1e3a', color: '#ffffff44' }}>
              {m === 'over' ? `▲ ${t.over}` : `▼ ${t.under}`}
            </button>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs font-mono mb-2">
            <span style={{ color: '#00f5ff88' }}>{t.target.toUpperCase()}</span>
            <span style={{ color: '#00f5ff' }} className="font-black">{target}</span>
          </div>
          <input type="range" min={mode === 'over' ? 2 : 2} max={mode === 'over' ? 11 : 12}
            value={target} onChange={e => setTarget(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-[10px] mt-1 font-mono" style={{ color: '#ffffff33' }}>
            {[2,3,4,5,6,7,8,9,10,11,12].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </div>

      <BetControls onBet={handleBet} disabled={rolling} label={rolling ? t.rolling : t.rollDice} />
    </div>
  );
}
