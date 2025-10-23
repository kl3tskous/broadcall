-- ============================================
-- FIX ALL BROADCALL TELEGRAM ISSUES
-- This fixes: wrong username + missing channel_username column
-- ============================================

-- 1. Fix your telegram username (Jobbatradess → Jobbatrades)
UPDATE profiles 
SET 
  telegram_username = 'Jobbatrades',
  updated_at = NOW()
WHERE wallet_address = '5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT';

-- 2. Add missing channel_username column to telegram_channels
ALTER TABLE telegram_channels 
ADD COLUMN IF NOT EXISTS channel_username TEXT;

-- 3. Verify the fixes
SELECT 
  '✅ PROFILE FIXED' as status,
  wallet_address,
  alias,
  telegram_id,
  telegram_username
FROM profiles
WHERE wallet_address = '5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT';

-- 4. Show updated telegram_channels structure
SELECT 
  '✅ TELEGRAM_CHANNELS STRUCTURE' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'telegram_channels'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✅ ALL FIXES COMPLETE!' as final_status;
