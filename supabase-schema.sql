-- Create the calls table for the Coin Call Platform
-- Run this in your Supabase SQL Editor to set up the database

create table calls (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null,
  token_address text not null,
  platform text not null,
  thesis text,
  views int default 0,
  clicks int default 0,
  -- Referral codes for different platforms
  gmgn_ref text,
  axiom_ref text,
  photon_ref text,
  bullx_ref text,
  trojan_ref text,
  created_at timestamp with time zone default now()
);

-- Optional: Create an index on creator_wallet for faster queries
create index idx_calls_creator_wallet on calls(creator_wallet);

-- Optional: Create an index on created_at for sorting
create index idx_calls_created_at on calls(created_at desc);
