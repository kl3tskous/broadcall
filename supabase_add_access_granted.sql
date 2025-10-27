-- Add access_granted column to waitlist table for early access control
-- Run this in your Supabase SQL Editor

-- Add the column (if it doesn't exist yet)
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS access_granted BOOLEAN DEFAULT false;

-- Grant access to specific users (replace with your wallet addresses)
UPDATE waitlist 
SET access_granted = true 
WHERE wallet_address IN (
  'SSYk4xHSyxgu4vMGpJa3kPTfeqHkNzhPB',
  'DBVDZAsmrCzvYYr234mwLsZaUzMAGYDf',
  'CPvLdPo22vJx8Awh8vNTfacmPgkkdA4S'
);

-- Check who has access
SELECT wallet_address, telegram_username, access_granted, status 
FROM waitlist 
WHERE access_granted = true;
