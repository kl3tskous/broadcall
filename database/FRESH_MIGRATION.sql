-- =====================================================
-- BroadCall - Fresh Database Migration Script
-- Twitter OAuth 2.0 + Telegram Integration
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Paste into a new query
-- 4. Click "Run" to execute
-- 
-- This script drops existing users/sessions tables and creates fresh ones
-- WARNING: This will delete existing user data!
-- =====================================================

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (IF ANY)
-- =====================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- STEP 2: CREATE USERS TABLE
-- =====================================================

CREATE TABLE users (
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
CREATE INDEX idx_users_twitter_id ON users(twitter_id);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_twitter_username ON users(twitter_username);
CREATE INDEX idx_users_joined_waitlist ON users(joined_waitlist);
CREATE INDEX idx_users_access_granted ON users(access_granted);

-- =====================================================
-- STEP 3: CREATE SESSIONS TABLE
-- =====================================================
-- IMPORTANT: session_token stores SHA256 hashed tokens

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL, -- Stores SHA256(raw_token)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  twitter_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sessions table
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =====================================================
-- STEP 4: CREATE TRIGGERS
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
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user by session token
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
-- STEP 6: VERIFY MIGRATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ users (with Twitter OAuth fields)';
  RAISE NOTICE '  ✓ sessions (with hashed tokens)';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created:';
  RAISE NOTICE '  ✓ 6 indexes on users table';
  RAISE NOTICE '  ✓ 3 indexes on sessions table';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers and functions created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test Twitter OAuth login flow';
  RAISE NOTICE '  2. Connect Telegram account';
  RAISE NOTICE '  3. Grant access to test users as needed';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- OPTIONAL: GRANT ACCESS TO USERS
-- =====================================================
-- Uncomment these after users sign up:

-- Grant access by Twitter username:
-- UPDATE users SET access_granted = TRUE WHERE twitter_username = 'your_username';

-- Grant access to all waitlist users:
-- UPDATE users SET access_granted = TRUE WHERE joined_waitlist = TRUE;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
