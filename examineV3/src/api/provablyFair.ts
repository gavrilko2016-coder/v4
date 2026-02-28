export type PfRound = {
  roundId: string;
  serverSeedHash: string;
};

export type PfReveal = {
  roundId: string;
  serverSeed: string;
  serverSeedHash: string;
};

export async function pfCreateRound(): Promise<PfRound> {
  const res = await fetch('/api/pf/round', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to create round');
  return res.json();
}

export async function pfRandom(roundId: string, clientSeed: string, nonce: number): Promise<{ random: number; serverSeedHash: string; roundId: string }> {
  const res = await fetch('/api/pf/random', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ roundId, clientSeed, nonce }),
  });
  if (!res.ok) throw new Error('Failed to get random');
  return res.json();
}

export async function pfReveal(roundId: string): Promise<PfReveal> {
  const res = await fetch('/api/pf/reveal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ roundId }),
  });
  if (!res.ok) throw new Error('Failed to reveal');
  return res.json();
}
