import { useRef, useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { BetControls } from '../components/BetControls';
import { useLanguage } from '../context/LanguageContext';
import { playCardDeal, playCardFlip, playWin, playBigWin, playLoss, stopAllGameSounds } from '../utils/sounds';
import { dealBlackjack as apiDealBlackjack } from '../api/casino';
import { pfCreateRound } from '../api/provablyFair';
import { RTP } from '../config/rtp';
import type { Currency } from '../types';
const BLACKJACK_PAYOUT_MULT = 2.5 * (RTP.BLACKJACK / 0.99);

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
interface Card { rank: Rank; suit: Suit; hidden?: boolean }
type GamePhase = 'idle' | 'player' | 'dealer' | 'result';
type GameResult = 'player' | 'dealer' | 'push' | 'blackjack' | 'bust';

function cardValue(c: Card): number {
  if (c.hidden) return 0;
  if (['J','Q','K'].includes(c.rank)) return 10;
  if (c.rank === 'A') return 11;
  return parseInt(c.rank);
}
function handValue(hand: Card[]): number {
  let total = hand.filter(c => !c.hidden).reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter(c => !c.hidden && c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
function isBlackjack(hand: Card[]): boolean { return hand.length === 2 && handValue(hand) === 21; }

function CardView({ card, index }: { card: Card; index: number }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  if (card.hidden) {
    return (
      <div
        className="w-12 h-16 rounded-lg flex items-center justify-center text-sm font-black relative flex-shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg,#0a2a6e,#1a1a4e)',
          border: '1.5px solid #1e3a8a',
          transform: `translateX(${index * 4}px) rotate(${(index % 2 === 0 ? 1 : -1) * 0.5}deg)`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
        <span style={{ fontSize: 22 }}>🂠</span>
      </div>
    );
  }
  return (
    <div
      className="w-12 h-16 rounded-lg flex flex-col relative flex-shrink-0 shadow-lg"
      style={{
        background: '#f5f5f5',
        border: `1.5px solid ${isRed ? '#cc2222' : '#333'}`,
        transform: `translateX(${index * 4}px) rotate(${(index % 2 === 0 ? 0.5 : -0.5)}deg)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        padding: '3px 4px',
      }}>
      <div style={{ fontSize: 9, fontWeight: 900, color: isRed ? '#cc0000' : '#111', fontFamily: 'monospace', lineHeight: 1 }}>
        {card.rank}<br />{card.suit}
      </div>
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: 18, color: isRed ? '#cc0000' : '#111', pointerEvents: 'none' }}>
        {card.suit}
      </div>
      <div className="absolute bottom-0.5 right-1" style={{ fontSize: 9, fontWeight: 900, color: isRed ? '#cc0000' : '#111', fontFamily: 'monospace', transform: 'rotate(180deg)', lineHeight: 1 }}>
        {card.rank}<br />{card.suit}
      </div>
    </div>
  );
}

function Hand({ cards, label, value, active }: { cards: Card[]; label: string; value: number; active?: boolean }) {
  const color = active ? '#00f5ff' : '#00ff44';
  const bust = value > 21;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-black" style={{ color: color + '88' }}>{label}</span>
        {cards.length > 0 && (
          <span className="px-2 py-0.5 rounded-md text-xs font-black font-mono"
            style={{ background: bust ? '#ff003c22' : `${color}22`, border: `1px solid ${bust ? '#ff003c' : color}44`, color: bust ? '#ff003c' : color }}>
            {value > 0 ? value : '?'}{bust ? ' BUST!' : ''}
          </span>
        )}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {cards.map((c, i) => <CardView key={i} card={c} index={i} />)}
        {cards.length === 0 && (
          <div className="w-12 h-16 rounded-lg border border-dashed flex items-center justify-center text-xs font-mono"
            style={{ borderColor: `${color}33`, color: `${color}33` }}>?</div>
        )}
      </div>
    </div>
  );
}

export function BlackjackGame() {
  const { placeBet, refundBet, addWinnings, recordLoss, userId } = useWallet();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [betAmount, setBetAmount] = useState(0);
  const [betCurrency, setBetCurrency] = useState<Currency>('TON');
  const [result, setResult] = useState<GameResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const nonceRef = useRef(0);

  useEffect(() => () => stopAllGameSounds(), []);

  const dealGame = (amount: number, currency: Currency) => {
    if (!placeBet(amount, currency)) return;
    setBetAmount(amount);
    setBetCurrency(currency);
    setResult(null);

    nonceRef.current += 1;
    const clientSeed = userId || 'guest';

    (async () => {
      try {
        const { roundId } = await pfCreateRound();
        const { deck: dealt } = await apiDealBlackjack({ roundId, clientSeed, nonce: nonceRef.current });
        const newDeck = [...(dealt as Card[])];
        const p: Card[] = [newDeck.pop()!, newDeck.pop()!];
        const d: Card[] = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];
        playCardDeal();
        setDeck(newDeck);
        setPlayerHand(p);
        setDealerHand(d);

        if (isBlackjack(p)) {
          const revD = d.map(c => ({ ...c, hidden: false }));
          setDealerHand(revD);
          if (isBlackjack(revD)) {
            setResult('push');
            addWinnings(amount, currency, 'Blackjack');
            playWin();
          } else {
            const payout = +(amount * BLACKJACK_PAYOUT_MULT).toFixed(8);
            addWinnings(payout, currency, 'Blackjack');
            setResult('blackjack');
            playBigWin();
          }
          setPhase('result');
        } else {
          setPhase('player');
        }
      } catch {
        refundBet(amount, currency, 'Blackjack');
        setResult(null);
        setPhase('idle');
      }
    })();
  };

  const hit = () => {
    if (phase !== 'player' || processing) return;
    playCardFlip();
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    setDeck(newDeck);
    setPlayerHand(newHand);
    const val = handValue(newHand);
    if (val > 21) {
      recordLoss(betAmount, betCurrency, 'Blackjack');
      const revD = dealerHand.map(c => ({ ...c, hidden: false }));
      setDealerHand(revD);
      setResult('bust');
      setPhase('result');
      playLoss();
    } else if (val === 21) {
      standInternal(newHand, newDeck);
    }
  };

  const standInternal = async (currentHand = playerHand, currentDeck = deck) => {
    if (processing) return;
    setProcessing(true);
    setPhase('dealer');
    let d: Card[] = dealerHand.map(c => ({ ...c, hidden: false }));
    setDealerHand(d);
    playCardFlip();
    let dk = [...currentDeck];
    await new Promise(r => setTimeout(r, 600));
    while (handValue(d) < 17) {
      const card = dk.pop()!;
      d = [...d, card];
      setDealerHand([...d]);
      playCardFlip();
      await new Promise(r => setTimeout(r, 600));
    }
    setDeck(dk);
    const pVal = handValue(currentHand);
    const dVal = handValue(d);
    let res: GameResult;
    if (dVal > 21 || pVal > dVal) {
      res = 'player';
      addWinnings(+(betAmount * 2).toFixed(8), betCurrency, 'Blackjack');
      playWin();
    } else if (dVal > pVal) {
      res = 'dealer';
      recordLoss(betAmount, betCurrency, 'Blackjack');
      playLoss();
    } else {
      res = 'push';
      addWinnings(betAmount, betCurrency, 'Blackjack');
      playWin();
    }
    setResult(res);
    setPhase('result');
    setProcessing(false);
  };

  const stand = () => standInternal();

  const reset = () => {
    setPhase('idle');
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setBetAmount(0);
  };

  const resultConfig: Record<GameResult, { label: string; color: string; emoji: string }> = {
    player:    { label: t.youWin,     color: '#00ff88', emoji: '🎉' },
    dealer:    { label: t.dealerWins, color: '#ff003c', emoji: '😞' },
    push:      { label: t.push,       color: '#ffd700', emoji: '🤝' },
    blackjack: { label: t.blackjack,  color: '#bf00ff', emoji: '🃏' },
    bust:      { label: t.bust,       color: '#ff003c', emoji: '💥' },
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-2xl p-4 space-y-4 cyber-card"
        style={{ border: '1px solid #00ff4422', background: 'linear-gradient(180deg,#0a1a0a,#080f08)', minHeight: 240 }}>

        {/* Pattern overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #00ff4411 0%, transparent 70%)' }} />

        <Hand cards={dealerHand} label={t.dealerHand.toUpperCase()} value={handValue(dealerHand)} />

        {(phase === 'idle' && playerHand.length === 0) && (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <span className="text-4xl">🃏</span>
            <p className="text-sm font-black font-mono" style={{ color: '#00f5ff88' }}>Place a bet to start</p>
            <p className="text-xs font-mono" style={{ color: '#ffffff33' }}>Blackjack pays 2.5× · Win pays 2× · Push returns 1×</p>
          </div>
        )}

        <Hand cards={playerHand} label={t.yourHand.toUpperCase()} value={handValue(playerHand)} active={phase === 'player'} />
      </div>

      {/* Result banner */}
      {result && phase === 'result' && (
        <div className="text-center py-3 rounded-xl font-black font-mono text-sm border"
          style={{ background: `${resultConfig[result].color}11`, borderColor: `${resultConfig[result].color}44`, color: resultConfig[result].color }}>
          {resultConfig[result].emoji} {resultConfig[result].label}
          {result === 'player' && <span className="block text-xs mt-0.5 opacity-75">+{(betAmount * 2).toFixed(4)} {betCurrency}</span>}
          {result === 'blackjack' && <span className="block text-xs mt-0.5 opacity-75">+{(betAmount * BLACKJACK_PAYOUT_MULT).toFixed(4)} {betCurrency} ({BLACKJACK_PAYOUT_MULT.toFixed(2)}×)</span>}
        </div>
      )}

      {/* Dealer thinking */}
      {phase === 'dealer' && (
        <div className="flex items-center justify-center gap-3 py-4 rounded-xl"
          style={{ background: '#ffd70011', border: '1px solid #ffd70033' }}>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#ffd700', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <span className="text-sm font-black font-mono" style={{ color: '#ffd700' }}>Dealer thinking...</span>
        </div>
      )}

      {/* Hit / Stand */}
      {phase === 'player' && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={hit} disabled={processing}
            className="py-4 rounded-xl font-black font-mono text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#00f5ff22,#00f5ff33)', border: '1px solid #00f5ff55', color: '#00f5ff', boxShadow: '0 0 15px #00f5ff22' }}>
            👆 {t.hit}
          </button>
          <button onClick={stand} disabled={processing}
            className="py-4 rounded-xl font-black font-mono text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#ff006e22,#ff006e33)', border: '1px solid #ff006e55', color: '#ff006e', boxShadow: '0 0 15px #ff006e22' }}>
            ✋ {t.stand}
          </button>
        </div>
      )}

      {/* Play Again */}
      {phase === 'result' && (
        <button onClick={reset}
          className="w-full py-4 rounded-xl font-black font-mono text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#ffd700,#ff8800)', color: '#000', boxShadow: '0 0 20px #ffd70033' }}>
          🃏 Play Again
        </button>
      )}

      {/* Deal */}
      {phase === 'idle' && (
        <>
          <BetControls onBet={dealGame} label={`🃏 ${t.dealCards}`} />
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Blackjack', value: '2.5×', color: '#bf00ff' },
              { label: 'Win', value: '2×', color: '#00ff88' },
              { label: 'Push', value: '1×', color: '#ffd700' },
            ].map(r => (
              <div key={r.label} className="rounded-xl p-2.5 cyber-card" style={{ border: `1px solid ${r.color}33` }}>
                <p className="text-sm font-black font-mono" style={{ color: r.color }}>{r.value}</p>
                <p className="text-[9px] mt-0.5 font-mono" style={{ color: `${r.color}66` }}>{r.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
