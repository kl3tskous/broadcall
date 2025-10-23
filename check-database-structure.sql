-- ============================================
-- BROADC ALL DATABASE STRUCTURE CHECK
-- Run this to see your complete Supabase setup
-- ============================================

-- 1. List all tables
\dt

-- 2. Check profiles table structure
\d profiles

-- 3. Check user_settings table structure
\d user_settings

-- 4. Check if telegram_channels exists
\d telegram_channels

-- 5. Check if telegram_tokens exists
\d telegram_tokens

-- 6. Check all profiles data
SELECT id, wallet_address, alias, twitter_handle, telegram_id, telegram_username, created_at 
FROM profiles 
ORDER BY created_at;

-- 7. Check for duplicate profiles
SELECT wallet_address, COUNT(*) as count 
FROM profiles 
GROUP BY wallet_address 
HAVING COUNT(*) > 1;

-- 8. List all database functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;
