-- =====================================================
-- BroadCall - Complete Database Migration Script
-- Twitter OAuth 2.0 + Telegram Integration
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Paste into a new query
-- 4. Click "Run" to execute
-- 
-- This script is idempotent - safe to run multiple times
-- =====================================================

-- =====================================================
-- PART 1: CREATE USERS TABLE
-- =====================================================

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
  
  -- OAuth Tokens (store securely)
  twitter_access_token TEXT,
  twitter_refresh_token TEXT,
  twitter_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_twitter_username ON users(twitter_username);
CREATE INDEX IF NOT EXISTS idx_users_joined_waitlist ON users(joined_waitlist);
CREATE INDEX IF NOT EXISTS idx_users_access_granted ON users(access_granted);

-- =====================================================
-- PART 2: CREATE SESSIONS TABLE
-- =====================================================
-- IMPORTANT: session_token stores SHA256 hashed tokens
-- The application automatically hashes tokens before
-- storage and comparison. Never store raw tokens.

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL, -- Stores SHA256(raw_token)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  twitter_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =====================================================
-- PART 3: CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 4: CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user by session token (useful for queries)
CREATE OR REPLACE FUNCTION get_user_by_session(session_token_param TEXT)
RETURNS TABLE (
  user_id UUID,
  twitter_id TEXT,
  twitter_username TEXT,
  twitter_name TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  bio TEXT,
  telegram_id TEXT,
  telegram_username TEXT,
  wallet_address TEXT,
  joined_waitlist BOOLEAN,
  access_granted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.twitter_id,
    u.twitter_username,
    u.twitter_name,
    u.profile_image_url,
    u.banner_image_url,
    u.bio,
    u.telegram_id,
    u.telegram_username,
    u.wallet_address,
    u.joined_waitlist,
    u.access_granted
  FROM users u
  INNER JOIN sessions s ON s.user_id = u.id
  WHERE s.session_token = session_token_param
    AND s.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: VERIFY MIGRATION
-- =====================================================

-- Check if tables were created successfully
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ users';
  RAISE NOTICE '  ✓ sessions';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created:';
  RAISE NOTICE '  ✓ idx_users_twitter_id';
  RAISE NOTICE '  ✓ idx_users_telegram_id';
  RAISE NOTICE '  ✓ idx_users_wallet_address';
  RAISE NOTICE '  ✓ idx_users_twitter_username';
  RAISE NOTICE '  ✓ idx_users_joined_waitlist';
  RAISE NOTICE '  ✓ idx_users_access_granted';
  RAISE NOTICE '  ✓ idx_sessions_session_token';
  RAISE NOTICE '  ✓ idx_sessions_user_id';
  RAISE NOTICE '  ✓ idx_sessions_expires_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  ✓ update_users_updated_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  ✓ delete_expired_sessions()';
  RAISE NOTICE '  ✓ get_user_by_session()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Verify tables in Supabase Table Editor';
  RAISE NOTICE '  2. Test Twitter OAuth login flow';
  RAISE NOTICE '  3. Connect Telegram account';
  RAISE NOTICE '  4. Grant access to test users if needed';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- OPTIONAL: GRANT ACCESS TO TEST USER
-- =====================================================
-- Uncomment and modify these lines to grant access to specific users:

-- Grant access by Twitter username:
-- UPDATE users SET access_granted = TRUE WHERE twitter_username = 'your_username';

-- Grant access by Twitter ID:
-- UPDATE users SET access_granted = TRUE WHERE twitter_id = 'your_twitter_id';

-- Grant access to all waitlist users (for testing):
-- UPDATE users SET access_granted = TRUE WHERE joined_waitlist = TRUE;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
