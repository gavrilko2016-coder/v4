require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize DB
async function initDb() {
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database initialized');
}

// User operations
async function upsertUser(telegramId, username, firstName) {
    const res = await pool.query(
        `INSERT INTO users (telegram_id, username, first_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (telegram_id) 
         DO UPDATE SET username = $2, first_name = $3, updated_at = NOW()
         RETURNING *`,
        [telegramId, username, firstName]
    );
    return res.rows[0];
}

async function getUser(telegramId) {
    const res = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return res.rows[0];
}

async function freezeUser(telegramId, isFrozen) {
    await pool.query('UPDATE users SET is_frozen = $2 WHERE telegram_id = $1', [telegramId, isFrozen]);
}

// Transaction operations
async function createTransaction(client, telegramId, stars, rate, ton, paymentId, providerId) {
    await client.query(
        `INSERT INTO transactions 
         (telegram_id, stars_amount, rate, ton_amount, payment_id, provider_payment_charge_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [telegramId, stars, rate, ton, paymentId, providerId]
    );
}

async function updateBalance(client, telegramId, amount) {
    await client.query(
        `UPDATE users SET balance_ton = balance_ton + $2 WHERE telegram_id = $1`,
        [telegramId, amount]
    );
}

// Settings operations
async function getExchangeRate() {
    const res = await pool.query("SELECT value FROM settings WHERE key = 'exchange_rate'");
    return res.rows[0] ? parseFloat(res.rows[0].value) : 0.02;
}

async function setExchangeRate(rate) {
    await pool.query(
        "INSERT INTO settings (key, value) VALUES ('exchange_rate', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
        [rate.toString()]
    );
}

// Idempotency check
async function isPaymentProcessed(paymentId) {
    const res = await pool.query('SELECT 1 FROM transactions WHERE payment_id = $1', [paymentId]);
    return res.rowCount > 0;
}

module.exports = {
    pool,
    initDb,
    upsertUser,
    getUser,
    freezeUser,
    createTransaction,
    updateBalance,
    getExchangeRate,
    setExchangeRate,
    isPaymentProcessed
};
