# Coin Call Referral Platform

## Overview
A Next.js-based Solana influencer coin-call referral platform with Phantom wallet integration, Supabase database, and GMGN chart embeds. The platform allows users to create and share token calls with automatic tracking of views and clicks.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Wallet**: Solana Wallet Adapter (Phantom)
- **Database**: Supabase (PostgreSQL)
- **Charts**: GMGN embedded iframes

## Project Structure
```
/app
  layout.tsx          # Root layout with WalletProvider
  page.tsx           # Homepage with wallet connect and call form
  globals.css        # Global styles and Tailwind
  /call/[id]
    page.tsx         # Dynamic call page with chart and tracking

/components
  WalletProvider.tsx # Solana wallet adapter configuration
  CallForm.tsx       # Form to create new calls

/utils
  supabaseClient.ts  # Supabase client and types
```

## Database Schema
The Supabase `calls` table:
```sql
create table calls (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null,
  token_address text not null,
  platform text not null,
  thesis text,
  views int default 0,
  clicks int default 0,
  created_at timestamp with time zone default now()
);
```

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Features
1. **Wallet Connection**: Phantom wallet integration on homepage
2. **Call Creation**: Form to create new token calls with optional thesis
3. **Link Generation**: Auto-generated shareable links for each call
4. **Call Display**: Dynamic pages with token info and GMGN charts
5. **Tracking**: Automatic view counting on page load, click tracking on buy button
6. **Referral**: Hardcoded referral code (7rpqjHdf) for GMGN Telegram bot

## Recent Changes
- Initial project setup with Next.js 14 and TypeScript
- Installed Solana Wallet Adapter and Supabase dependencies
- Created dark theme UI with Tailwind CSS
- Implemented wallet connection and call creation flow
- Built dynamic call pages with embedded GMGN charts
