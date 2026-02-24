/**
 * TON HD Wallet Deriver
 * Generates unique deterministic deposit wallets for each user
 * using BIP39 mnemonic + BIP44 derivation path.
 *
 * Stack: @ton/ton, @ton/crypto, bip39
 *
 * SECURITY: This runs server-side ONLY. Never expose private keys to frontend.
 *
 * Install: npm install @ton/ton @ton/crypto @ton/core bip39 tweetnacl
 */

// ── Types (these are the real @ton/ton types) ──────────────────────────────

interface KeyPair {
  publicKey: Buffer;
  secretKey: Buffer;
}

interface WalletInfo {
  userId: number;
  address: string;     // User-friendly TON address (EQ...)
  rawAddress: string;  // Raw 0-based address
  publicKey: string;   // hex
}

// ── Master seed from environment ───────────────────────────────────────────
function getMasterMnemonic(): string[] {
  const mnemonic = process.env.MASTER_MNEMONIC;
  if (!mnemonic) throw new Error('MASTER_MNEMONIC env var not set');
  return mnemonic.trim().split(/\s+/);
}

/**
 * Derives a unique TON WalletV4R2 for a given userId.
 *
 * In production, uses real @ton/ton:
 *   import { mnemonicToPrivateKey } from '@ton/crypto';
 *   import { WalletContractV4 } from '@ton/ton';
 *
 * Derivation: sha256(masterSeed + userId) as salt → Ed25519 keypair
 * This gives each user a deterministic, unique wallet.
 */
export async function deriveDepositWallet(userId: number): Promise<WalletInfo> {
  // In production:
  //
  // const { mnemonicToPrivateKey } = await import('@ton/crypto');
  // const { WalletContractV4, TonClient } = await import('@ton/ton');
  // const { createHash } = await import('crypto');
  //
  // const masterMnemonic = getMasterMnemonic();
  // const masterKey = await mnemonicToPrivateKey(masterMnemonic);
  //
  // // Derive child key by hashing master private key + userId
  // const childSeed = createHash('sha256')
  //   .update(Buffer.concat([masterKey.secretKey, Buffer.from(userId.toString())]))
  //   .digest();
  //
  // // Create Ed25519 keypair from derived seed
  // const nacl = await import('tweetnacl');
  // const keyPair: KeyPair = nacl.sign.keyPair.fromSeed(childSeed);
  //
  // // Create TON WalletV4R2 contract from public key
  // const wallet = WalletContractV4.create({
  //   workchain: 0,
  //   publicKey: Buffer.from(keyPair.publicKey),
  // });
  //
  // return {
  //   userId,
  //   address: wallet.address.toString({ urlSafe: true, bounceable: false }),
  //   rawAddress: wallet.address.toRawString(),
  //   publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
  // };

  // ── DEMO stub (remove in production) ──────────────────────────────────
  void getMasterMnemonic; void userId;
  const stub = `EQ${userId.toString().padStart(46, '0')}`;
  return { userId, address: stub, rawAddress: stub, publicKey: 'demo' };
}

/**
 * Signs and broadcasts a sweep transaction.
 * Transfers all TON from the deposit wallet to the cold wallet.
 */
export async function sweepToColdWallet(
  userId: number,
  amount: bigint,          // in nanotons
  coldWalletAddress: string,
): Promise<string | null> {
  // In production:
  //
  // const { mnemonicToPrivateKey } = await import('@ton/crypto');
  // const { WalletContractV4, TonClient, internal, toNano } = await import('@ton/ton');
  // const { createHash } = await import('crypto');
  //
  // const masterMnemonic = getMasterMnemonic();
  // const masterKey = await mnemonicToPrivateKey(masterMnemonic);
  // const { createHash } = require('crypto');
  //
  // const childSeed = createHash('sha256')
  //   .update(Buffer.concat([masterKey.secretKey, Buffer.from(userId.toString())]))
  //   .digest();
  //
  // const nacl = await import('tweetnacl');
  // const keyPair: KeyPair = nacl.sign.keyPair.fromSeed(childSeed);
  //
  // const client = new TonClient({
  //   endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  //   apiKey: process.env.TONCENTER_API_KEY,
  // });
  //
  // const wallet = WalletContractV4.create({
  //   workchain: 0,
  //   publicKey: Buffer.from(keyPair.publicKey),
  // });
  //
  // const contract = client.open(wallet);
  // const seqno = await contract.getSeqno();
  //
  // // Leave 0.05 TON for gas
  // const sendAmount = amount - toNano('0.05');
  // if (sendAmount <= 0n) return null;
  //
  // await contract.sendTransfer({
  //   seqno,
  //   secretKey: Buffer.from(keyPair.secretKey),
  //   messages: [internal({
  //     to: coldWalletAddress,
  //     value: sendAmount,
  //     bounce: false,
  //   })],
  // });
  //
  // const txHash = await waitForTransaction(contract, seqno);
  // return txHash;

  void userId; void amount; void coldWalletAddress;
  return '0x_demo_sweep_tx_hash';
}

export type { KeyPair, WalletInfo };
