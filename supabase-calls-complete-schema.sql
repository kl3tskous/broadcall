-- Complete schema for calls table with all required columns
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  token_address TEXT NOT NULL,
  platform TEXT NOT NULL,
  thesis TEXT,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Referral codes
  gmgn_ref TEXT,
  axiom_ref TEXT,
  photon_ref TEXT,
  bullx_ref TEXT,
  trojan_ref TEXT,
  
  -- Token metadata and performance tracking
  token_name TEXT,
  token_symbol TEXT,
  token_logo TEXT,
  initial_price NUMERIC,
  initial_mcap NUMERIC,
  current_price NUMERIC,
  current_mcap NUMERIC,
  ath_price NUMERIC,
  ath_mcap NUMERIC,
  first_shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_alias TEXT
);

-- Add comments for documentation
COMMENT ON TABLE calls IS 'Token calls created by influencers';
COMMENT ON COLUMN calls.creator_wallet IS 'Wallet address of the KOL who created this call';
COMMENT ON COLUMN calls.token_address IS 'Solana token contract address';
COMMENT ON COLUMN calls.platform IS 'Trading platform (e.g., GMGN, Axiom, Photon)';
COMMENT ON COLUMN calls.thesis IS 'Optional thesis/reasoning for the call';
COMMENT ON COLUMN calls.views IS 'Number of times this call page was viewed';
COMMENT ON COLUMN calls.clicks IS 'Number of clicks on trading platform buttons';
COMMENT ON COLUMN calls.token_name IS 'Token name fetched from DexScreener';
COMMENT ON COLUMN calls.token_symbol IS 'Token symbol/ticker';
COMMENT ON COLUMN calls.token_logo IS 'Token logo URL from DexScreener';
COMMENT ON COLUMN calls.initial_price IS 'Price when call was first created (USD)';
COMMENT ON COLUMN calls.initial_mcap IS 'Market cap when call was first created (USD)';
COMMENT ON COLUMN calls.current_price IS 'Last fetched current price (USD)';
COMMENT ON COLUMN calls.current_mcap IS 'Last fetched current market cap (USD)';
COMMENT ON COLUMN calls.ath_price IS 'All-time high price (USD)';
COMMENT ON COLUMN calls.ath_mcap IS 'All-time high market cap (USD)';
COMMENT ON COLUMN calls.first_shared_at IS 'Timestamp when call was first shared';
COMMENT ON COLUMN calls.user_alias IS 'Display name/alias of the caller';

-- Create index for faster lookups by creator
CREATE INDEX IF NOT EXISTS idx_calls_creator_wallet ON calls(creator_wallet);

-- Create index for faster lookups by token
CREATE INDEX IF NOT EXISTS idx_calls_token_address ON calls(token_address);

-- Create index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
