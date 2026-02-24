require('dotenv').config();
const { Bot, GrammyError, HttpError } = require('grammy');
const db = require('./database');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number);

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required in .env');
    process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// Middleware to ensure user exists in DB
bot.use(async (ctx, next) => {
    if (ctx.from) {
        await db.upsertUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
    }
    await next();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

bot.command('start', async (ctx) => {
    await ctx.reply(
        `👋 Welcome to Stars2TON Converter!\n\n` +
        `Use /buy to purchase TON with Telegram Stars.\n` +
        `Use /balance to check your internal TON balance.`
    );
});

bot.command('balance', async (ctx) => {
    const user = await db.getUser(ctx.from.id);
    await ctx.reply(`💰 Your Balance: *${parseFloat(user.balance_ton).toFixed(4)} TON*`, { parse_mode: 'Markdown' });
});

// Command to initiate purchase (Invoice)
bot.command('buy', async (ctx) => {
    const rate = await db.getExchangeRate();
    // Example: Packages of 50, 100, 500 Stars
    await ctx.replyWithInvoice(
        'Top up 50 Stars',           // Title
        `Get ${50 * rate} TON`,      // Description
        'payload_50_stars',          // Payload
        'XTR',                       // Currency (Stars)
        [{ label: '50 Stars', amount: 50 }] // Price (1 Star = 1 amount unit in XTR)
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PAYMENT HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Pre-checkout query (Must answer within 10 seconds)
bot.on('pre_checkout_query', async (ctx) => {
    // Here you can add logic to check if user is banned/frozen
    const user = await db.getUser(ctx.from.id);
    if (user.is_frozen) {
        await ctx.answerPreCheckoutQuery(false, { error_message: 'Your account is frozen. Contact support.' });
        return;
    }
    // Always approve for Stars
    await ctx.answerPreCheckoutQuery(true);
});

// 2. Successful Payment (The core logic)
bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const telegramId = ctx.from.id;
    const paymentId = payment.telegram_payment_charge_id;
    const providerId = payment.provider_payment_charge_id;
    const starsAmount = payment.total_amount; // For XTR, amount is number of stars
    
    console.log(`💸 Payment received: ${starsAmount} Stars from ${telegramId}`);

    // Idempotency check (Prevent double crediting)
    if (await db.isPaymentProcessed(paymentId)) {
        console.log('⚠️ Duplicate payment detected, skipping.');
        return;
    }

    // Transaction
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get current rate
        const rate = await db.getExchangeRate();
        const tonAmount = starsAmount * rate;

        // 2. Record transaction
        await db.createTransaction(client, telegramId, starsAmount, rate, tonAmount, paymentId, providerId);

        // 3. Update User Balance
        await db.updateBalance(client, telegramId, tonAmount);

        await client.query('COMMIT');
        
        // 4. Notify User
        await ctx.reply(
            `✅ *Payment Successful!*\n\n` +
            `🌟 Stars paid: \`${starsAmount}\`\n` +
            `💱 Rate: \`1 Star = ${rate} TON\`\n` +
            `💎 Credited: *${tonAmount.toFixed(4)} TON*\n\n` +
            `Use /balance to check your funds.`,
            { parse_mode: 'Markdown' }
        );
        
        // Log to Admin
        for (const adminId of ADMIN_IDS) {
            bot.api.sendMessage(adminId, 
                `💰 New Deposit!\nUser: ${telegramId} (@${ctx.from.username})\nAmount: ${starsAmount} Stars -> ${tonAmount} TON`
            ).catch(() => {});
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction Error:', err);
        await ctx.reply('⚠️ An error occurred while processing your payment. Please contact support.');
    } finally {
        client.release();
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

// Middleware for admin check
const adminOnly = (ctx, next) => {
    if (ADMIN_IDS.includes(ctx.from.id)) return next();
};

// Change Exchange Rate
bot.command('setrate', adminOnly, async (ctx) => {
    const args = ctx.match.split(' ');
    const newRate = parseFloat(args[0]);

    if (isNaN(newRate) || newRate <= 0) {
        return ctx.reply('❌ Usage: /setrate <amount>\nExample: /setrate 0.02');
    }

    await db.setExchangeRate(newRate);
    await ctx.reply(`✅ Exchange rate updated: 1 Star = ${newRate} TON`);
});

// Freeze User (Chargeback protection mechanism)
bot.command('freeze', adminOnly, async (ctx) => {
    const args = ctx.match.split(' ');
    const targetId = parseInt(args[0]);

    if (isNaN(targetId)) {
        return ctx.reply('❌ Usage: /freeze <telegram_id>');
    }

    await db.freezeUser(targetId, true);
    await ctx.reply(`❄️ User ${targetId} has been frozen.`);
});

// Unfreeze User
bot.command('unfreeze', adminOnly, async (ctx) => {
    const args = ctx.match.split(' ');
    const targetId = parseInt(args[0]);

    if (isNaN(targetId)) {
        return ctx.reply('❌ Usage: /unfreeze <telegram_id>');
    }

    await db.freezeUser(targetId, false);
    await ctx.reply(`🔥 User ${targetId} has been unfrozen.`);
});

// ═══════════════════════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════════════════════

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

(async () => {
    try {
        await db.initDb();
        console.log('🚀 Bot is starting...');
        await bot.start();
    } catch (error) {
        console.error('Failed to start bot:', error);
    }
})();
