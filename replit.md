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

## Setup Instructions

### 1. Supabase Database Setup
Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the `calls` table.

### 2. Environment Variables
The following Supabase credentials are already configured in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run the Application
```bash
npm run dev
```
Server runs on http://localhost:5000

## How It Works

1. **Homepage**: Connect your Phantom wallet using the "Select Wallet" button
2. **Create Call**: Enter a Solana token address and optional thesis
3. **Share Link**: Get an auto-generated link like `/call/[id]` to share
4. **Track Engagement**: View count increments on page load, click count on buy button
5. **Buy Button**: Opens GMGN Telegram bot with referral code `7rpqjHdf`

## Recent Changes
- ✅ MVP complete with Next.js 14, TypeScript, and Tailwind CSS
- ✅ Phantom wallet connection integrated via Solana Wallet Adapter  
- ✅ Supabase database for storing calls with view/click tracking
- ✅ Dark modern UI with purple gradient accents
- ✅ Call creation form with link generation
- ✅ Dynamic call pages with GMGN chart embeds
- ✅ Referral tracking with hardcoded GMGN code
