-- Create calls table for storing token calls
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_name TEXT,
  token_symbol TEXT,
  token_logo TEXT,
  price_at_call DECIMAL,
  market_cap_at_call BIGINT,
  thesis TEXT,
  dexscreener_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Performance tracking
  current_price DECIMAL,
  current_market_cap BIGINT,
  ath_price DECIMAL,
  ath_market_cap BIGINT,
  ath_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  FOREIGN KEY (wallet_address) REFERENCES profiles(wallet_address) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calls_wallet ON calls(wallet_address);
CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_token ON calls(token_address);

SELECT 'Calls table created successfully!' as status;
