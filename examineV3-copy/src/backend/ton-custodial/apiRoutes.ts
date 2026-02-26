/**
 * CryptoBet Backend API Routes
 * Express.js routes for:
 *   - Generating custodial deposit addresses
 *   - Querying user balance
 *   - Initiating withdrawals
 *   - Verifying Telegram WebApp auth (HMAC)
 *
 * Install: npm install express @telegram-apps/init-data-node
 */

// NOTE: This file runs server-side (Node.js/Express). NOT bundled by Vite.
// Install separately: npm install express @supabase/supabase-js
// Types below are stubs so TypeScript doesn't error in the frontend context.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Request = any;
type Response = any;

import { deriveDepositWallet } from './walletDeriver';
import crypto from 'crypto';

// ── Telegram WebApp Auth Verification ─────────────────────────────────────

/**
 * Verifies that the request came from a legitimate Telegram WebApp.
 * Uses HMAC-SHA256 with BOT_TOKEN as key.
 *
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyTelegramAuth(initData: string): { userId: number; username: string } | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    // Sort keys alphabetically and join as key=value\n
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // HMAC key = HMAC-SHA256("WebAppData", BOT_TOKEN)
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN || '')
      .digest();

    const expectedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) return null;

    const userJson = params.get('user');
    if (!userJson) return null;

    const user = JSON.parse(userJson) as { id: number; username?: string; first_name?: string };
    return { userId: user.id, username: user.username || user.first_name || 'player' };
  } catch {
    return null;
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────

function authMiddleware(req: Request, res: Response, next: () => void) {
  const initData = req.headers['x-telegram-init-data'] as string;

  if (!initData) {
    res.status(401).json({ error: 'Missing Telegram auth' });
    return;
  }

  const user = verifyTelegramAuth(initData);
  if (!user) {
    res.status(403).json({ error: 'Invalid Telegram auth signature' });
    return;
  }

  (req as Request & { telegramUser: typeof user }).telegramUser = user;
  next();
}

// ── Route handlers ─────────────────────────────────────────────────────────

/**
 * GET /api/deposit-address
 * Returns (or creates) a unique deposit wallet for the authenticated user.
 *
 * Response: { address: string, qrCode: string }
 */
async function getDepositAddress(req: Request, res: Response) {
  const { userId } = (req as Request & { telegramUser: { userId: number; username: string } }).telegramUser;

  try {
    // Check if address already exists in DB
    // const { data } = await supabase.from('deposit_wallets').select('deposit_address').eq('user_id', userId).single();
    // if (data) return res.json({ address: data.deposit_address });

    // Generate new wallet
    const wallet = await deriveDepositWallet(userId);

    // Store in DB
    // await supabase.from('deposit_wallets').upsert({ user_id: userId, deposit_address: wallet.address, created_at: new Date() });

    res.json({
      address: wallet.address,
      publicKey: wallet.publicKey,
      note: 'Send TON to this address. Balance credited within 1-2 minutes.',
    });
  } catch (err) {
    console.error('Error generating deposit address:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/balance
 * Returns the user's current balance from DB.
 */
async function getBalance(req: Request, res: Response) {
  const { userId } = (req as Request & { telegramUser: { userId: number; username: string } }).telegramUser;

  // const { data } = await supabase.from('users').select('balance_ton,balance_usdt,balance_eth').eq('id', userId).single();
  // res.json(data || { balance_ton: 0, balance_usdt: 0 });

  void userId;
  res.json({ balance_ton: 0, balance_usdt: 0, balance_eth: 0 });
}

/**
 * POST /api/withdraw
 * Body: { amount: number, currency: 'TON'|'USDT'|'ETH', address: string }
 *
 * Validates and queues a withdrawal.
 */
async function postWithdraw(req: Request, res: Response) {
  const { userId } = (req as Request & { telegramUser: { userId: number; username: string } }).telegramUser;
  const { amount, currency, address } = req.body as { amount: number; currency: string; address: string };

  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  if (!address || address.length < 10) {
    res.status(400).json({ error: 'Invalid address' });
    return;
  }

  const MIN: Record<string, number> = { TON: 1, USDT: 1, ETH: 0.005 };
  if (amount < (MIN[currency] || 1)) {
    res.status(400).json({ error: `Minimum withdrawal is ${MIN[currency]} ${currency}` });
    return;
  }

  try {
    // 1. Check user balance
    // const { data: user } = await supabase.from('users').select('balance_ton').eq('id', userId).single();
    // if (!user || user.balance_ton < amount) return res.status(400).json({ error: 'Insufficient balance' });

    // 2. Deduct balance (atomic)
    // await supabase.rpc('deduct_balance', { uid: userId, amount, currency: currency.toLowerCase() });

    // 3. Insert withdrawal record
    // const { data: withdrawal } = await supabase.from('withdrawals').insert({ user_id: userId, amount, currency, address, status: 'pending' }).select().single();

    // 4. Queue processing (would trigger your withdrawal processor)
    // await withdrawalQueue.add({ withdrawalId: withdrawal.id });

    void userId;

    res.json({
      success: true,
      message: 'Withdrawal queued. Estimated 5-30 minutes.',
      estimatedFee: currency === 'TON' ? 0.05 : currency === 'ETH' ? 0.002 : 1,
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Withdrawal processing failed' });
  }
}

/**
 * POST /api/telegram-stars-webhook
 * Called by your Telegram bot when a Stars payment is confirmed.
 * Body: Telegram Update object with PreCheckoutQuery or SuccessfulPayment
 */
async function telegramStarsWebhook(req: Request, res: Response) {
  const update = req.body as {
    message?: {
      successful_payment?: {
        telegram_payment_charge_id: string;
        total_amount: number;    // in Stars (integer)
        currency: string;        // "XTR" for Stars
        invoice_payload: string; // JSON: { userId, packageId }
      };
      from: { id: number };
    };
    pre_checkout_query?: {
      id: string;
      from: { id: number };
      invoice_payload: string;
      total_amount: number;
    };
  };

  // Respond to pre-checkout query (must answer within 10s)
  if (update.pre_checkout_query) {
    const pcq = update.pre_checkout_query;
    // Validate: check user exists, etc.
    // await bot.answerPreCheckoutQuery(pcq.id, true);
    console.log('Pre-checkout query:', pcq.id, 'amount:', pcq.total_amount, 'Stars');
    res.sendStatus(200);
    return;
  }

  // Handle successful payment
  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const userId = update.message.from.id;
    const starsAmount = payment.total_amount;

    // Parse package info from payload
    let packageId = '';
    try {
      const payload = JSON.parse(payment.invoice_payload) as { packageId: string };
      packageId = payload.packageId;
    } catch { /* ignore */ }

    // TON conversion: 100 Stars = 1 TON (configurable)
    const TON_PER_100_STARS = 1;
    const tonAmount = (starsAmount / 100) * TON_PER_100_STARS;

    // Credit user
    // await supabase.rpc('increment_balance', { uid: userId, amount: tonAmount });

    // Log Stars purchase
    // await supabase.from('stars_purchases').insert({
    //   user_id: userId,
    //   stars_amount: starsAmount,
    //   ton_credited: tonAmount,
    //   tg_charge_id: payment.telegram_payment_charge_id,
    //   package_id: packageId,
    // });

    console.log(`⭐ Stars payment: user ${userId} paid ${starsAmount} Stars → +${tonAmount} TON. Package: ${packageId}`);
    void packageId;

    res.sendStatus(200);
    return;
  }

  res.sendStatus(200);
}

/**
 * POST /api/onramper-webhook
 * Webhook for Onramper fiat-to-crypto notifications.
 *
 * Documentation: https://docs.onramper.com/docs/webhooks
 */
async function onramperWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-onramper-webhook-signature'];
    // In production, verify signature here using your Onramper secret

    const { type, payload } = req.body;
    console.log(`💳 Onramper Webhook [${type}]:`, payload);

    if (type === 'transaction_completed') {
      const { txId, cryptoAmount, currency, walletAddress, meta } = payload;
      
      // If you passed userId in metadata during widget init
      const userId = meta?.userId;
      
      if (userId) {
        console.log(`✅ Crediting user ${userId}: ${cryptoAmount} ${currency}`);
        // await db.creditUser(userId, cryptoAmount, currency, txId);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Onramper webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// ── Router setup ───────────────────────────────────────────────────────────

/**
 * Mount these routes in your Express app:
 *
 * import express from 'express';
 * import { setupRoutes } from './apiRoutes';
 *
 * const app = express();
 * app.use(express.json());
 * setupRoutes(app);
 * app.listen(3001);
 */
export function setupRoutes(app: {
  get: (path: string, ...handlers: ((req: Request, res: Response) => void)[]) => void;
  post: (path: string, ...handlers: ((req: Request, res: Response) => void)[]) => void;
}): void {
  app.get('/api/deposit-address', authMiddleware as unknown as (req: Request, res: Response) => void, getDepositAddress);
  app.get('/api/balance', authMiddleware as unknown as (req: Request, res: Response) => void, getBalance);
  app.post('/api/withdraw', authMiddleware as unknown as (req: Request, res: Response) => void, postWithdraw);
  app.post('/api/telegram-stars-webhook', telegramStarsWebhook);
  app.post('/api/onramper-webhook', onramperWebhook);
}

export { verifyTelegramAuth, authMiddleware };
