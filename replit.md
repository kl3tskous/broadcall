# Coin Call Referral Platform

## Overview
A Next.js-based Solana influencer coin-call referral platform with Phantom wallet integration, Supabase database, and DexScreener price charts. The platform features **flex-worthy token call pages** with performance tracking, ROI calculations, ATH stats, and social sharing. Users can create and share professional token calls with automatic tracking of views and clicks, supporting multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan) with custom referral codes.

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
  CallForm.tsx        # Form to create new calls with auto-filled ref codes and token metadata
  PlatformLogos.tsx   # Platform logo components with theme colors
  UserProfile.tsx     # Profile management component for alias and avatar

/utils
  supabaseClient.ts  # Supabase client and types
  dexscreener.ts     # DexScreener API integration and token utilities
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
Stores individual token calls with token metadata, performance tracking, and referral codes:
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
  token_name text,
  token_symbol text,
  token_logo text,
  initial_price numeric,
  initial_mcap numeric,
  current_price numeric,
  current_mcap numeric,
  ath_price numeric,
  ath_mcap numeric,
  first_shared_at timestamp with time zone default now(),
  user_alias text,
  created_at timestamp with time zone default now()
);
```

### Profiles Table
Stores user profile information for KOLs and influencers:
```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  alias text,
  avatar_url text,
  twitter_handle text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**Database Setup**:
- **New Database**: Run `supabase-schema.sql`, `supabase-user-settings-schema.sql`, `supabase-calls-upgrade.sql`, and `supabase-profiles-schema.sql`
- **Existing Database**: 
  1. Run `supabase-migration.sql` to add referral columns to calls table
  2. Run `supabase-user-settings-schema.sql` to create user_settings table
  3. Run `supabase-calls-upgrade.sql` to add token metadata columns
  4. Run `supabase-profiles-schema.sql` to create profiles table

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Features

### Core Features
1. **User Onboarding**: New users see a welcome flow explaining the platform and prompting them to add referral codes
2. **Profile Management**: Set your alias, avatar, and Twitter handle in settings
3. **User Settings**: Dedicated settings page to manage referral codes for all platforms
4. **Wallet Connection**: Phantom wallet integration on homepage
5. **Auto-Filled Referral Codes**: User's saved referral codes automatically populate when creating calls

### Call Creation & Metadata
6. **Automatic Token Metadata**: DexScreener API auto-fetches token name, symbol, logo, and initial price/mcap
7. **Smart Call Creation**: Enter token address and thesis - metadata fetches automatically
8. **Multi-Platform Support**: Support for 5 trading platforms (GMGN, Axiom, Photon, BullX, Trojan)
9. **Smart Referral Priority**: Uses call-specific codes > user settings > defaults
10. **Link Generation**: Auto-generated shareable links for each call

### Flex-Worthy Call Pages
11. **Token Header**: Display token logo, name, symbol, and caller attribution ("First shared by @alias")
12. **Performance Flex Card**: Show ROI %, multiplier, ATH stats, and price comparisons
13. **Real-time Price Data**: Live price, 24h change, liquidity, volume, and market cap
14. **ATH Tracking**: Automatically track and display all-time high price and market cap
15. **Live Charts**: Interactive DexScreener chart embedded on the page
16. **Social Sharing**: "Share on X" button with pre-filled flex tweet showing ROI
17. **Copy Link Button**: One-click copy referral link with success feedback
18. **OpenGraph Metadata**: Rich social previews when sharing on X/Telegram

### Analytics & Tracking
19. **View Tracking**: Automatic view counting on page load with optimistic UI updates
20. **Click Tracking**: Track clicks on platform buttons with error rollback
21. **Referral Impact**: Display views, clicks, and performance metrics

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
1. **Create Call**: Enter a Solana token address and optional thesis (your saved referral codes are automatically attached)
2. **Get Shareable Link**: Receive an auto-generated link like `/call/[id]` to share
3. **Share & Track**: Share your link and track views/clicks in real-time

**Note**: Referral codes are no longer editable during call creation - they're managed only in Settings and automatically applied to all new calls.

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
- ✅ **Platform Logo Integration** (October 2025)
  - Added official GMGN logo (pixel frog) to GMGN platform button and settings field
  - Added official Axiom logo (two triangles) to Axiom platform button and settings field
  - GMGN logo stored in `/public/gmgn-logo.webp` (3.2KB)
  - Axiom logo stored in `/public/axiom-logo-optimized.webp` (6.4KB, optimized from 4.2MB)
  - Logos display on token call pages and next to referral code fields in settings
- ✅ **File Upload System** (October 2025)
  - Integrated Replit App Storage for secure file hosting
  - Users can upload profile pictures (max 5MB) and banners (max 10MB)
  - Support for both URL paste and device upload
  - Automatic path normalization and file serving via `/api/objects` endpoint
  - Banner displays as background on token call performance sections (20% opacity)
- ✅ **Orange Gradient Theme** - Complete UI redesign with orange-to-red gradient throughout
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
- ✅ **Simplified Call Creation** - Removed referral code inputs from CallForm, codes now auto-attach from user settings
- ✅ **Auto-Refresh User Settings** - Homepage refetches user settings when page gains focus (after returning from settings page)
- ✅ **Fixed Hydration Errors** - Added mounted state to prevent wallet button hydration mismatches
- ✅ **Fixed Settings Save** - Added onConflict parameter to upsert operations for proper wallet_address conflict resolution
- ✅ **Fixed Platform URLs** - Updated all platform referral link formats to match official documentation (Axiom @username, Photon username page, BullX neo.bullx.io, Trojan r- prefix, GMGN official bot)
- ✅ **Fixed Click Tracking** - Corrected error handling in platform button clicks to prevent console errors
- ✅ **MAJOR UPGRADE: Flex-Worthy Token Call Pages** (October 2025)
  - **Token Metadata System**: Auto-fetch token name, symbol, logo, initial price/mcap from DexScreener
  - **Profile System**: User profiles with alias, avatar, Twitter handle
  - **Performance Flex Card**: ROI %, multiplier, ATH price/mcap tracking and display
  - **Social Sharing**: Share on X button with pre-filled flex tweet, copy link with success toast
  - **OpenGraph Tags**: Rich social media previews with token info and performance stats
  - **Token Header**: Professional display with logo, name, symbol, caller attribution
  - **ATH Tracking**: Auto-update all-time high price and market cap with every price fetch
  - **Enhanced UI**: Modern, flex-worthy design similar to RickBot/PhanesBot style
- ✅ **COMPACT CALL PAGE REDESIGN** (October 2025)
  - **Token Header Redesign**: Token image next to $TICKER and current market cap for instant recognition
  - **Mobile-Optimized Performance**: Compact 3-column stats (ROI, ATH, Entry) fits perfectly on mobile
  - **Streamlined Layout**: Token info → Platform buttons → Chart for optimal sharing experience
  - **Removed Clutter**: Eliminated share buttons for cleaner, more focused design
  - **16:9 Chart Ratio**: Professional chart display on all devices
