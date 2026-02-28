import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { sha256Hex, randomFloatFromHmac } from './provablyFair.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// In production, store this in DB/Redis with TTL.
// Map<roundId, { serverSeed, serverSeedHash, createdAt }>
const rounds = new Map();

function newServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

function createPfProof({ roundId, serverSeedHash, serverSeed, clientSeed, nonce }) {
  return { roundId, serverSeedHash, serverSeed, clientSeed, nonce };
}

function pfDraw(clientSeed, nonce) {
  const serverSeed = newServerSeed();
  const serverSeedHash = sha256Hex(serverSeed);
  const roundId = crypto.randomUUID();

  rounds.set(roundId, {
    serverSeed,
    serverSeedHash,
    createdAt: Date.now(),
  });

  const r = randomFloatFromHmac(serverSeed, clientSeed, nonce);
  return { roundId, serverSeedHash, serverSeed, clientSeed, nonce, random: r };
}

function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(0.999999999, x));
}

function seedFromRandom(r) {
  return Math.floor(clamp01(r) * 2 ** 32);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Create a round with commit hash (server seed hash)
app.post('/api/pf/round', (req, res) => {
  const serverSeed = newServerSeed();
  const serverSeedHash = sha256Hex(serverSeed);
  const roundId = crypto.randomUUID();

  rounds.set(roundId, {
    serverSeed,
    serverSeedHash,
    createdAt: Date.now(),
  });

  res.json({ roundId, serverSeedHash });
});

// Reveal server seed for a round (typically after bet is settled)
app.post('/api/pf/reveal', (req, res) => {
  const { roundId } = req.body || {};
  if (!roundId || typeof roundId !== 'string') {
    res.status(400).json({ error: 'roundId is required' });
    return;
  }

  const round = rounds.get(roundId);
  if (!round) {
    res.status(404).json({ error: 'round not found' });
    return;
  }

  res.json({ roundId, serverSeed: round.serverSeed, serverSeedHash: round.serverSeedHash });
});

// Deterministic RNG value for a round (derivable by player after reveal)
app.post('/api/pf/random', (req, res) => {
  const { roundId, clientSeed, nonce } = req.body || {};

  if (!roundId || typeof roundId !== 'string') {
    res.status(400).json({ error: 'roundId is required' });
    return;
  }
  if (!clientSeed || typeof clientSeed !== 'string') {
    res.status(400).json({ error: 'clientSeed is required' });
    return;
  }
  const n = Number(nonce);
  if (!Number.isInteger(n) || n < 0) {
    res.status(400).json({ error: 'nonce must be an integer >= 0' });
    return;
  }

  const round = rounds.get(roundId);
  if (!round) {
    res.status(404).json({ error: 'round not found' });
    return;
  }

  const r = randomFloatFromHmac(round.serverSeed, clientSeed, n);
  res.json({ roundId, random: r, serverSeedHash: round.serverSeedHash });
});

app.post('/api/games/coinflip/play', (req, res) => {
  const { clientSeed, nonce, betAmount, choice } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });
  const bet = Number(betAmount);
  if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ error: 'betAmount must be > 0' });
  if (choice !== 'heads' && choice !== 'tails') return res.status(400).json({ error: 'choice must be heads|tails' });

  const draw = pfDraw(clientSeed, n);
  const outcome = draw.random < 0.5 ? 'heads' : 'tails';

  const multiplier = 1.98;
  const won = outcome === choice;
  const payout = won ? +(bet * multiplier).toFixed(8) : 0;

  res.json({ outcome, won, multiplier, payout, proof: createPfProof(draw) });
});

app.post('/api/games/dice/play', (req, res) => {
  const { clientSeed, nonce, betAmount, mode, target } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });
  const bet = Number(betAmount);
  if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ error: 'betAmount must be > 0' });
  if (mode !== 'over' && mode !== 'under') return res.status(400).json({ error: 'mode must be over|under' });
  const t = Number(target);
  if (!Number.isInteger(t) || t < 2 || t > 12) return res.status(400).json({ error: 'target must be integer 2..12' });

  const HOUSE_EDGE = 0.01;
  const draw = pfDraw(clientSeed, n);
  const idx = Math.min(35, Math.floor(clamp01(draw.random) * 36));
  const d1 = Math.floor(idx / 6) + 1;
  const d2 = (idx % 6) + 1;
  const roll = d1 + d2;

  const getWays = (val) => {
    if (val < 2 || val > 12) return 0;
    return 6 - Math.abs(7 - val);
  };

  let ways = 0;
  if (mode === 'over') {
    for (let i = t + 1; i <= 12; i++) ways += getWays(i);
  } else {
    for (let i = 2; i <= t; i++) ways += getWays(i);
  }
  const chance = ways / 36;
  const multiplier = chance > 0 ? +(((1 - HOUSE_EDGE) / chance).toFixed(2)) : 0;
  const won = mode === 'over' ? roll > t : roll <= t;
  const payout = won ? +(bet * multiplier).toFixed(8) : 0;

  res.json({ roll, d1, d2, won, multiplier, payout, proof: createPfProof(draw) });
});

app.post('/api/games/limbo/play', (req, res) => {
  const { clientSeed, nonce, betAmount, target } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });
  const bet = Number(betAmount);
  if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ error: 'betAmount must be > 0' });
  const t = Number(target);
  const clampedTarget = Math.max(1.01, Math.min(1000000, t));

  const HOUSE_EDGE = 0.01;
  const draw = pfDraw(clientSeed, n);
  const u = Math.max(1e-12, Math.min(1 - 1e-12, draw.random));
  const raw = (1 - HOUSE_EDGE) / u;
  const clamped = Math.max(1.0, Math.min(1000000, raw));
  const result = Math.floor(clamped * 100) / 100;
  const won = result >= clampedTarget;
  const multiplier = clampedTarget;
  const payout = won ? +(bet * clampedTarget).toFixed(8) : 0;

  res.json({ result, won, multiplier, payout, proof: createPfProof(draw) });
});

app.post('/api/games/slots/play', (req, res) => {
  const { clientSeed, nonce, betAmount } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });
  const bet = Number(betAmount);
  if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ error: 'betAmount must be > 0' });

  const RTP_TARGET = 0.96;
  const SYMBOLS = ['🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🎰', '🔔'];
  const PAYOUTS = {
    '🍋🍋🍋': 2, '🍊🍊🍊': 3, '🍇🍇🍇': 4, '⭐⭐⭐': 8,
    '💎💎💎': 15, '7️⃣7️⃣7️⃣': 25, '🎰🎰🎰': 50, '🔔🔔🔔': 100,
  };
  const expectedRtpForBasePaytable = () => {
    const nSym = SYMBOLS.length;
    const p3 = 1 / (nSym * nSym);
    const p2 = (3 * (nSym - 1)) / (nSym * nSym);
    const avgJackpot = Object.values(PAYOUTS).reduce((a, b) => a + b, 0) / nSym;
    const twoKindMult = 1.5;
    return p3 * avgJackpot + p2 * twoKindMult;
  };
  const BASE_RTP = expectedRtpForBasePaytable();
  const PAYOUT_SCALE = BASE_RTP > 0 ? (RTP_TARGET / BASE_RTP) : 1;

  const draw = pfDraw(clientSeed, n);
  const next = lcg(seedFromRandom(draw.random));
  const pick = () => SYMBOLS[Math.floor(next() * SYMBOLS.length)];
  const reels = [pick(), pick(), pick()];

  const key = reels.join('');
  let baseMultiplier = 0;
  let label = '💸 No match';
  if (PAYOUTS[key]) {
    baseMultiplier = PAYOUTS[key];
    label = '🎉 JACKPOT!';
  } else {
    const counts = reels.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const hasTwo = Object.values(counts).some(v => v >= 2);
    if (hasTwo) {
      baseMultiplier = 1.5;
      label = '✨ Two of a kind!';
    }
  }

  const multiplier = baseMultiplier > 0 ? +((baseMultiplier * PAYOUT_SCALE).toFixed(4)) : 0;
  const won = multiplier > 0;
  const payout = won ? +(bet * multiplier).toFixed(8) : 0;

  res.json({ reels, won, multiplier, payout, label, proof: createPfProof(draw) });
});

app.post('/api/games/crash/start', (req, res) => {
  const { clientSeed, nonce } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });

  const RTP_TARGET = 0.97;
  const HOUSE_EDGE = 1 - RTP_TARGET;
  const draw = pfDraw(clientSeed, n);
  const u = Math.max(1e-12, Math.min(1 - 1e-12, draw.random));
  const raw = (1 - HOUSE_EDGE) / u;
  const crashPoint = Math.max(1.0, Math.min(1000000, Math.floor(raw * 100) / 100));

  res.json({ crashPoint, proof: createPfProof(draw) });
});

app.post('/api/games/mines/start', (req, res) => {
  const { clientSeed, nonce, mineCount } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });
  const m = Number(mineCount);
  if (!Number.isInteger(m) || m < 1 || m > 24) return res.status(400).json({ error: 'mineCount must be integer 1..24' });

  const GRID_SIZE = 25;
  const draw = pfDraw(clientSeed, n);
  const next = lcg(seedFromRandom(draw.random));

  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const mines = indices.slice(0, m);

  res.json({ mines, proof: createPfProof(draw) });
});

app.post('/api/games/blackjack/deal', (req, res) => {
  const { clientSeed, nonce } = req.body || {};
  const n = Number(nonce);

  if (!clientSeed || typeof clientSeed !== 'string') return res.status(400).json({ error: 'clientSeed is required' });
  if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'nonce must be an integer >= 0' });

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });

  const draw = pfDraw(clientSeed, n);
  const next = lcg(seedFromRandom(draw.random));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  res.json({ deck, proof: createPfProof(draw) });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`cryptobet-server listening on http://localhost:${port}`);
});
