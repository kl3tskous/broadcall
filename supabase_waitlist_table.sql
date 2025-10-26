-- Run this SQL in your production Supabase database
-- This creates the waitlist table needed for broadcall.xyz

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR NOT NULL UNIQUE,
  telegram_user_id VARCHAR,
  telegram_username VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'pending',
  completed_at TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON waitlist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_waitlist_telegram_id ON waitlist(telegram_user_id);
