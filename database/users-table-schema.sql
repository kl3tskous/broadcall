-- =====================================================
-- BroadCall Users Table Schema
-- Twitter OAuth 2.0 + Telegram Integration
-- =====================================================

-- Drop existing users table if you need to recreate (CAREFUL!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Twitter/X Profile Data
  twitter_id TEXT UNIQUE NOT NULL,
  twitter_username TEXT,
  twitter_name TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  bio TEXT,
  
  -- Telegram Data
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  
  -- Solana Wallet (optional, for future use)
  wallet_address TEXT UNIQUE,
  
  -- Waitlist Status
  joined_waitlist BOOLEAN DEFAULT FALSE,
  access_granted BOOLEAN DEFAULT FALSE,
  
  -- OAuth Tokens (encrypted/hashed in production)
  twitter_access_token TEXT,
  twitter_refresh_token TEXT,
  twitter_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_twitter_username ON users(twitter_username);
CREATE INDEX IF NOT EXISTS idx_users_joined_waitlist ON users(joined_waitlist);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSTRUCTIONS FOR SUPABASE
-- =====================================================
-- 
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire schema
-- 3. Click "Run" to create the table
-- 
-- The table will be created with all necessary indexes
-- and triggers for automatic timestamp updates.
-- =====================================================
