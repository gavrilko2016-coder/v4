import crypto from 'crypto';

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hmacSha256Hex(key, message) {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}

export function randomFloatFromHmac(serverSeed, clientSeed, nonce) {
  const msg = `${clientSeed}:${nonce}`;
  const hex = hmacSha256Hex(serverSeed, msg);

  // Use first 52 bits to build a float in [0, 1)
  const slice = hex.slice(0, 13); // 13 hex chars = 52 bits
  const int = Number.parseInt(slice, 16);
  const max = 2 ** 52;
  return int / max;
}
