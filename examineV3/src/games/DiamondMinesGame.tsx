import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { BetControls } from '../components/BetControls';
import { playClick, playWin, playBigWin, playLoss, stopAllGameSounds } from '../utils/sounds';
import type { Currency } from '../types';

const WIN_RATE = 0.7;

type CellState = 'hidden' | 'diamond' | 'mine' | 'revealed';

interface Cell {
  id: number;
  hasMine: boolean;
  state: CellState;
}

type GamePhase = 'idle' | 'playing' | 'won' | 'lost';

const GRID_SIZE = 25; // 5×5

const MINE_OPTIONS = [1, 3, 5, 10, 15, 20];

function generateGrid(mineCount: number): Cell[] {
  const cells: Cell[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: i,
    hasMine: false,
    state: 'hidden',
  }));
  let placed = 0;
  while (placed < mineCount) {
    const idx = Math.floor(Math.random() * GRID_SIZE);
    if (!cells[idx].hasMine) {
      cells[idx].hasMine = true;
      placed++;
    }
  }
  return cells;
}

function getMultiplier(revealed: number, mineCount: number): number {
  if (revealed === 0) return 1;
  const safeCount = GRID_SIZE - mineCount;
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (safeCount - i) / (GRID_SIZE - i);
  }
  // House edge ~3%
  return Math.max(1.01, +(0.97 / mult).toFixed(3));
}

function getCellEmoji(cell: Cell, phase: GamePhase): { emoji: string; color: string; bg: string; border: string } {
  if (cell.state === 'diamond') {
    return { emoji: '💎', color: '#00f5ff', bg: '#00f5ff18', border: '#00f5ff66' };
  }
  if (cell.state === 'mine') {
    return { emoji: '💣', color: '#ff003c', bg: '#ff003c18', border: '#ff003c66' };
  }
  if (cell.state === 'hidden' && phase === 'lost' && cell.hasMine) {
    return { emoji: '💣', color: '#ff003c44', bg: '#ff003c08', border: '#ff003c33' };
  }
  return { emoji: '', color: '#ffffff22', bg: '#13131f', border: '#1e1e3a' };
}

// ─── Win Modal ──────────────────────────────────────────────────────────────
function WinModal({ profit, currency, multiplier, onClose }: {
  profit: number; currency: Currency; multiplier: number; onClose: () => void;
}) {
  return (
    <motion.div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center p-8"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid rgba(0,245,255,0.4)',
          boxShadow: '0 0 60px rgba(0,245,255,0.2)',
        }}
        initial={{ scale: 0.5, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={e => e.stopPropagation()}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(0,245,255,0.15) 0%, transparent 65%)' }} />

        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{ background: '#00f5ff', top: `${15 + (i * 11) % 70}%`, left: `${8 + (i * 13) % 84}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 1.5, delay: i * 0.12, repeat: Infinity, repeatDelay: 0.5 }} />
        ))}

        <motion.div className="text-7xl mb-4"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          💎
        </motion.div>

        <motion.p className="text-sm font-black font-mono mb-2" style={{ color: '#00ff88' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          CASHED OUT SAFELY!
        </motion.p>

        <motion.p className="text-5xl font-black font-mono mb-4"
          style={{ background: 'linear-gradient(90deg,#00f5ff,#00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}>
          {multiplier.toFixed(2)}×
        </motion.p>

        <motion.div className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <p className="text-xs font-mono mb-1" style={{ color: 'rgba(0,245,255,0.6)' }}>PROFIT</p>
          <p className="text-3xl font-black font-mono text-white">
            +{profit.toFixed(4)} <span style={{ color: '#00f5ff' }}>{currency}</span>
          </p>
        </motion.div>

        <motion.button onClick={onClose}
          className="w-full py-4 rounded-2xl font-black font-mono text-black text-base"
          style={{ background: 'linear-gradient(135deg, #00f5ff, #00cc99)', boxShadow: '0 0 30px rgba(0,245,255,0.4)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          💎 PLAY AGAIN
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Boom Modal ─────────────────────────────────────────────────────────────
function BoomModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="relative w-full max-w-sm rounded-3xl text-center p-8"
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          border: '1px solid rgba(255,0,60,0.4)',
          boxShadow: '0 0 60px rgba(255,0,60,0.15)',
        }}
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={e => e.stopPropagation()}>

        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,0,60,0.12) 0%, transparent 70%)' }} />

        <motion.div className="text-7xl mb-4"
          animate={{ scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, 10, -10, 5, 0] }}
          transition={{ duration: 0.5 }}>
          💣
        </motion.div>
        <p className="text-2xl font-black font-mono mb-1" style={{ color: '#ff003c' }}>BOOM!</p>
        <p className="text-sm font-mono mb-6" style={{ color: 'rgba(255,0,60,0.6)' }}>You hit a mine! Better luck next time</p>
        <motion.button onClick={onClose}
          className="w-full py-4 rounded-2xl font-black font-mono text-white"
          style={{ background: 'rgba(255,0,60,0.15)', border: '1px solid rgba(255,0,60,0.4)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          Try Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Game ──────────────────────────────────────────────────────────────
export function DiamondMinesGame() {
  const { placeBet, addWinnings, recordLoss } = useWallet();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [cells, setCells] = useState<Cell[]>([]);
  const [mineCount, setMineCount] = useState(3);
  const [revealed, setRevealed] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [betCurrency, setBetCurrency] = useState<Currency>('TON');
  const [_multiplier, setMultiplier] = useState(1); // tracked via currentMult derived value
  const [showWinModal, setShowWinModal] = useState(false);
  const [showBoomModal, setShowBoomModal] = useState(false);
  const [cashoutProfit, setCashoutProfit] = useState(0);
  const [cashoutMult, setCashoutMult] = useState(1);

  useEffect(() => () => stopAllGameSounds(), []);

  const currentMult = getMultiplier(revealed, mineCount);
  const potentialPayout = +(betAmount * currentMult).toFixed(6);
  const profit = +(potentialPayout - betAmount).toFixed(6);

  const startGame = useCallback((amount: number, currency: Currency) => {
    if (!placeBet(amount, currency)) return;
    setBetAmount(amount);
    setBetCurrency(currency);
    setRevealed(0);
    setMultiplier(1);
    setCells(generateGrid(mineCount));
    setPhase('playing');
  }, [placeBet, mineCount]);

  const revealCell = useCallback((idx: number) => {
    if (phase !== 'playing') return;
    const cell = cells[idx];
    if (cell.state !== 'hidden') return;

    playClick();

    if (cell.hasMine) {
      // Bias: turn mine into safe click in ~80% of cases
      if (Math.random() < WIN_RATE) {
        const candidates = cells
          .map((c, i) => ({ c, i }))
          .filter(x => x.i !== idx && x.c.state === 'hidden' && !x.c.hasMine);

        if (candidates.length > 0) {
          const moveTo = candidates[Math.floor(Math.random() * candidates.length)].i;
          const newRevealed = revealed + 1;
          const newCells = cells.map((c, i) => {
            if (i === idx) return { ...c, hasMine: false, state: 'diamond' as CellState };
            if (i === moveTo) return { ...c, hasMine: true };
            return c;
          });
          setCells(newCells);
          setRevealed(newRevealed);
          const newMult = getMultiplier(newRevealed, mineCount);
          setMultiplier(newMult);

          const safeLeft = GRID_SIZE - mineCount - newRevealed;
          if (safeLeft === 0) {
            handleCashout(newRevealed, newCells, newMult, betAmount, betCurrency);
          } else {
            playWin();
          }
          return;
        }
      }

      // Hit mine — reveal all
      const newCells = cells.map((c, i) =>
        i === idx
          ? { ...c, state: 'mine' as CellState }
          : c
      );
      setCells(newCells);
      playLoss();
      recordLoss(betAmount, betCurrency, 'Diamond Mines');
      setPhase('lost');
      setTimeout(() => setShowBoomModal(true), 300);
    } else {
      const newRevealed = revealed + 1;
      const newCells = cells.map((c, i) =>
        i === idx ? { ...c, state: 'diamond' as CellState } : c
      );
      setCells(newCells);
      setRevealed(newRevealed);
      const newMult = getMultiplier(newRevealed, mineCount);
      setMultiplier(newMult);

      const safeLeft = GRID_SIZE - mineCount - newRevealed;
      if (safeLeft === 0) {
        // Revealed all safe cells — auto cashout
        handleCashout(newRevealed, newCells, newMult, betAmount, betCurrency);
      } else {
        playWin();
      }
    }
  }, [phase, cells, revealed, mineCount, betAmount, betCurrency, recordLoss]);

  const handleCashout = useCallback((
    revCount = revealed,
    currentCells = cells,
    mult = currentMult,
    amount = betAmount,
    currency = betCurrency
  ) => {
    if (phase !== 'playing' || revCount === 0) return;

    const payout = +(amount * mult).toFixed(8);
    const prof = +(payout - amount).toFixed(8);

    // Reveal remaining cells
    setCells(currentCells.map(c =>
      c.state === 'hidden' && c.hasMine ? { ...c, state: 'mine' as CellState } : c
    ));

    addWinnings(payout, currency, 'Diamond Mines');
    setCashoutProfit(prof);
    setCashoutMult(mult);
    playBigWin();
    setPhase('won');
    setTimeout(() => setShowWinModal(true), 200);
  }, [phase, revealed, cells, currentMult, betAmount, betCurrency, addWinnings]);

  const resetGame = useCallback(() => {
    setPhase('idle');
    setCells([]);
    setRevealed(0);
    setMultiplier(1);
    setBetAmount(0);
    setShowWinModal(false);
    setShowBoomModal(false);
  }, []);

  const safeLeft = GRID_SIZE - mineCount - revealed;
  const mineChance = mineCount / (GRID_SIZE - revealed);

  return (
    <>
      <div className="space-y-4">

        {/* Header stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'MULTIPLIER', value: phase === 'playing' ? `${currentMult.toFixed(2)}×` : '1.00×', color: '#00f5ff' },
            { label: 'SAFE LEFT', value: phase === 'playing' ? `${safeLeft}` : `${GRID_SIZE - mineCount}`, color: '#00ff88' },
            { label: 'MINE CHANCE', value: phase === 'playing' ? `${(mineChance * 100).toFixed(0)}%` : `${((mineCount / GRID_SIZE) * 100).toFixed(0)}%`, color: '#ff003c' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center cyber-card" style={{ border: `1px solid ${s.color}33` }}>
              <p className="text-sm font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] mt-0.5 font-mono" style={{ color: `${s.color}66` }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mine selector (idle only) */}
        {phase === 'idle' && (
          <div className="rounded-2xl p-4 cyber-card space-y-3" style={{ border: '1px solid #1e1e3a' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black font-mono" style={{ color: '#ff003c88' }}>💣 MINES COUNT</p>
              <p className="text-xs font-black font-mono px-2 py-0.5 rounded"
                style={{ background: '#ff003c22', color: '#ff003c', border: '1px solid #ff003c44' }}>
                {mineCount} mines
              </p>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {MINE_OPTIONS.map(n => (
                <button key={n}
                  onClick={() => { playClick(); setMineCount(n); }}
                  className="py-2 rounded-xl text-xs font-black font-mono transition-all active:scale-95"
                  style={mineCount === n ? {
                    background: '#ff003c22', border: '1px solid #ff003c55', color: '#ff003c',
                    boxShadow: '0 0 10px #ff003c22',
                  } : { background: '#13131f', border: '1px solid #1e1e3a', color: '#ffffff44' }}>
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-mono text-center" style={{ color: '#ffffff33' }}>
              More mines = higher risk = bigger multiplier
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#0f172a,#1e293b)',
            border: phase === 'playing'
              ? '1px solid rgba(0,245,255,0.25)'
              : phase === 'lost'
                ? '1px solid rgba(255,0,60,0.3)'
                : phase === 'won'
                  ? '1px solid rgba(0,255,136,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
            boxShadow: phase === 'playing' ? '0 0 30px rgba(0,245,255,0.08)' : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}>
          <div className="h-px w-full" style={{
            background: phase === 'playing'
              ? 'linear-gradient(90deg,transparent,#00f5ff,transparent)'
              : phase === 'lost'
                ? 'linear-gradient(90deg,transparent,#ff003c,transparent)'
                : 'linear-gradient(90deg,transparent,#1e1e3a,transparent)',
          }} />

          <div className="p-4">
            {phase === 'idle' ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: GRID_SIZE }, (_, i) => (
                  <motion.div key={i}
                    className="aspect-square rounded-xl flex items-center justify-center"
                    style={{ background: '#13131f', border: '1px solid #1e1e3a' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, delay: i * 0.04, repeat: Infinity }}>
                    <span className="text-base">◈</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {cells.map((cell, idx) => {
                  const { emoji, color, bg, border } = getCellEmoji(cell, phase);
                  const isClickable = phase === 'playing' && cell.state === 'hidden';

                  return (
                    <motion.button key={cell.id}
                      onClick={() => revealCell(idx)}
                      disabled={!isClickable}
                      className="aspect-square rounded-xl flex items-center justify-center text-xl font-black relative overflow-hidden transition-all"
                      style={{ background: bg, border: `1px solid ${border}`, cursor: isClickable ? 'pointer' : 'default' }}
                      whileHover={isClickable ? { scale: 1.08, boxShadow: `0 0 15px ${color}44` } : {}}
                      whileTap={isClickable ? { scale: 0.92 } : {}}
                      initial={cell.state !== 'hidden' ? { scale: 0.5, opacity: 0 } : {}}
                      animate={cell.state !== 'hidden' ? { scale: 1, opacity: 1 } : {}}>

                      {isClickable && (
                        <motion.div className="absolute inset-0 rounded-xl"
                          style={{ background: 'rgba(0,245,255,0.04)' }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                      )}

                      {cell.state === 'hidden' ? (
                        <span style={{ color: '#ffffff22', fontSize: 16 }}>◈</span>
                      ) : (
                        <motion.span
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}>
                          {emoji}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live potential payout (while playing) */}
        <AnimatePresence>
          {phase === 'playing' && revealed > 0 && (
            <motion.div
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.25)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div>
                <p className="text-xs font-mono" style={{ color: 'rgba(0,245,255,0.6)' }}>CURRENT VALUE</p>
                <p className="text-lg font-black font-mono text-white">
                  {potentialPayout.toFixed(4)} <span style={{ color: '#00f5ff' }}>{betCurrency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono" style={{ color: 'rgba(0,255,136,0.6)' }}>PROFIT</p>
                <p className="text-base font-black font-mono" style={{ color: '#00ff88' }}>
                  +{profit.toFixed(4)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cash Out button */}
        <AnimatePresence>
          {phase === 'playing' && revealed > 0 && (
            <motion.button
              onClick={() => handleCashout()}
              className="relative w-full py-5 rounded-2xl font-black font-mono text-lg text-black overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#00f5ff,#00cc99)', boxShadow: '0 0 30px rgba(0,245,255,0.4)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 50px rgba(0,245,255,0.6)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <motion.div className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                💎 CASH OUT — {potentialPayout.toFixed(4)} {betCurrency}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Start / Play Again */}
        {phase === 'idle' && (
          <BetControls onBet={startGame} label="💎 Start Mining" />
        )}

        {(phase === 'lost' || phase === 'won') && (
          <motion.button onClick={resetGame}
            className="w-full py-4 rounded-xl font-black font-mono text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#ffd700,#ff8800)', color: '#000', boxShadow: '0 0 20px #ffd70033' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            ⛏ New Game
          </motion.button>
        )}

        {/* Mines revealed info */}
        {phase === 'playing' && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00f5ff]" />
              <span className="text-[10px] font-mono" style={{ color: '#00f5ff88' }}>
                {revealed} DIAMONDS FOUND · {mineCount} MINES HIDDEN
              </span>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>
              House edge 3%
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showWinModal && (
          <WinModal
            profit={cashoutProfit}
            currency={betCurrency}
            multiplier={cashoutMult}
            onClose={() => { setShowWinModal(false); resetGame(); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBoomModal && (
          <BoomModal onClose={() => { setShowBoomModal(false); resetGame(); }} />
        )}
      </AnimatePresence>
    </>
  );
}
