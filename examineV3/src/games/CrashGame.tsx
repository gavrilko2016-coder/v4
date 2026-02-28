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
import { startCrash as apiStartCrash } from '../api/casino';
import { pfCreateRound } from '../api/provablyFair';
import './crash.css';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
const MAX_HISTORY = 10;
const AUTO_RESTART_DELAY = 3000; // 3 seconds

// ─── TYPES ───────────────────────────────────────────────────────────────────
type GameState = 'IDLE' | 'STARTING' | 'FLYING' | 'CRASHED';

const USD_RATES: Record<string, number> = { BTC: 67420, ETH: 3521, TON: 5.84, USDT: 1, STARS: 0.02 };

export function CrashGame() {
  // Wallet Context
  const { wallet, placeBet, refundBet, addWinnings, recordLoss, selectedCurrency, userId } = useWallet();

  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  // Bet State
  const [betAmountUsdt, setBetAmountUsdt] = useState<string>('10');
  const [hasBet, setHasBet] = useState(false); // Current round bet
  const [cashedOut, setCashedOut] = useState(false);
  const [payout, setPayout] = useState(0);
  const placedBetAmountRef = useRef<number>(0);

  // Refs (Mutable state for animation loop)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const soundLoopStopRef = useRef<(() => void) | null>(null);
  const nonceRef = useRef(0);

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
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
    setMultiplier(1.00);
    setCashedOut(false);
    setPayout(0);
    // Note: hasBet is NOT reset here, it persists if user clicked BET during previous CRASH/IDLE
    // But we need to distinguish "bet for next round" vs "bet for current".
    // Actually, simple logic: User can only click BET when state is IDLE/STARTING.
    // So if they clicked it, hasBet is true.
    
    let count = 3;
    setTimeLeft(count);
    
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

    nonceRef.current += 1;
    const clientSeed = userId || 'guest';

    (async () => {
      try {
        const { roundId } = await pfCreateRound();
        const { crashPoint } = await apiStartCrash({ roundId, clientSeed, nonce: nonceRef.current });

        crashPointRef.current = crashPoint;
        startTimeRef.current = Date.now();

        // Start Sound
        stopAllGameSounds(); // Safety clear
        soundLoopStopRef.current = startCrashLoop();

        // Start Animation
        runGameLoop();
      } catch {
        if (hasBetRef.current && !cashedOutRef.current) {
          const amount = placedBetAmountRef.current;
          refundBet(amount, selectedCurrency, 'CRASH');
          setHasBet(false);
        }

        setGameState('CRASHED');
        setMultiplier(1.00);
        setHistory(prev => [1.00, ...prev].slice(0, MAX_HISTORY));

        setTimeout(() => {
          if (mountedRef.current) startGameCycle();
        }, AUTO_RESTART_DELAY);
      }
    })();
  };

  // We need a ref for hasBet because RAF loop won't see updated state easily
  const hasBetRef = useRef(false);
  const cashedOutRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    hasBetRef.current = hasBet;
    cashedOutRef.current = cashedOut;
  }, [hasBet, cashedOut]);

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
      }
    } catch {}
  }, [storageKey, selectedCurrency]);

  const updateBetAmountUsdt = (val: string) => {
    setBetAmountUsdt(val);
    try {
      localStorage.setItem(storageKey, val);
    } catch {}
  };

  // ─── CORE LOGIC ────────────────────────────────────────────────────────────

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

  const runGameLoop = () => {
    if (!mountedRef.current) return;

    const now = Date.now();
    const elapsedSeconds = (now - startTimeRef.current) / 1000;
    const k = 0.06; 
    const nextMult = Math.exp(k * elapsedSeconds * 3); 

    if (nextMult >= crashPointRef.current) {
      // CRASH
      finishCrash(crashPointRef.current);
    } else {
      setMultiplier(nextMult);
      drawGraph(nextMult, 'FLYING');
      rafRef.current = requestAnimationFrame(runGameLoop);
    }
  };

  const finishCrash = (finalValue: number) => {
    setGameState('CRASHED');
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
    if (gameState !== 'FLYING' || !hasBet || cashedOut) return;

    const currentMult = multiplier;
    const amount = placedBetAmountRef.current;
    const winAmount = amount * currentMult;

    setCashedOut(true);
    setPayout(winAmount);
    // setHasBet(false); // Don't clear hasBet yet, we need it to know we played this round

    addWinnings(winAmount, selectedCurrency, 'CRASH');
    playCashout();
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
    <div className="crash-container">
      {/* History */}
      <div className="crash-history">
        {history.map((val, idx) => (
          <div key={idx} className={`history-badge ${val >= 2.0 ? 'history-win' : 'history-loss'}`}>
            {val.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* Display */}
      <div className={`crash-display ${gameState === 'CRASHED' ? 'crash-flash' : ''}`}>
        <canvas ref={canvasRef} width={800} height={400} className="crash-canvas" />
        
        <div className="crash-overlay">
          {gameState === 'STARTING' && (
            <div className="status-text text-white">STARTING IN {timeLeft}s...</div>
          )}
          
          {(gameState === 'FLYING' || gameState === 'CRASHED') && (
            <div className={`multiplier-text ${gameState === 'CRASHED' ? 'text-red' : 'text-green'}`}>
              {multiplier.toFixed(2)}x
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="status-text text-red">CRASHED</div>
          )}

          {gameState === 'IDLE' && (
            <div className="status-text text-white">WAITING FOR NEXT ROUND...</div>
          )}

          {cashedOut && (
            <div className="status-text text-green" style={{ marginTop: '1rem' }}>
              WON {payout.toFixed(2)} {selectedCurrency}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="crash-controls">
        <div className="control-panel">
          <div className="input-group">
            <label className="input-label">Bet Amount (USDT)</label>
            <input 
              type="number" 
              className="bet-input" 
              value={betAmountUsdt}
              onChange={(e) => updateBetAmountUsdt(e.target.value)}
              disabled={hasBet || gameState === 'FLYING'} 
            />
          </div>
          <div className="info-row">
            <span>Balance:</span>
            <span className="text-white">≈ ${balanceUsdt.toFixed(2)}</span>
          </div>
        </div>

        <div className="control-panel" style={{ display: 'flex', alignItems: 'center' }}>
          {gameState === 'FLYING' && hasBet && !cashedOut ? (
            <button className="action-btn btn-cashout" onClick={handleCashOut}>
              CASH OUT
            </button>
          ) : (
            <button 
              className="action-btn btn-bet" 
              onClick={handleBet}
              disabled={!isBetValid || hasBet || (gameState !== 'IDLE' && gameState !== 'STARTING')}
            >
              {hasBet ? 'BET PLACED' : (gameState === 'STARTING' ? 'BET NOW' : 'BET')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
