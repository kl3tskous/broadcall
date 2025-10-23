-- ============================================
-- BROADCALL COMPLETE SUPABASE FIX
-- This will properly set up all missing tables and merge your profile data
-- ============================================

-- STEP 1: Create missing user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  gmgn_ref TEXT,
  axiom_ref TEXT,
  photon_ref TEXT,
  bullx_ref TEXT,
  trojan_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_wallet ON user_settings(wallet_address);

-- STEP 2: Create telegram_channels table
CREATE TABLE IF NOT EXISTS telegram_channels (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  telegram_id BIGINT NOT NULL,
  wallet_address TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (wallet_address) REFERENCES profiles(wallet_address) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telegram_channels_wallet ON telegram_channels(wallet_address);
CREATE INDEX IF NOT EXISTS idx_telegram_channels_telegram_id ON telegram_channels(telegram_id);

-- STEP 3: Fix duplicate profiles - Merge telegram_id into old profile
UPDATE profiles 
SET 
  telegram_id = 6046882827,
  telegram_username = 'Jobbatradess',
  updated_at = NOW()
WHERE wallet_address = 'YourWalletAddressHere';

-- STEP 4: Delete the duplicate new profile (empty one)
DELETE FROM profiles 
WHERE id = '3f8eb623-7374-4ceb-8c99-43fa0c81049e';

-- STEP 5: Update the old profile's wallet address to the correct one
UPDATE profiles 
SET wallet_address = '5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT'
WHERE id = 'd7790a96-609f-4cd5-888f-17c2f921a102';

-- STEP 6: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- STEP 7: Verify the fix
SELECT 
  id, 
  wallet_address, 
  alias, 
  twitter_handle, 
  telegram_id, 
  telegram_username,
  created_at
FROM profiles 
WHERE wallet_address = '5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT';

SELECT 'Migration complete! ✅' as status;
