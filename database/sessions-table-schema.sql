-- =====================================================
-- BroadCall Sessions Table Schema
-- Session Management for Twitter OAuth
-- =====================================================

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  twitter_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired sessions
-- (Requires pg_cron extension - uncomment if available)
-- SELECT cron.schedule('delete-expired-sessions', '0 0 * * *', 'SELECT delete_expired_sessions()');

-- =====================================================
-- INSTRUCTIONS FOR SUPABASE
-- =====================================================
-- 
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Make sure you've already created the users table first
-- 3. Copy and paste this schema
-- 4. Click "Run" to create the sessions table
-- =====================================================
