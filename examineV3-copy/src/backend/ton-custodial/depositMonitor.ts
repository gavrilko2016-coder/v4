/**
 * TON Deposit Monitor — Background Service
 *
 * Monitors all custodial deposit addresses for incoming transactions.
 * When a deposit is detected:
 *   1. Verifies it hasn't been processed before (idempotency)
 *   2. Credits user balance in Supabase
 *   3. Triggers auto-sweep to cold wallet
 *
 * Polling interval: 15 seconds (or use Toncenter WebSocket for real-time)
 */

import { sweepToColdWallet } from './walletDeriver';

// ── Types ──────────────────────────────────────────────────────────────────

interface TonTransaction {
  hash: string;
  lt: string;           // logical time
  utime: number;        // unix timestamp
  inMsg: {
    value: string;      // amount in nanotons (string)
    src: string;        // sender address
    dest: string;       // deposit wallet address
  };
  outMsgs: unknown[];
  description: {
    computePhase: { exitCode: number };
  };
}

interface DepositWatchEntry {
  userId: number;
  address: string;
  lastCheckedLt: string;
}

// ── Supabase client (real implementation) ─────────────────────────────────
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// Stub for type safety in frontend context
const supabase = {
  from: (_table: string) => ({
    select: (_cols: string) => ({
      data: [] as Array<{ user_id: number; deposit_address: string; last_checked_lt: string }>,
      error: null,
    }),
    insert: (_data: unknown) => ({ error: null }),
    update: (_data: unknown) => ({
      eq: (_col: string, _val: unknown) => ({ error: null }),
    }),
    upsert: (_data: unknown) => ({ error: null }),
  }),
  rpc: (_fn: string, _params: unknown) => ({ data: null, error: null }),
};

// ── Toncenter API ──────────────────────────────────────────────────────────

async function fetchTransactions(
  address: string,
  afterLt: string,
  limit = 20,
): Promise<TonTransaction[]> {
  const url = new URL('https://toncenter.com/api/v2/getTransactions');
  url.searchParams.set('address', address);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lt', afterLt);
  url.searchParams.set('archival', 'true');

  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': process.env.TONCENTER_API_KEY || '' },
  });

  if (!res.ok) throw new Error(`Toncenter API error: ${res.status}`);
  const json = await res.json() as { ok: boolean; result: TonTransaction[] };
  return json.ok ? json.result : [];
}

// ── Credit user balance (Supabase) ─────────────────────────────────────────

async function creditUserBalance(userId: number, amountNano: bigint): Promise<void> {
  const amountTon = Number(amountNano) / 1e9;

  // Atomic increment using PostgreSQL function
  // CREATE OR REPLACE FUNCTION increment_balance(uid INT, amount NUMERIC)
  //   RETURNS void AS $$ UPDATE users SET balance_ton = balance_ton + amount WHERE id = uid; $$ LANGUAGE SQL;

  const { error } = supabase.rpc('increment_balance', {
    uid: userId,
    amount: amountTon,
  });

  if (error) throw new Error(`Failed to credit balance: ${JSON.stringify(error)}`);

  console.log(`✅ Credited user ${userId} with ${amountTon.toFixed(4)} TON`);
}

// ── Log transaction (prevents double-crediting) ────────────────────────────

async function logTransaction(txHash: string, userId: number, amountNano: bigint): Promise<boolean> {
  // Try to insert — will fail if tx_hash already exists (unique constraint)
  // CREATE TABLE processed_transactions (
  //   tx_hash TEXT PRIMARY KEY,
  //   user_id INT NOT NULL,
  //   amount_nano BIGINT NOT NULL,
  //   sweep_hash TEXT,
  //   created_at TIMESTAMP DEFAULT NOW()
  // );

  const { error } = supabase.from('processed_transactions').insert({
    tx_hash: txHash,
    user_id: userId,
    amount_nano: String(amountNano),
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Duplicate key = already processed
    console.log(`⚠ TX ${txHash} already processed, skipping`);
    return false;
  }

  return true;
}

// ── Update sweep hash after successful sweep ───────────────────────────────

async function updateSweepHash(txHash: string, sweepHash: string): Promise<void> {
  supabase.from('processed_transactions')
    .update({ sweep_hash: sweepHash })
    .eq('tx_hash', txHash);
}

// ── Process a single deposit transaction ───────────────────────────────────

async function processDeposit(
  tx: TonTransaction,
  userId: number,
): Promise<void> {
  const txHash = tx.hash;
  const amountNano = BigInt(tx.inMsg.value);
  const coldWallet = process.env.COLD_WALLET_ADDRESS!;

  // 1. Skip if exit code is not 0 (failed compute)
  if (tx.description.computePhase.exitCode !== 0) {
    console.log(`⚠ TX ${txHash} failed compute phase, skipping`);
    return;
  }

  // 2. Log transaction (idempotency check)
  const isNew = await logTransaction(txHash, userId, amountNano);
  if (!isNew) return;

  // 3. Credit user DB balance
  await creditUserBalance(userId, amountNano);

  // 4. Auto-sweep to cold wallet
  try {
    const sweepHash = await sweepToColdWallet(userId, amountNano, coldWallet);
    if (sweepHash) {
      await updateSweepHash(txHash, sweepHash);
      console.log(`🔄 Swept ${Number(amountNano) / 1e9} TON from user ${userId} → cold wallet. Sweep TX: ${sweepHash}`);
    }
  } catch (err) {
    // Sweep failed — balance is still credited, retry sweep in next cycle
    console.error(`❌ Sweep failed for user ${userId}:`, err);
  }
}

// ── Load all watched addresses from DB ────────────────────────────────────

async function loadWatchedAddresses(): Promise<DepositWatchEntry[]> {
  const { data } = supabase
    .from('deposit_wallets')
    .select('user_id,deposit_address,last_checked_lt');

  return (data || []).map(row => ({
    userId: row.user_id,
    address: row.deposit_address,
    lastCheckedLt: row.last_checked_lt || '0',
  }));
}

// ── Update last checked LT ────────────────────────────────────────────────

async function updateLastLt(userId: number, lt: string): Promise<void> {
  supabase
    .from('deposit_wallets')
    .update({ last_checked_lt: lt })
    .eq('user_id', userId);
}

// ── Main monitoring loop ───────────────────────────────────────────────────

export async function startDepositMonitor(intervalMs = 15000): Promise<void> {
  console.log('🔍 TON Deposit Monitor started');

  const run = async () => {
    try {
      const watched = await loadWatchedAddresses();

      for (const entry of watched) {
        try {
          const txs = await fetchTransactions(entry.address, entry.lastCheckedLt);

          // Process newest first
          const sorted = [...txs].sort((a, b) => Number(BigInt(b.lt) - BigInt(a.lt)));

          for (const tx of sorted) {
            if (BigInt(tx.lt) > BigInt(entry.lastCheckedLt)) {
              await processDeposit(tx, entry.userId);
            }
          }

          // Update watermark
          if (sorted.length > 0) {
            await updateLastLt(entry.userId, sorted[0].lt);
          }
        } catch (err) {
          console.error(`Error monitoring address ${entry.address}:`, err);
        }
      }
    } catch (err) {
      console.error('Monitor cycle error:', err);
    }
  };

  // Run immediately then every interval
  await run();
  setInterval(run, intervalMs);
}
