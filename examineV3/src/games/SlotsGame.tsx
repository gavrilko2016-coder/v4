import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { BetControls } from '../components/BetControls';
import { useLanguage } from '../context/LanguageContext';
import { playSlotSpin, playSlotStop, playWin, playBigWin, playLoss, stopAllGameSounds } from '../utils/sounds';
import { playSlots as apiPlaySlots } from '../api/casino';
import type { Currency } from '../types';

const SYMBOLS = ['🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🎰', '🔔'];
const PAYOUTS: Record<string, number> = {
  '🍋🍋🍋': 2, '🍊🍊🍊': 3, '🍇🍇🍇': 4, '⭐⭐⭐': 8,
  '💎💎💎': 15, '7️⃣7️⃣7️⃣': 25, '🎰🎰🎰': 50, '🔔🔔🔔': 100,
};

function getResult(reels: string[]): { multiplier: number; label: string; big: boolean } {
  const key = reels.join('');
  if (PAYOUTS[key]) return { multiplier: PAYOUTS[key], label: '🎉 JACKPOT!', big: PAYOUTS[key] >= 15 };
  const counts = reels.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});
  const hasTwo = Object.values(counts).some(v => v >= 2);
  if (hasTwo) return { multiplier: 1.5, label: '✨ Two of a kind!', big: false };
  return { multiplier: 0, label: '💸 No match', big: false };
}

export function SlotsGame() {
  const { placeBet, refundBet, addWinnings, recordLoss, userId } = useWallet();
  const { t } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🍋', '🍊', '🍇']);
  const [resultMsg, setResultMsg] = useState<{ won: boolean; label: string; payout: number; currency: Currency } | null>(null);
  const [blur, setBlur] = useState([false, false, false]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nonceRef = useRef(0);

  useEffect(() => () => {
    stopAllGameSounds();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleBet = (amount: number, currency: Currency) => {
    if (!placeBet(amount, currency)) return;
    setSpinning(true);
    setResultMsg(null);
    setBlur([true, true, true]);
    playSlotSpin();

    nonceRef.current += 1;
    const clientSeed = userId || 'guest';
    let finalReels = ['🍋', '🍊', '🍇'];
    let tick = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      tick++;
      const r0 = tick < 22 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : finalReels[0];
      const r1 = tick < 27 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : finalReels[1];
      const r2 = tick < 32 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : finalReels[2];
      setReels([r0, r1, r2]);
      setBlur([tick < 22, tick < 27, tick < 32]);

      if (tick === 22) playSlotStop();
      if (tick === 27) playSlotStop();
      if (tick === 32) playSlotStop();

      if (tick >= 34) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        (async () => {
          try {
            const { reels: reelsOut, won, payout, label } = await apiPlaySlots({
              clientSeed,
              nonce: nonceRef.current,
              betAmount: amount,
              currency,
            });

            finalReels = reelsOut;
            setReels(finalReels);
            setBlur([false, false, false]);

            const base = getResult(finalReels);

            if (won) { addWinnings(payout, currency, 'Slots'); base.big ? playBigWin() : playWin(); }
            else { recordLoss(amount, currency, 'Slots'); playLoss(); }

            setResultMsg({ won, label: label || base.label, payout, currency });
          } catch {
            refundBet(amount, currency, 'Slots');
            setResultMsg(null);
          } finally {
            setSpinning(false);
          }
        })();
      }
    }, 60);
  };

  return (
    <div className="space-y-4">
      {/* Machine */}
      <div className="rounded-2xl overflow-hidden cyber-card"
        style={{ border: '1px solid #bf00ff33', background: 'linear-gradient(180deg,#13131f,#0f0f1a)' }}>
        {/* Top bar */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg,#bf00ff,#00f5ff,#bf00ff)', opacity: spinning ? 1 : 0.4, transition: 'opacity 0.3s' }} />

        <div className="p-6 flex gap-3 justify-center">
          {reels.map((sym, i) => (
            <div key={i}
              className="w-24 h-24 rounded-xl flex items-center justify-center text-4xl relative overflow-hidden"
              style={{
                background: '#080808',
                border: `2px solid ${spinning && blur[i] ? '#bf00ff' : '#1e1e3a'}`,
                boxShadow: spinning && blur[i] ? '0 0 15px #bf00ff44' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
              <span style={{
                filter: spinning && blur[i] ? 'blur(3px)' : 'none',
                transition: 'filter 0.1s',
                transform: spinning && blur[i] ? 'translateY(-4px)' : 'translateY(0)',
              }}>
                {sym}
              </span>
              {/* Reel lines */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: '#bf00ff22' }} />
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: '#bf00ff22' }} />
            </div>
          ))}
        </div>

        {/* Win line indicator */}
        <div className="mx-6 mb-4 h-px" style={{ background: `linear-gradient(90deg,transparent,${spinning ? '#bf00ff' : '#1e1e3a'},transparent)` }} />

        {spinning && (
          <p className="text-center pb-3 text-xs font-black font-mono" style={{ color: '#bf00ff' }}>◈ SPINNING ◈</p>
        )}
      </div>

      {/* Result */}
      {resultMsg && !spinning && (
        <div className={`text-center py-3 rounded-xl font-black font-mono text-sm ${resultMsg.won
          ? 'bg-[#00ff8811] border border-[#00ff8844] text-[#00ff88]'
          : 'bg-[#ff003c11] border border-[#ff003c44] text-[#ff003c]'}`}>
          {resultMsg.label}
          {resultMsg.won && <span className="block text-xs mt-0.5 opacity-80">+{resultMsg.payout.toFixed(4)} {resultMsg.currency}</span>}
        </div>
      )}

      {/* Paytable */}
      <div className="rounded-2xl p-4 cyber-card space-y-2" style={{ border: '1px solid #bf00ff22' }}>
        <p className="text-[10px] font-black font-mono" style={{ color: '#bf00ff88' }}>◈ {t.paytable.toUpperCase()}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(PAYOUTS).map(([combo, mult]) => (
            <div key={combo} className="flex items-center justify-between rounded-lg px-2 py-1.5"
              style={{ background: '#bf00ff08', border: '1px solid #bf00ff22' }}>
              <span className="text-sm">{combo}</span>
              <span className="text-xs font-black font-mono" style={{ color: '#ffd700' }}>{mult}×</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg px-2 py-1.5"
            style={{ background: '#bf00ff08', border: '1px solid #bf00ff22' }}>
            <span className="text-xs font-mono" style={{ color: '#ffffff66' }}>{t.anyTwoMatch}</span>
            <span className="text-xs font-black font-mono" style={{ color: '#ffd700' }}>1.5×</span>
          </div>
        </div>
      </div>

      <BetControls onBet={handleBet} disabled={spinning} label={spinning ? t.spinning : t.spin} />
    </div>
  );
}
