-- Users table
CREATE TABLE IF NOT EXISTS users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    balance_ton DECIMAL(18, 9) DEFAULT 0,
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    stars_amount INTEGER NOT NULL,
    rate DECIMAL(18, 9) NOT NULL, -- TON per 1 Star
    ton_amount DECIMAL(18, 9) NOT NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL, -- telegram_payment_charge_id
    provider_payment_charge_id VARCHAR(255),
    type VARCHAR(50) DEFAULT 'deposit', -- 'deposit', 'refund', 'manual_adjustment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert default rate if not exists (1 Star = 0.02 TON)
INSERT INTO settings (key, value) VALUES ('exchange_rate', '0.02') ON CONFLICT DO NOTHING;
