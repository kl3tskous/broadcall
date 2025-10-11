-- Migration: Add token metadata and performance tracking columns to calls table
-- Run this to upgrade existing calls table with new columns

alter table calls
add column if not exists token_name text,
add column if not exists token_symbol text,
add column if not exists token_logo text,
add column if not exists initial_price numeric,
add column if not exists initial_mcap numeric,
add column if not exists current_price numeric,
add column if not exists current_mcap numeric,
add column if not exists ath_price numeric,
add column if not exists ath_mcap numeric,
add column if not exists first_shared_at timestamp with time zone default now(),
add column if not exists user_alias text;

-- Add comment for documentation
comment on column calls.token_name is 'Token name fetched from DexScreener';
comment on column calls.token_symbol is 'Token symbol/ticker';
comment on column calls.token_logo is 'Token logo URL from DexScreener';
comment on column calls.initial_price is 'Price when call was first created (USD)';
comment on column calls.initial_mcap is 'Market cap when call was first created (USD)';
comment on column calls.current_price is 'Last fetched current price (USD)';
comment on column calls.current_mcap is 'Last fetched current market cap (USD)';
comment on column calls.ath_price is 'All-time high price (USD)';
comment on column calls.ath_mcap is 'All-time high market cap (USD)';
comment on column calls.first_shared_at is 'Timestamp when call was first shared';
comment on column calls.user_alias is 'Display name/alias of the caller';
