# BroadCall - Coin Call Referral Platform

## Overview
BroadCall is a Next.js platform for Solana influencers to create and share professional, "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data management, and displays real-time price charts via DexScreener. The platform automates performance tracking (views, clicks, ROI, ATH stats), offers social sharing features, and enables influencers to monetize calls by attaching custom referral codes for multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan). A key feature is the Telegram bot integration, allowing KOLs to link their Telegram accounts and automatically broadcast token calls with buy buttons to their channels.

## User Preferences
I prefer detailed explanations.
Ask before making major changes.
I want iterative development.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The platform is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, featuring a dark, modern design with an orange-to-red gradient theme.

**UI/UX Decisions:**
- **Flex-worthy Token Call Pages:** Designed for social sharing with dynamic headers, prominent ROI display, professional drop shadows, gradient overlays, and backdrop blur effects. Pages showcase the KOL's profile, including a Twitter-style banner, avatar, username with verification badge, and a "Latest Call Hero Card" with large ROI display, token logo, platform trading buttons, and an embedded DexScreener chart.
- **Glassmorphic Design:** Consistent glassmorphic elements are used across all pages for cards, inputs, buttons, and navigation.
- **Mobile-Optimized Layouts:** Compact, streamlined layouts for optimal viewing and sharing across devices.
- **OpenGraph Metadata:** Generates rich social previews for shared links.
- **Custom Background Image:** All pages utilize a consistent custom background image (`/background.png`).

**Technical Implementations:**
- **Authentication System:** Twitter OAuth 2.0-based authentication with PKCE (Proof Key for Code Exchange) for enhanced security. Users log in with their X (Twitter) account, then connect their Telegram account to join the waitlist. Session management uses HTTP-only cookies with 30-day expiration. User data (Twitter profile, Telegram ID, waitlist status) stored in Supabase users table.
- **Wallet Integration:** Phantom wallet integration using Solana Wallet Adapter (optional, for future token calls after gaining access).
- **Database:** Supabase (PostgreSQL) stores user authentication data, profiles, settings, and call data. New `users` table stores Twitter/Telegram profiles with `joined_waitlist` and `access_granted` flags. `sessions` table manages active login sessions.
- **Real-time Data:** DexScreener API provides automatic token metadata and real-time price data with 30-second auto-refresh.
- **Tracking System:** Implements optimistic UI updates for view tracking on page load and click tracking on platform buttons.
- **Referral System:** Supports multi-platform referral codes with smart priority.
- **File Upload System:** Replit App Storage for secure profile picture and banner uploads.
- **KOL Profile System:** Public profile pages (`/profile/[address]`) with Twitter-style layouts, user bio, social links, performance stats, and tabbed views for "Calls" and "Stats."
- **Telegram Bot Integration:** Webhook-based Telegram bot (production-ready) integrated directly into Next.js API routes. Handles secure KOL account linking via one-time tokens and automatic token call broadcasting to configured Telegram channels. The bot manages channel subscriptions and allows selective broadcasting from platform settings. Security features include secret token validation for webhook requests, preventing unauthorized/forged updates.

**Feature Specifications:**
- **Authentication Flow:** 
  1. User clicks "Login with X (Twitter)" on homepage
  2. Redirected to Twitter OAuth 2.0 authorization (with PKCE)
  3. After Twitter login, user profile data fetched from Twitter API v2
  4. User redirected to "Connect Telegram" screen
  5. User connects Telegram account via one-time token link
  6. `joined_waitlist` flag set to TRUE in database
  7. User sees waitlist confirmation page with both accounts connected
  8. Dashboard/call creation unlocked after admin grants `access_granted = TRUE`
- **User Onboarding & Profile Management:** Twitter profile data (username, display name, avatar, bio) automatically populated. Optional Solana wallet connection for token call creation. Profile management includes referral codes and "Trades In" badge settings.
- **Call Creation:** Users create calls by entering a Solana token address and optional thesis, with automatic metadata fetching and referral code attachment.
- **Performance Tracking:** Call pages display auto-updating ROI, multiplier, and ATH (All-Time High) price/market cap.
- **Social Sharing:** "Share on X" buttons with pre-filled tweets and a copy link button.
- **Telegram Channel Broadcasting:** KOLs can broadcast token calls to linked Telegram channels with professionally formatted messages and inline buy buttons, utilizing their referral codes. The system includes automatic DexScreener data fetching, Markdown-formatted messages, inline keyboard buttons for all 5 trading platforms plus DexScreener chart, and smart referral link injection.

## External Dependencies
- **Twitter API v2:** OAuth 2.0 authentication and user profile data fetching (username, name, bio, profile image).
- **Supabase:** PostgreSQL database for users, sessions, settings, and call data.
- **DexScreener API:** Real-time token data, prices, market cap, and charts.
- **Solana Wallet Adapter (Phantom):** Optional wallet connection and interaction.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.
- **Telegram Bot API:** Webhook-based bot integration via Next.js API routes for stateless, scalable architecture.
- **Cryptography Libraries:** tweetnacl (Ed25519 signatures), bs58 (Base58 encoding), Node.js crypto module (PKCE generation, HMAC verification).