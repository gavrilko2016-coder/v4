# CryptoBet — TON Custodial Deposit System

## Architecture Overview

```
User (Telegram Mini App)
        │  requests deposit address
        ▼
Backend API (Node.js + Express)
        │  derives HD wallet from master seed
        ▼
Unique Deposit Wallet (v4R2)  ← per user
        │  user sends TON here
        ▼
Toncenter Indexer (WebSocket + polling)
        │  detects incoming tx
        ▼
Transaction Processor
        │  verifies + credits user DB balance
        ▼
Supabase / PostgreSQL
        │  balance updated + tx logged
        ▼
Auto-Sweep Service
        │  transfers TON to Cold Wallet
        ▼
Cold Wallet (admin address)
```

## Security Model
- Master seed phrase stored in env var / HSM (never in code)
- Per-user wallets derived via BIP39 m/44'/607'/0'/0/userId
- Private keys generated in-memory only for signing sweeps
- All tx hashes logged before sweep to prevent double-credit
- Sweep happens AFTER balance is credited (atomic DB transaction)

## Environment Variables
```
MASTER_MNEMONIC=word1 word2 ... word24
COLD_WALLET_ADDRESS=UQDcQ7af-ZcaiTSe8_X8P8q7tEm7iFk2ABzoRJs8Ty22mIdJ
TONCENTER_API_KEY=your_toncenter_api_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
PORT=3001
```
