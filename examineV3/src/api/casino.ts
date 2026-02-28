import type { Currency } from '../types';

export type PfProof = {
  roundId: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json();
}

export function playCoinFlip(params: { roundId: string; clientSeed: string; nonce: number; betAmount: number; currency: Currency; choice: 'heads' | 'tails' }) {
  return postJson<{ outcome: 'heads' | 'tails'; won: boolean; multiplier: number; payout: number; proof: PfProof }>(
    '/api/games/coinflip/play',
    params,
  );
}

export function playDice(params: { roundId: string; clientSeed: string; nonce: number; betAmount: number; currency: Currency; mode: 'over' | 'under'; target: number }) {
  return postJson<{ roll: number; d1: number; d2: number; won: boolean; multiplier: number; payout: number; proof: PfProof }>(
    '/api/games/dice/play',
    params,
  );
}

export function playLimbo(params: { roundId: string; clientSeed: string; nonce: number; betAmount: number; currency: Currency; target: number }) {
  return postJson<{ result: number; won: boolean; multiplier: number; payout: number; proof: PfProof }>(
    '/api/games/limbo/play',
    params,
  );
}

export function playSlots(params: { roundId: string; clientSeed: string; nonce: number; betAmount: number; currency: Currency }) {
  return postJson<{ reels: string[]; won: boolean; multiplier: number; payout: number; label: string; proof: PfProof }>(
    '/api/games/slots/play',
    params,
  );
}

export function startCrash(params: { roundId: string; clientSeed: string; nonce: number }) {
  return postJson<{ crashPoint: number; proof: PfProof }>(
    '/api/games/crash/start',
    params,
  );
}

export function startMines(params: { roundId: string; clientSeed: string; nonce: number; mineCount: number }) {
  return postJson<{ mines: number[]; proof: PfProof }>(
    '/api/games/mines/start',
    params,
  );
}

export function dealBlackjack(params: { roundId: string; clientSeed: string; nonce: number }) {
  return postJson<{ deck: { rank: string; suit: string }[]; proof: PfProof }>(
    '/api/games/blackjack/deal',
    params,
  );
}
