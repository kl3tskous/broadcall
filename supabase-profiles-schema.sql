-- Create profiles table for KOL/influencer identity
-- This stores user profile information like alias, avatar, and social links

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  alias text,
  avatar_url text,
  twitter_handle text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add index for faster lookups by wallet
create index if not exists idx_profiles_wallet on profiles(wallet_address);

-- Add comment for documentation
comment on table profiles is 'User profile information for KOLs and influencers';
comment on column profiles.wallet_address is 'Solana wallet address (unique identifier)';
comment on column profiles.alias is 'Display name/handle for the user';
comment on column profiles.avatar_url is 'URL to user avatar image';
comment on column profiles.twitter_handle is 'Twitter/X handle (without @)';
