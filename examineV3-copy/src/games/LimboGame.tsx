import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { playWin, playLoss, playClick, stopAllGameSounds } from '../utils/sounds';
import { BetControls } from '../components/BetControls';
import type { Currency } from '../types';

const WIN_RATE = 0.7;

// Provably Fair Logic
function generateResult(target: number, forceWin: boolean): number {
  const clampedTarget = Math.max(1.01, Math.min(1000000, target));

  if (forceWin) {
    const max = 1000000;
    const span = Math.max(0.01, Math.min(max - clampedTarget, clampedTarget * 5));
    const res = clampedTarget + Math.random() * span;
    return Math.max(1.00, Math.min(1000000, res));
  }

  const upper = Math.max(1.00, clampedTarget - 0.01);
  const res = 1.00 + Math.random() * Math.max(0, upper - 1.00);
  return Math.max(1.00, Math.min(1000000, res));
}

export function LimboGame() {
  const { placeBet, addWinnings, recordLoss } = useWallet();
  useLanguage();
  
  const [target, setTarget] = useState<number>(2.00);
  const [result, setResult] = useState<number>(1.00);
  const [running, setRunning] = useState(false);
  const [win, setWin] = useState<boolean | null>(null);
  const [history, setHistory] = useState<{ val: number; won: boolean }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Auto Bet State
  const [isAuto, setIsAuto] = useState(false);
  const autoRef = useRef<{ active: boolean; count: number }>({ active: false, count: 0 });
  const [autoCount, setAutoCount] = useState<number | 'inf'>('inf');

  const nonceRef = useRef(0);
  const animRef = useRef<number>(0);
  const autoTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  const AUTO_BET_DELAY_MS = 650;

  useEffect(() => {
    return () => {
      stopAllGameSounds();
      autoRef.current.active = false;
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
      if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Calculate Win Chance and Roll Over based on Target
  const winChance = Math.min(99, 99 / target);
  const sliderChance = Number.isFinite(winChance) ? Math.max(0.01, Math.min(99, winChance)) : 50;
  
  const handleTargetChange = (val: number) => {
    const newTarget = Math.max(1.01, Math.min(1000000, val));
    setTarget(newTarget);
  };
  
  const handleChanceChange = (val: number) => {
    const newChance = Math.max(0.01, Math.min(99, val));
    setTarget(99 / newChance);
  };

  const showInsufficientFunds = () => {
    setErrorMsg('На вашому балансі бракує коштів');
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setErrorMsg(''), 3500);
  };

  const executeBet = (amount: number, currency: Currency) => {
    if (running) return;

    if (!placeBet(amount, currency)) {
      showInsufficientFunds();
      autoRef.current.active = false;
      setIsAuto(false);
      return;
    }

    setRunning(true);
    setWin(null);
    playClick();
    nonceRef.current++;

    const forceWin = Math.random() < WIN_RATE;
    const finalResult = generateResult(target, forceWin);
    const isWin = finalResult >= target;
    const payout = isWin ? +(amount * target).toFixed(8) : 0;

    // Fast animation for Auto
    const isFast = autoRef.current.active;
    const duration = isFast ? 320 : 600;
    const startTime = performance.now();
    let current = 1.00;

    const animate = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3); 
      current = 1.00 + (finalResult - 1.00) * ease;
      
      if (progress < 1) {
        setResult(current);
        animRef.current = requestAnimationFrame(animate);
      } else {
        setResult(finalResult);
        setRunning(false);
        setWin(isWin);
        
        if (isWin) {
          addWinnings(payout, currency, 'Limbo');
          playWin();
        } else {
          recordLoss(amount, currency, 'Limbo');
          playLoss();
        }
        
        setHistory(prev => [{ val: finalResult, won: isWin }, ...prev].slice(0, 10));

        // Auto Logic
        if (autoRef.current.active) {
          if (typeof autoCount === 'number') {
            if (autoCount > 1) {
              setAutoCount(c => (c as number) - 1);
              if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
              autoTimerRef.current = window.setTimeout(() => executeBet(amount, currency), AUTO_BET_DELAY_MS);
            } else {
              setIsAuto(false);
              autoRef.current.active = false;
              setAutoCount('inf');
            }
          } else {
            // Infinite
            if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
            autoTimerRef.current = window.setTimeout(() => executeBet(amount, currency), AUTO_BET_DELAY_MS);
          }
        }
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const handleBet = (amount: number, currency: Currency) => {
    // If auto is toggled but not running, start it
    if (isAuto && !autoRef.current.active) {
      autoRef.current.active = true;
      executeBet(amount, currency);
    } else if (autoRef.current.active) {
      // Stop auto
      autoRef.current.active = false;
      setIsAuto(false);
    } else {
      // Manual bet
      executeBet(amount, currency);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Game Display Area */}
      <div className="relative rounded-3xl overflow-hidden cyber-card bg-[#0D0D0D] border border-white/5 p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
        {/* Main Result Number */}
        <div className="text-center z-10 mb-12">
          <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums transition-all select-none"
            style={{ 
              color: win === true ? '#00ff88' : win === false ? '#ff003c' : '#ffffff',
              textShadow: win === true ? '0 0 60px rgba(0,255,136,0.3)' : win === false ? '0 0 60px rgba(255,0,60,0.3)' : 'none',
              transform: running ? 'scale(1.02)' : 'scale(1)'
            }}>
            {result.toFixed(2)}x
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-white/40 font-bold tracking-[0.2em] text-sm">
            <span>TARGET PAYOUT</span>
            <span className="text-white">{target.toFixed(2)}x</span>
          </div>
        </div>

        {errorMsg && (
          <div className="absolute top-6 left-6 right-6 z-20 p-3 rounded-xl text-sm font-black font-mono text-center"
            style={{ background: '#ff003c11', border: '1px solid #ff003c55', color: '#ff003c' }}>
            {errorMsg}
          </div>
        )}

        {/* Interactive Slider */}
        <div className="w-full max-w-2xl relative h-12 flex items-center select-none group">
          {/* Track Background */}
          <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden bg-[#1a1a20]">
             {/* Progress Bar (Win Zone) */}
             <div className="absolute inset-y-0 left-0 bg-[#00ff88] opacity-20" style={{ width: `${sliderChance}%` }} />
          </div>
          
          {/* Slider Input */}
          <input
            type="range"
            min="0.01"
            max="99"
            step="0.01"
            value={sliderChance}
            onChange={(e) => handleChanceChange(+e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />

          {/* Target Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-10 bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center border border-white/20"
            style={{ left: `calc(${sliderChance}% - 12px)` }}
          >
            <div className="w-1 h-4 bg-black/20 rounded-full" />
          </div>
        </div>
        
        {/* Result History (Absolute Bottom) */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
          {history.map((h, i) => (
            <div key={i} className="px-4 py-2 rounded-lg text-sm font-mono font-bold whitespace-nowrap flex-shrink-0 transition-all"
              style={{ 
                background: h.won ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,60,0.1)',
                color: h.won ? '#00ff88' : '#ff003c',
                border: `1px solid ${h.won ? 'rgba(0,255,136,0.2)' : 'rgba(255,0,60,0.2)'}`
              }}>
              {h.val.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar (Shuffle Style) */}
      <div className="rounded-2xl p-6 cyber-card border border-white/5 bg-[#131318]">
        {/* Top Row: Bet Button and Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          
          {/* Bet Controls (First now) */}
          <div className="lg:col-span-1 space-y-3">
             <BetControls 
              onBet={handleBet} 
              disabled={running && !isAuto} 
              label={isAuto ? (running ? "STOP AUTO" : "START AUTO") : (running ? "FLYING..." : "BET")} 
            />
            {/* Auto Toggle */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-xs font-bold text-white/50 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={isAuto} 
                  onChange={(e) => {
                    setIsAuto(e.target.checked);
                    if (!e.target.checked) autoRef.current.active = false;
                  }}
                  className="w-4 h-4 rounded bg-[#0a0a0f] border-white/10 accent-[#00ff88]" 
                />
                Enable Auto Bet
              </label>
              {isAuto && (
                <span className="text-[10px] font-mono text-white/30">
                  {autoCount === 'inf' ? '∞' : autoCount} left
                </span>
              )}
            </div>
          </div>

          {/* Target Multiplier */}
          <div className="lg:col-span-1 space-y-2">
            <label className="text-[11px] font-bold text-white/40 tracking-wider uppercase">Multiplier</label>
            <div className="relative group">
              <input
                type="number"
                min={1.01}
                max={1000000}
                step={0.01}
                value={target}
                onChange={e => handleTargetChange(+e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#2a2a35] group-hover:border-[#3a3a45] focus:border-[#00ff88] rounded-xl px-4 py-3.5 text-white font-mono font-bold outline-none transition-colors"
              />
            </div>
          </div>

          {/* Roll Over (Visual/Linked) */}
          <div className="lg:col-span-1 space-y-2">
            <label className="text-[11px] font-bold text-white/40 tracking-wider uppercase">Roll Over</label>
             <div className="relative group">
              <input
                type="number"
                readOnly
                value={(50.00).toFixed(2)} // Static for Limbo as it doesn't use Roll Over directly
                className="w-full bg-[#0a0a0f] border border-[#2a2a35] rounded-xl px-4 py-3.5 text-white/50 font-mono font-bold outline-none cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></span>
            </div>
          </div>

          {/* Win Chance */}
          <div className="lg:col-span-1 space-y-2">
            <label className="text-[11px] font-bold text-white/40 tracking-wider uppercase">Chance</label>
             <div className="relative group">
              <input
                type="number"
                min={0.01}
                max={99}
                step={0.01}
                value={winChance.toFixed(4)}
                onChange={e => handleChanceChange(+e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#2a2a35] group-hover:border-[#3a3a45] focus:border-[#00ff88] rounded-xl px-4 py-3.5 text-white font-mono font-bold outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
