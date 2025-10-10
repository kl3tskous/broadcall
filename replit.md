# Coin Call Referral Platform

## Overview
A Next.js-based Solana influencer coin-call referral platform with Phantom wallet integration, Supabase database, and DexScreener price charts. The platform allows users to create and share token calls with automatic tracking of views and clicks, supporting multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan) with custom referral codes.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Wallet**: Solana Wallet Adapter (Phantom)
- **Database**: Supabase (PostgreSQL)
- **Charts**: DexScreener API & embedded iframes
- **Trading Platforms**: GMGN, Axiom, Photon, BullX, Trojan with referral support

## Project Structure
```
/app
  layout.tsx          # Root layout with WalletProvider
  page.tsx           # Homepage with wallet connect and call form
  globals.css        # Global styles and Tailwind
  /call/[id]
    page.tsx         # Dynamic call page with chart and tracking

/components
  WalletProvider.tsx  # Solana wallet adapter configuration
  CallForm.tsx        # Form to create new calls with platform ref codes
  PlatformLogos.tsx   # Platform logo components with theme colors

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
  gmgn_ref text,
  axiom_ref text,
  photon_ref text,
  bullx_ref text,
  trojan_ref text,
  created_at timestamp with time zone default now()
);
```

**Migration Required**: If you have an existing database, run the SQL in `supabase-migration.sql` to add the referral code columns.

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Features
1. **Wallet Connection**: Phantom wallet integration on homepage
2. **Call Creation**: Form to create new token calls with optional thesis and platform-specific referral codes
3. **Multi-Platform Support**: Support for 5 trading platforms (GMGN, Axiom, Photon, BullX, Trojan)
4. **Custom Referral Codes**: Optional referral codes per platform with automatic fallback to defaults
5. **Link Generation**: Auto-generated shareable links for each call
6. **Call Display**: Dynamic pages with DexScreener price charts and platform buttons
7. **Real-time Price Data**: Live price, 24h change, liquidity, volume, and market cap from DexScreener API
8. **Tracking**: Automatic view counting on page load, click tracking on platform buttons

## Setup Instructions

### 1. Supabase Database Setup
**For New Databases**: Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the `calls` table.

**For Existing Databases**: Run the SQL in `supabase-migration.sql` to add the referral code columns to your existing `calls` table.

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
2. **Create Call**: Enter a Solana token address, optional thesis, and platform-specific referral codes
3. **Share Link**: Get an auto-generated link like `/call/[id]` to share
4. **View Call**: Displays real-time price data, DexScreener chart, and platform buttons with logos
5. **Track Engagement**: View count increments on page load, click count on platform button clicks
6. **Platform Buttons**: Opens chosen platform with custom referral code or default (GMGN default: 7rpqjHdf)

## Implementation Notes

### Tracking System
- **View Tracking**: Increments on page load with optimistic UI updates
- **Click Tracking**: Increments on buy button click with error rollback
- **Error Handling**: Graceful degradation if Supabase updates fail
- **State Management**: Local state synced with database for instant UI feedback

### Dependencies Installation
The project uses `npm install --ignore-scripts --legacy-peer-deps` to:
- Skip native compilation (not needed for web apps)
- Handle peer dependency conflicts from Solana wallet adapters
- Ensure reliable installation in Replit environment

## Recent Changes
- ✅ MVP complete with Next.js 14, TypeScript, and Tailwind CSS
- ✅ Phantom wallet connection integrated via Solana Wallet Adapter  
- ✅ Supabase database for storing calls with view/click tracking
- ✅ Dark modern UI with purple gradient accents
- ✅ Call creation form with link generation
- ✅ **DexScreener API Integration** - Real-time price data (price, 24h change, liquidity, volume, market cap)
- ✅ **Embedded Live Charts** - Interactive DexScreener charts display by default on desktop & mobile
- ✅ **Responsive 3-Column Layout** - Token info, price data, and live chart (stacks on mobile)
- ✅ **Auto-refresh** - Price data updates every 30 seconds
- ✅ **Multi-Platform Referral System** - Support for 5 platforms (GMGN, Axiom, Photon, BullX, Trojan)
- ✅ **Platform-Specific Referral Codes** - Optional custom codes per platform with automatic defaults
- ✅ **Platform Logo Components** - Styled logos with purple/pink gradient theme colors
- ✅ **Platform Buttons** - Grid layout with logos, opens correct platform with referral codes
- ✅ Fixed click tracking race condition with optimistic updates
- ✅ Fixed page loading issue by making view tracking non-blocking
