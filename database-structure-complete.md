# BroadCall Database Structure

## Complete Table Schemas

### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  alias TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  twitter_handle TEXT,
  bio TEXT,
  telegram TEXT,              -- Old field (legacy)
  website TEXT,
  telegram_id BIGINT,         -- Telegram user ID
  telegram_username TEXT,     -- Telegram @username
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
```

### 2. user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  gmgn_ref TEXT,
  axiom_ref TEXT,
  photon_ref TEXT,
  bullx_ref TEXT,
  trojan_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_wallet ON user_settings(wallet_address);
```

### 3. telegram_channels
```sql
CREATE TABLE telegram_channels (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  telegram_id BIGINT NOT NULL,           -- Owner's Telegram ID
  wallet_address TEXT NOT NULL,          -- Owner's wallet
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (wallet_address) REFERENCES profiles(wallet_address) ON DELETE CASCADE
);

CREATE INDEX idx_telegram_channels_wallet ON telegram_channels(wallet_address);
CREATE INDEX idx_telegram_channels_telegram_id ON telegram_channels(telegram_id);
```

### 4. telegram_connection_tokens
```sql
CREATE TABLE telegram_connection_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

## Why We Use Direct PostgreSQL Instead of Supabase Client

**Problem:** Supabase's PostgREST has a schema cache that doesn't automatically update when columns are added via SQL migrations. When we added `telegram_id` and `telegram_username`, PostgREST continued serving the old schema.

**Solution:** `/api/profile/get` uses direct PostgreSQL connection via `pg` library, completely bypassing PostgREST's cache.

**Code Pattern:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const result = await pool.query('SELECT * FROM profiles WHERE wallet_address = $1', [address]);
```

## Current Your Profile Data

```
Wallet: 5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT
Alias: Jobba
Twitter: @Jobbatrades
Telegram: @Jobbatradess (ID: 6046882827)
```

## Running Database Checks

Use the provided SQL files:
- `check-database-structure.sql` - View complete DB structure
- `fix-supabase-complete.sql` - Migration that was run to fix everything

Run them with:
```bash
psql $DATABASE_URL -f check-database-structure.sql
```
