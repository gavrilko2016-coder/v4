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

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`cryptobet-server listening on http://localhost:${port}`);
});
