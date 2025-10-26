# BroadCall - Coin Call Referral Platform

## Overview
BroadCall is a Next.js platform designed for Solana influencers to create and share professional "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data, and displays real-time price charts via DexScreener. The platform automates performance tracking (views, clicks, ROI, ATH stats), offers social sharing, and allows influencers to monetize calls by attaching custom referral codes for multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan). A key feature is the Telegram bot integration, enabling KOLs to link their Telegram accounts and automatically broadcast token calls with buy buttons to their channels.

## User Preferences
I prefer detailed explanations.
Ask before making major changes.
I want iterative development.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The platform is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, featuring a dark, modern design with an orange-to-red gradient theme.

**UI/UX Decisions:**
- **Flex-worthy Token Call Pages:** Designed for social sharing with dynamic headers, prominent ROI display, professional drop shadows, gradient overlays, and backdrop blur effects. The token call pages showcase the KOL's full profile, including a Twitter-style banner, avatar with an orange gradient stroke, username with a verification badge, and a "Latest Call Hero Card" prominently featuring the most recent call with large ROI display, token logo, platform trading buttons, and an embedded DexScreener chart. Subsequent calls are displayed as smaller cards below.
- **Glassmorphic Design:** Consistent glassmorphic elements are used across all pages for cards, inputs, buttons, and navigation, featuring semi-transparent backgrounds, backdrop blur, and enhanced shadow effects. This includes a unified glassmorphic navigation header across the entire platform.
- **Mobile-Optimized Layouts:** Compact, streamlined layouts for optimal viewing and sharing across devices.
- **Platform Logo Integration:** Official trading platform logos are integrated into buttons and settings, including an infinite scroll display on the landing page.
- **OpenGraph Metadata:** Generates rich social previews for shared links.
- **Custom Background Image:** All pages utilize a consistent custom background image (`/background.png`).

**Technical Implementations:**
- **Wallet Integration:** Phantom wallet integration using Solana Wallet Adapter for secure authentication.
- **Database:** Supabase (PostgreSQL) stores user profiles, settings, and call data, including detailed token metadata, views, and clicks.
- **Real-time Data:** DexScreener API provides automatic token metadata and real-time price data with 30-second auto-refresh.
- **Tracking System:** Implements optimistic UI updates for view tracking on page load and click tracking on platform buttons.
- **Referral System:** Supports multi-platform referral codes with smart priority (call-specific > user settings > default).
- **File Upload System:** Replit App Storage for secure profile picture and banner uploads.
- **KOL Profile System:** Public profile pages (`/profile/[address]`) with Twitter-style layouts, user bio, social links, performance stats, and tabbed views for "Calls" and "Stats."
- **Telegram Bot Integration:** A Python-based Telegram bot for secure KOL account linking (Ed25519 signature verification, token generation, webhook-free polling) and automatic token call broadcasting to configured Telegram channels. The bot manages channel subscriptions and allows KOLs to selectively enable/disable broadcasting to specific channels from the platform's settings. **Security hardened**: All channel management and broadcast endpoints require Ed25519 wallet signature authentication with 5-minute timestamp expiry, action binding (channel ID, enabled state, call ID), and server-side data fetching from database to prevent content tampering and phishing attacks.

**Feature Specifications:**
- **User Onboarding & Profile Management:** Welcome flow for new users to set up referral codes and manage profile (alias, avatar, Twitter handle, bio, Telegram, website).
- **Call Creation:** Users create calls by entering a Solana token address and optional thesis, with automatic metadata fetching and referral code attachment. The `/create-call` page provides a dedicated interface for KOLs to create and broadcast token calls.
- **Performance Tracking:** Call pages display auto-updating ROI, multiplier, and ATH (All-Time High) price/market cap.
- **Social Sharing:** "Share on X" buttons with pre-filled tweets and a copy link button.
- **Telegram Channel Broadcasting:** KOLs can broadcast their token calls to linked Telegram channels with professionally formatted messages and inline buy buttons, utilizing their referral codes. The broadcast system includes:
  - Automatic DexScreener data fetching (token name, symbol, logo, price, market cap)
  - Professional Markdown-formatted messages with ROI display, token details, and KOL thesis
  - Inline keyboard buttons for all 5 trading platforms (GMGN, Axiom, Photon, BullX, Trojan) plus DexScreener chart
  - Smart referral link injection using user's saved platform codes
  - Database storage of all calls with performance metrics (views, clicks, ROI, ATH tracking)

## Recent Changes (October 26, 2025)
- ✅ **Production Domain Setup**: Created domain utility system for broadcall.xyz integration
  - Added `lib/utils.ts` with `getBaseUrl()`, `getFullUrl()`, and `getDomain()` functions
  - Environment-aware URL generation (broadcall.xyz in production, localhost in dev)
  - Added `NEXT_PUBLIC_APP_URL` environment variable to .env.local.example
  - Ready for production deployment with custom domain support
- ✅ **Production Deployment Configuration**: Verified deployment setup
  - Autoscale deployment mode configured in .replit
  - Build script: `npm run build`
  - Production server: `npm start` (serves on port 5000)
  - Both Server and Telegram Bot workflows running successfully
- ✅ **Code Cleanup**: Removed unused files for cleaner production codebase
  - Removed unused main.py template file
  - Cleaned up temporary pasted text files from attached_assets folder
  - Verified no LSP diagnostics in bot.py
- ✅ **One-Click Telegram Waitlist (Inline on Homepage)**: Implemented seamless waitlist signup flow entirely on homepage using Telegram deep links
  - Users click "Join Waitlist" → "Open Telegram" UI appears inline in the same section (no page redirect)
  - Single "Open Telegram" button launches Telegram with wallet address pre-encoded in URL parameter
  - Bot's `/start` command auto-detects wallet addresses (32-44 chars) and completes verification instantly
  - User just clicks "START" button in Telegram - no manual copy/paste needed
  - Homepage auto-polls every 3 seconds and updates to success state when verification completes
  - Entire flow happens on homepage with smooth state transitions
  - `/waitlist` command kept as backup verification method
- ✅ **Improved UX**: Removed page redirects, all waitlist steps now happen inline on homepage

## Previous Changes (October 25, 2025)
- ✅ **"Trades in" Feature**: Added trades_in_name and trades_in_image columns to user_settings table for group/community attribution
- ✅ **Settings Page Enhancement**: Added "Trades in" section with group name input and image upload functionality using existing Replit Object Storage system
- ✅ **Upload Consistency**: Unified all image uploads (avatar, banner, trades-in) to use the same `/api/upload` endpoint and FileUploader flow
- ✅ **Call Page Redesign**: Completely redesigned `/call/[id]` to match Figma design with:
  - Twitter-style banner + profile header (avatar with orange border, verification badge, bio)
  - Thesis + "Trades in" display row showing community attribution
  - Main call card: "Called: $TOKEN And it's UP by +X%" with price badge, chart preview, stats
  - 6 trading platforms (GMGN, Axiom, Photon, BullX, Trojan, DexScreener) in horizontal glassmorphic layout
- ✅ **DexScreener Integration**: Added as 6th trading platform with proper logo and URL handling
- ✅ **Performance Tracking**: Maintained auto-updating ROI, multiplier, ATH stats with 30-second refresh

## Previous Changes (October 23, 2025)
- ✅ Created `calls` table for storing token call data with comprehensive schema
- ✅ Built `/api/calls/create` endpoint with DexScreener integration and automatic broadcasting
- ✅ Updated `/api/telegram/broadcast` with professional message formatting and inline buy buttons
- ✅ Created `/create-call` page with clean UX for token call creation
- ✅ Fixed authentication flow between create and broadcast endpoints
- ✅ Implemented complete end-to-end call broadcasting system

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **DexScreener API:** Real-time token data, prices, market cap, and charts.
- **Solana Wallet Adapter (Phantom):** Wallet connection and interaction.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.
- **Telegram Bot API:** Python-telegram-bot library for Telegram bot functionality.
- **Cryptography Libraries:** tweetnacl (Ed25519 signatures), bs58 (Base58 encoding), for wallet signature verification.