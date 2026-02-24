import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  playCrash, 
  playCrashTick, 
  playCashout, 
  playLoss, 
  startCrashLoop, 
  stopAllGameSounds 
} from '../utils/sounds';
import './crash.css';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
const RTP = 0.97; // 97% Return to Player (3% House Edge)
const MAX_HISTORY = 10;
const AUTO_RESTART_DELAY = 3000; // 3 seconds

// ─── TYPES ───────────────────────────────────────────────────────────────────
type GameState = 'IDLE' | 'STARTING' | 'FLYING' | 'CRASHED';

export function CrashGame() {
  // Wallet Context
  const { wallet, placeBet, addWinnings, recordLoss, selectedCurrency } = useWallet();

  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  // Bet State
  const [betAmount, setBetAmount] = useState<string>('10');
  const [hasBet, setHasBet] = useState(false); // Current round bet
  const [cashedOut, setCashedOut] = useState(false);
  const [payout, setPayout] = useState(0);

  // Refs (Mutable state for animation loop)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const soundLoopStopRef = useRef<(() => void) | null>(null);

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    // Start the game loop immediately on mount
    startGameCycle();

    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    crashPointRef.current = generateCrashPoint();
    startTimeRef.current = Date.now();

    // Start Sound
    stopAllGameSounds(); // Safety clear
    soundLoopStopRef.current = startCrashLoop();

    // Start Animation
    runGameLoop();
  };

  // Phase 3: CRASHED (Handled in loop)
  const handleCrash = (finalValue: number) => {
    if (!mountedRef.current) return;

    setGameState('CRASHED');
    setMultiplier(finalValue);
    drawGraph(finalValue, 'CRASHED');
    
    // Sounds
    stopAllGameSounds();
    playCrash();

    // Update History
    setHistory(prev => [finalValue, ...prev].slice(0, MAX_HISTORY));

    // Result Logic
    // We need to check hasBet ref-like because state might be stale in closure? 
    // Actually relying on state inside handleCrash which is called from RAF might be tricky.
    // But since handleCrash is called from runGameLoop which is a closure, we need to be careful.
    // The runGameLoop is re-created? No, it's recursive RAF.
    // We should use a ref for hasBet to be safe in the RAF loop? 
    // Actually, let's just handle logic here. React state in RAF can be stale if not careful.
    // However, we can check the latest state if we use refs for game logic or pass state.
    // For simplicity, let's trust the component re-render updates the closure or use refs.
    // Wait, RAF loop closes over variables.
    // Better to use a ref for hasBet to check win/loss inside the loop logic.
  };

  // We need a ref for hasBet because RAF loop won't see updated state easily
  const hasBetRef = useRef(false);
  const cashedOutRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    hasBetRef.current = hasBet;
    cashedOutRef.current = cashedOut;
  }, [hasBet, cashedOut]);

  // ─── CORE LOGIC ────────────────────────────────────────────────────────────

  const generateCrashPoint = (): number => {
    const r = Math.random();
    const e = RTP / (1 - r);
    const result = Math.floor(e * 100) / 100;
    return Math.max(1.00, result);
  };

  const handleBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const success = placeBet(amount, selectedCurrency);
    if (!success) {
      // alert("Insufficient funds!"); // Removed alert for smoother UX, maybe shake input?
      return;
    }

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
      const amount = parseFloat(betAmount);
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
    const amount = parseFloat(betAmount);
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
            <label className="input-label">Bet Amount ({selectedCurrency})</label>
            <input 
              type="number" 
              className="bet-input" 
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={hasBet || gameState === 'FLYING'} 
            />
          </div>
          <div className="info-row">
            <span>Balance:</span>
            <span className="text-white">{wallet[selectedCurrency].toFixed(4)}</span>
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
              disabled={hasBet || (gameState !== 'IDLE' && gameState !== 'STARTING')}
            >
              {hasBet ? 'BET PLACED' : (gameState === 'STARTING' ? 'BET NOW' : 'BET')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
