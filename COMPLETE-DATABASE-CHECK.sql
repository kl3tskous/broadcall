-- ============================================
-- BROADCALL COMPLETE DATABASE CHECK
-- Copy this entire file and run it in Supabase SQL Editor
-- ============================================

-- 1. LIST ALL TABLES
SELECT 
  'TABLE: ' || tablename as info,
  tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. SHOW PROFILES TABLE STRUCTURE
SELECT 
  '---PROFILES TABLE STRUCTURE---' as section,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. SHOW ALL PROFILE DATA
SELECT 
  '---ALL PROFILES DATA---' as section,
  id,
  wallet_address,
  alias,
  twitter_handle,
  telegram,
  telegram_id,
  telegram_username,
  bio,
  website,
  created_at
FROM profiles
ORDER BY created_at;

-- 4. SHOW USER_SETTINGS TABLE STRUCTURE (if exists)
SELECT 
  '---USER_SETTINGS TABLE STRUCTURE---' as section,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. SHOW ALL USER SETTINGS DATA
SELECT 
  '---ALL USER SETTINGS DATA---' as section,
  *
FROM user_settings
ORDER BY created_at;

-- 6. SHOW TELEGRAM_CHANNELS TABLE STRUCTURE (if exists)
SELECT 
  '---TELEGRAM_CHANNELS TABLE STRUCTURE---' as section,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'telegram_channels' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. SHOW ALL TELEGRAM CHANNELS DATA
SELECT 
  '---ALL TELEGRAM CHANNELS DATA---' as section,
  *
FROM telegram_channels
ORDER BY created_at;

-- 8. SHOW TELEGRAM_CONNECTION_TOKENS TABLE STRUCTURE
SELECT 
  '---TELEGRAM_CONNECTION_TOKENS TABLE STRUCTURE---' as section,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'telegram_connection_tokens' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. SHOW ALL TELEGRAM CONNECTION TOKENS DATA
SELECT 
  '---ALL TELEGRAM TOKENS DATA---' as section,
  *
FROM telegram_connection_tokens
ORDER BY created_at DESC
LIMIT 10;

-- 10. SHOW ALL DATABASE FUNCTIONS
SELECT 
  '---DATABASE FUNCTIONS---' as section,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;

-- 11. SHOW ALL INDEXES
SELECT 
  '---ALL INDEXES---' as section,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 12. SUMMARY
SELECT 
  '---DATABASE SUMMARY---' as section,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM telegram_connection_tokens) as total_telegram_tokens,
  (SELECT COUNT(*) FROM telegram_channels) as total_channels,
  CURRENT_TIMESTAMP as checked_at;
