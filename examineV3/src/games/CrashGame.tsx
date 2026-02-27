import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  playCrash, 
  playCrashTick, 
  playCashout, 
  playLoss, 
  startCrashLoop, 
  stopAllGameSounds 
} from '../utils/sounds';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
const MAX_HISTORY = 10;
const AUTO_RESTART_DELAY = 3000; // 3 seconds

const WIN_RATE = 0.7;

// ─── TYPES ───────────────────────────────────────────────────────────────────
type GameState = 'IDLE' | 'STARTING' | 'FLYING' | 'CRASHED';

const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };

export function CrashGame() {
  // Wallet Context
  const { wallet, placeBet, addWinnings, recordLoss, selectedCurrency } = useWallet();

  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const gameStateRef = useRef<GameState>('IDLE');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  // Bet State
  const [betAmountUsdt, setBetAmountUsdt] = useState<string>('10');
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(true);
  const [autoCashoutX, setAutoCashoutX] = useState<string>('2.00');
  const [turbo, setTurbo] = useState(false);
  const [autoBet, setAutoBet] = useState(false);
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);
  const [hasBet, setHasBet] = useState(false); // Current round bet
  const [cashedOut, setCashedOut] = useState(false);
  const [payout, setPayout] = useState(0);
  const placedBetAmountRef = useRef<number>(0);

  const autoCashoutEnabledRef = useRef(true);
  const autoCashoutXRef = useRef(2.0);
  const turboRef = useRef(false);
  const autoBetRef = useRef(false);
  const stopOnWinRef = useRef(false);
  const stopOnLossRef = useRef(false);

  // Refs (Mutable state for animation loop)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const soundLoopStopRef = useRef<(() => void) | null>(null);

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    mountedRef.current = true;
    // Start the game loop immediately on mount
    startGameCycle();

    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      stopAllGameSounds();
    };
  }, []);

  // ─── GAME CYCLE CONTROLLER ─────────────────────────────────────────────────
  const startGameCycle = () => {
    if (!mountedRef.current) return;

    // Phase 1: STARTING (Countdown)
    setGameState('STARTING');
    gameStateRef.current = 'STARTING';
    setMultiplier(1.00);
    setCashedOut(false);
    setPayout(0);
    // Note: hasBet is NOT reset here, it persists if user clicked BET during previous CRASH/IDLE
    // But we need to distinguish "bet for next round" vs "bet for current".
    // Actually, simple logic: User can only click BET when state is IDLE/STARTING.
    // So if they clicked it, hasBet is true.
    
    let count = 3;
    setTimeLeft(count);

    // Auto bet: place bet for the next round as soon as we enter STARTING.
    // Use a microtask to ensure state has settled.
    setTimeout(() => {
      if (!mountedRef.current) return;
      tryAutoBet();
    }, 0);
    
    const timer = setInterval(() => {
      if (!mountedRef.current) { clearInterval(timer); return; }
      
      playCrashTick();
      count--;
      setTimeLeft(count);
      
      if (count <= 0) {
        clearInterval(timer);
        startFlying();
      }
    }, 1000);
  };

  // Phase 2: FLYING
  const startFlying = () => {
    if (!mountedRef.current) return;

    setGameState('FLYING');
    gameStateRef.current = 'FLYING';
    crashPointRef.current = generateCrashPoint();
    startTimeRef.current = Date.now();

    // Start Sound
    stopAllGameSounds(); // Safety clear
    soundLoopStopRef.current = startCrashLoop();

    // Start Animation
    runGameLoop();
  };

  // We need a ref for hasBet because RAF loop won't see updated state easily
  const hasBetRef = useRef(false);
  const cashedOutRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    hasBetRef.current = hasBet;
    cashedOutRef.current = cashedOut;
    autoCashoutEnabledRef.current = autoCashoutEnabled;
    const parsedX = Number.parseFloat(autoCashoutX);
    autoCashoutXRef.current = Number.isFinite(parsedX) && parsedX >= 1.01 ? parsedX : 2.0;
    turboRef.current = turbo;
    autoBetRef.current = autoBet;
    stopOnWinRef.current = stopOnWin;
    stopOnLossRef.current = stopOnLoss;
  }, [hasBet, cashedOut]);

  useEffect(() => {
    autoCashoutEnabledRef.current = autoCashoutEnabled;
  }, [autoCashoutEnabled]);

  useEffect(() => {
    const parsedX = Number.parseFloat(autoCashoutX);
    autoCashoutXRef.current = Number.isFinite(parsedX) && parsedX >= 1.01 ? parsedX : 2.0;
  }, [autoCashoutX]);

  useEffect(() => {
    turboRef.current = turbo;
  }, [turbo]);

  useEffect(() => {
    autoBetRef.current = autoBet;
  }, [autoBet]);

  useEffect(() => {
    stopOnWinRef.current = stopOnWin;
  }, [stopOnWin]);

  useEffect(() => {
    stopOnLossRef.current = stopOnLoss;
  }, [stopOnLoss]);

  const rate = USD_RATES[selectedCurrency] || 0;
  const balance = wallet[selectedCurrency] || 0;
  const balanceUsdt = rate > 0 ? balance * rate : 0;
  const numericBetUsdt = parseFloat(betAmountUsdt) || 0;
  const isBetValid = numericBetUsdt > 0 && numericBetUsdt <= balanceUsdt;

  const storageKey = `bet_amount_usdt_${selectedCurrency}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setBetAmountUsdt(stored);
        return;
      }
    } catch {}
  }, [storageKey, selectedCurrency]);

  const updateBetAmountUsdt = (val: string) => {
    setBetAmountUsdt(val);
    try {
      localStorage.setItem(storageKey, val);
    } catch {}
  };

  const isTyping = () => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  };

  // ─── CORE LOGIC ────────────────────────────────────────────────────────────

  const generateCrashPoint = (): number => {
    const forceWin = Math.random() < WIN_RATE;

    if (forceWin) {
      // Favorable round: higher crash point (more time to cash out)
      const hi = 2.0 + Math.random() * 6.0; // 2.00x .. 8.00x
      return Math.floor(hi * 100) / 100;
    }

    // Unfavorable round: lower crash point
    const lo = 1.0 + Math.random() * 0.6; // 1.00x .. 1.60x
    return Math.floor(lo * 100) / 100;
  };

  const handleBet = () => {
    if (!isBetValid) return;

    const amount = rate > 0 ? (numericBetUsdt / rate) : 0;
    if (!Number.isFinite(amount) || amount <= 0) return;
    
    const success = placeBet(amount, selectedCurrency);
    if (!success) {
      // alert("Insufficient funds!"); // Removed alert for smoother UX, maybe shake input?
      return;
    }

    placedBetAmountRef.current = amount;
    setHasBet(true);
    // No longer starting game here
  };

  const tryAutoBet = () => {
    if (!autoBetRef.current) return;
    if (hasBetRef.current) return;
    if (gameState !== 'IDLE' && gameState !== 'STARTING') return;
    if (!isBetValid) return;
    handleBet();
  };

  const doCashOut = (cashoutMult: number) => {
    if (gameStateRef.current !== 'FLYING') return;
    if (!hasBetRef.current || cashedOutRef.current) return;

    const amount = placedBetAmountRef.current;
    const winAmount = amount * cashoutMult;

    cashedOutRef.current = true;
    setCashedOut(true);
    setPayout(winAmount);

    addWinnings(winAmount, selectedCurrency, 'CRASH');
    playCashout();

    if (autoBetRef.current && stopOnWinRef.current) {
      autoBetRef.current = false;
      setAutoBet(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (isTyping()) return;
      e.preventDefault();

      if (gameState === 'FLYING' && hasBetRef.current && !cashedOutRef.current) {
        doCashOut(multiplier);
        return;
      }

      if ((gameState === 'IDLE' || gameState === 'STARTING') && !hasBetRef.current) {
        handleBet();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, multiplier, isBetValid]);

  const runGameLoop = () => {
    if (!mountedRef.current) return;

    const now = Date.now();
    const elapsedSeconds = (now - startTimeRef.current) / 1000;
    const k = 0.06;
    const speed = turboRef.current ? 4.5 : 3;
    const nextMult = Math.exp(k * elapsedSeconds * speed);

    if (nextMult >= crashPointRef.current) {
      // CRASH
      finishCrash(crashPointRef.current);
    } else {
      setMultiplier(nextMult);
      drawGraph(nextMult, 'FLYING');

      if (
        autoCashoutEnabledRef.current &&
        hasBetRef.current &&
        !cashedOutRef.current &&
        nextMult >= autoCashoutXRef.current
      ) {
        doCashOut(autoCashoutXRef.current);
      }

      rafRef.current = requestAnimationFrame(runGameLoop);
    }
  };

  const finishCrash = (finalValue: number) => {
    setGameState('CRASHED');
    gameStateRef.current = 'CRASHED';
    setMultiplier(finalValue);
    drawGraph(finalValue, 'CRASHED');
    
    stopAllGameSounds();
    playCrash();

    setHistory(prev => [finalValue, ...prev].slice(0, MAX_HISTORY));

    // Check Loss
    if (hasBetRef.current && !cashedOutRef.current) {
      const amount = placedBetAmountRef.current;
      recordLoss(amount, selectedCurrency, 'CRASH');
      playLoss();

      if (autoBetRef.current && stopOnLossRef.current) {
        autoBetRef.current = false;
        setAutoBet(false);
      }
    }

    // Reset Bet for next round
    setHasBet(false); 
    // Note: We set it to false so they have to bet again. 
    // If we wanted auto-bet, we'd keep it true, but standard is manual bet.

    // Schedule Restart
    setTimeout(() => {
      if (mountedRef.current) {
        startGameCycle();
      }
    }, AUTO_RESTART_DELAY);
  };

  const handleCashOut = () => {
    doCashOut(multiplier);
  };

  // ─── DRAWING ───────────────────────────────────────────────────────────────
  const drawGraph = (current: number, state: GameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    
    // Draw Curve
    const progress = Math.min(1, (current - 1) / 5); 
    const endX = w * progress;
    const endY = h - (h * 0.8 * progress);

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(endX * 0.5, h, endX, endY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = state === 'CRASHED' ? '#ff0055' : '#00ff88';
    ctx.stroke();

    // Fill
    ctx.lineTo(endX, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = state === 'CRASHED' ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 255, 136, 0.1)';
    ctx.fill();

    // Rocket
    if (state === 'FLYING') {
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {history.map((val, idx) => (
          <div
            key={idx}
            className="px-3 py-1 rounded-xl text-[11px] font-black font-mono whitespace-nowrap"
            style={{
              background: val >= 2.0 ? 'rgba(0,255,136,0.10)' : 'rgba(255,0,85,0.10)',
              border: `1px solid ${val >= 2.0 ? 'rgba(0,255,136,0.25)' : 'rgba(255,0,85,0.25)'}`,
              color: val >= 2.0 ? '#00ff88' : '#ff0055',
            }}
          >
            {val.toFixed(2)}x
          </div>
        ))}
      </div>

      <div
        className={`relative rounded-3xl overflow-hidden cyber-card bg-[#0D0D0D] border border-white/5 ${
          gameState === 'CRASHED' ? 'animate-glitch' : ''
        }`}
      >
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-[240px] md:h-[320px] block" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {gameState === 'STARTING' && (
            <div className="text-sm font-black font-mono tracking-widest text-white/70">
              STARTING IN {timeLeft}s…
            </div>
          )}

          {(gameState === 'FLYING' || gameState === 'CRASHED') && (
            <div
              className="text-6xl md:text-7xl font-black font-mono tabular-nums"
              style={{
                color: gameState === 'CRASHED' ? '#ff0055' : '#00ff88',
                textShadow:
                  gameState === 'CRASHED'
                    ? '0 0 40px rgba(255,0,85,0.25)'
                    : '0 0 40px rgba(0,255,136,0.22)',
              }}
            >
              {multiplier.toFixed(2)}x
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="mt-2 text-xs font-black font-mono tracking-[0.25em]" style={{ color: '#ff0055' }}>
              CRASHED
            </div>
          )}

          {gameState === 'IDLE' && (
            <div className="text-xs font-black font-mono tracking-[0.25em] text-white/60">
              WAITING FOR NEXT ROUND…
            </div>
          )}

          {cashedOut && (
            <div className="mt-3 px-4 py-2 rounded-xl text-sm font-black font-mono"
              style={{ background: 'rgba(0,255,136,0.10)', border: '1px solid rgba(0,255,136,0.25)', color: '#00ff88' }}>
              WON {payout.toFixed(2)} {selectedCurrency}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-4 cyber-card bg-[#13131f] border border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-black font-mono tracking-[0.22em] text-white/35 mb-2">BET AMOUNT (USDT)</p>
            <input
              type="number"
              value={betAmountUsdt}
              onChange={(e) => updateBetAmountUsdt(e.target.value)}
              disabled={hasBet || gameState === 'FLYING'}
              className="w-full bg-[#0a0a0f] border border-[#2a2a35] rounded-xl px-4 py-3.5 text-white font-black font-mono outline-none transition-all focus:border-[#00ff88]"
            />
            <div className="flex justify-between text-[11px] font-mono mt-2">
              <span className="text-white/35">BALANCE</span>
              <span className="text-white/70">≈ ${balanceUsdt.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black font-mono tracking-[0.22em] text-white/35 mb-2">AUTO CASHOUT (X)</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={autoCashoutX}
                onChange={(e) => setAutoCashoutX(e.target.value)}
                disabled={gameState === 'FLYING'}
                className="flex-1 bg-[#0a0a0f] border border-[#2a2a35] rounded-xl px-4 py-3.5 text-white font-black font-mono outline-none transition-all focus:border-[#00ff88]"
              />
              <button
                onClick={() => setAutoCashoutEnabled((v) => !v)}
                disabled={gameState === 'FLYING'}
                className="px-4 rounded-xl font-black font-mono text-xs tracking-widest transition-all active:scale-95"
                style={
                  autoCashoutEnabled
                    ? { background: 'rgba(255,215,0,0.14)', border: '1px solid rgba(255,215,0,0.28)', color: '#FFD700' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                }
              >
                {autoCashoutEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTurbo((v) => !v)}
            disabled={gameState === 'FLYING'}
            className="px-4 py-2 rounded-xl text-[11px] font-black font-mono tracking-widest transition-all active:scale-95"
            style={
              turbo
                ? { background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.28)', color: '#00f5ff' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
            }
          >
            TURBO
          </button>
          <button
            onClick={() => {
              setAutoBet((v) => !v);
              setTimeout(() => tryAutoBet(), 0);
            }}
            disabled={!isBetValid}
            className="px-4 py-2 rounded-xl text-[11px] font-black font-mono tracking-widest transition-all active:scale-95"
            style={
              autoBet
                ? { background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.28)', color: '#00ff88' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
            }
          >
            AUTO
          </button>
          <button
            onClick={() => setStopOnWin((v) => !v)}
            disabled={!autoBet}
            className="px-4 py-2 rounded-xl text-[11px] font-black font-mono tracking-widest transition-all active:scale-95"
            style={
              stopOnWin
                ? { background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.28)', color: '#8b5cf6' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
            }
          >
            STOP WIN
          </button>
          <button
            onClick={() => setStopOnLoss((v) => !v)}
            disabled={!autoBet}
            className="px-4 py-2 rounded-xl text-[11px] font-black font-mono tracking-widest transition-all active:scale-95"
            style={
              stopOnLoss
                ? { background: 'rgba(255,0,85,0.14)', border: '1px solid rgba(255,0,85,0.28)', color: '#ff0055' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
            }
          >
            STOP LOSS
          </button>
          <div className="ml-auto text-[10px] font-black font-mono tracking-[0.22em] text-white/30 self-center">
            SPACE = BET / CASHOUT
          </div>
        </div>

        <button
          onClick={gameState === 'FLYING' && hasBet && !cashedOut ? handleCashOut : handleBet}
          disabled={
            gameState === 'FLYING'
              ? !(hasBet && !cashedOut)
              : !isBetValid || hasBet || (gameState !== 'IDLE' && gameState !== 'STARTING')
          }
          className="w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            gameState === 'FLYING' && hasBet && !cashedOut
              ? {
                  background: 'linear-gradient(135deg,#FFD700,#F0C000)',
                  color: '#0a0a0f',
                  boxShadow: '0 0 22px rgba(255,215,0,0.22)',
                }
              : {
                  background: '#00e701',
                  color: '#0a0a0f',
                  boxShadow: '0 0 22px rgba(0,231,1,0.18)',
                }
          }
        >
          {gameState === 'FLYING' && hasBet && !cashedOut
            ? 'CASH OUT'
            : hasBet
              ? 'BET PLACED'
              : gameState === 'STARTING'
                ? 'BET NOW'
                : 'BET'}
        </button>
      </div>
    </div>
  );
}
