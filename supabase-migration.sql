-- Migration to add referral code columns for multiple platforms
-- Run this in your Supabase SQL Editor if you already have the calls table

ALTER TABLE calls ADD COLUMN IF NOT EXISTS gmgn_ref text;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS axiom_ref text;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS photon_ref text;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS bullx_ref text;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS trojan_ref text;
