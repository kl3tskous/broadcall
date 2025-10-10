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
  page.tsx           # Homepage with onboarding check and call form
  /settings
    page.tsx         # User settings page for editing referral codes
  /call/[id]
    page.tsx         # Dynamic call page with chart and tracking
  globals.css        # Global styles and Tailwind

/components
  WalletProvider.tsx  # Solana wallet adapter configuration
  OnboardingFlow.tsx  # 2-step onboarding flow for new users
  CallForm.tsx        # Form to create new calls with auto-filled ref codes
  PlatformLogos.tsx   # Platform logo components with theme colors

/utils
  supabaseClient.ts  # Supabase client and types
```

## Database Schema

### User Settings Table
Stores user-level referral codes and onboarding status:
```sql
create table user_settings (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  gmgn_ref text,
  axiom_ref text,
  photon_ref text,
  bullx_ref text,
  trojan_ref text,
  onboarded boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Calls Table
Stores individual token calls with optional call-specific referral codes:
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

**Database Setup**:
- **New Database**: Run `supabase-schema.sql` AND `supabase-user-settings-schema.sql`
- **Existing Database**: Run `supabase-migration.sql` to add referral columns to calls table, then run `supabase-user-settings-schema.sql` to create user_settings table

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Features
1. **User Onboarding**: New users see a welcome flow explaining the platform and prompting them to add referral codes
2. **User Settings**: Dedicated settings page to manage referral codes for all platforms
3. **Wallet Connection**: Phantom wallet integration on homepage
4. **Auto-Filled Referral Codes**: User's saved referral codes automatically populate when creating calls
5. **Call Creation**: Form to create new token calls with optional thesis (referral codes pre-filled from settings)
6. **Multi-Platform Support**: Support for 5 trading platforms (GMGN, Axiom, Photon, BullX, Trojan)
7. **Smart Referral Priority**: Uses call-specific codes > user settings > defaults
8. **Link Generation**: Auto-generated shareable links for each call
9. **Call Display**: Dynamic pages with DexScreener price charts and platform buttons
10. **Real-time Price Data**: Live price, 24h change, liquidity, volume, and market cap from DexScreener API
11. **Tracking**: Automatic view counting on page load, click tracking on platform buttons

## Setup Instructions

### 1. Supabase Database Setup
**For New Databases**: 
1. Run `supabase-schema.sql` to create the `calls` table
2. Run `supabase-user-settings-schema.sql` to create the `user_settings` table

**For Existing Databases**: 
1. Run `supabase-migration.sql` to add referral columns to existing `calls` table
2. Run `supabase-user-settings-schema.sql` to create the `user_settings` table

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

### First-Time User Flow:
1. **Connect Wallet**: Connect your Phantom wallet using the "Select Wallet" button
2. **Onboarding Welcome**: See a welcome screen explaining how the platform works (4 steps)
3. **Add Referral Codes**: Add your referral codes for each platform (or skip to add later)
4. **Start Creating**: Begin creating token calls with your referral codes pre-filled

### Creating & Sharing Calls:
1. **Create Call**: Enter a Solana token address and optional thesis (referral codes auto-filled from your settings)
2. **Get Shareable Link**: Receive an auto-generated link like `/call/[id]` to share
3. **Share & Track**: Share your link and track views/clicks in real-time

### Viewing Calls:
1. **Price Data**: See live price, 24h change, liquidity, volume, and market cap
2. **Live Chart**: Interactive DexScreener chart embedded on the page
3. **Platform Buttons**: Click any platform to trade (uses creator's referral codes automatically)
4. **Auto Tracking**: Views increment on page load, clicks increment when platform buttons are clicked

### Managing Settings:
- **Access Settings**: Click the ⚙️ Settings link on homepage (when wallet connected)
- **Update Codes**: Edit your referral codes anytime - they'll apply to all future calls
- **View Wallet**: See your connected wallet address

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
- ✅ **User Onboarding System** - 2-step welcome flow for new users to set up referral codes
- ✅ **User Settings Page** - Dedicated page to manage and update referral codes
- ✅ **Auto-Filled Referral Codes** - User's saved codes automatically populate in call creation form
- ✅ **Smart Referral Priority** - Uses call-specific > user settings > default codes
- ✅ Fixed click tracking race condition with optimistic updates
- ✅ Fixed page loading issue by making view tracking non-blocking
- ✅ Fixed referral code persistence across multiple call creations
