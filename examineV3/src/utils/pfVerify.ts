export async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

export async function randomFloatFromHmac(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
  const msg = `${clientSeed}:${nonce}`;
  const hex = await hmacSha256Hex(serverSeed, msg);
  const slice = hex.slice(0, 13);
  const int = Number.parseInt(slice, 16);
  const max = 2 ** 52;
  return int / max;
}

export async function verifyDiceRoll(params: { serverSeed: string; clientSeed: string; nonce: number }) {
  const r = await randomFloatFromHmac(params.serverSeed, params.clientSeed, params.nonce);
  const idx = Math.min(35, Math.floor(Math.max(0, Math.min(0.999999999, r)) * 36));
  const d1 = Math.floor(idx / 6) + 1;
  const d2 = (idx % 6) + 1;
  return { random: r, d1, d2, roll: d1 + d2 };
}
