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
- **Wallet Integration:** Phantom wallet integration using Solana Wallet Adapter for secure authentication.
- **Database:** Supabase (PostgreSQL) stores user profiles, settings, and call data, including detailed token metadata, views, and clicks.
- **Real-time Data:** DexScreener API provides automatic token metadata and real-time price data with 30-second auto-refresh.
- **Tracking System:** Implements optimistic UI updates for view tracking on page load and click tracking on platform buttons.
- **Referral System:** Supports multi-platform referral codes with smart priority.
- **File Upload System:** Replit App Storage for secure profile picture and banner uploads.
- **KOL Profile System:** Public profile pages (`/profile/[address]`) with Twitter-style layouts, user bio, social links, performance stats, and tabbed views for "Calls" and "Stats."
- **Telegram Bot Integration:** A Python-based Telegram bot for secure KOL account linking (Ed25519 signature verification, token generation, webhook-free polling) and automatic token call broadcasting to configured Telegram channels. The bot manages channel subscriptions and allows selective broadcasting from platform settings. Security is hardened with Ed25519 wallet signature authentication for all channel management and broadcast endpoints.

**Feature Specifications:**
- **User Onboarding & Profile Management:** Welcome flow for new users to set up referral codes and manage profile (alias, avatar, Twitter handle, bio, Telegram, website).
- **Call Creation:** Users create calls by entering a Solana token address and optional thesis, with automatic metadata fetching and referral code attachment.
- **Performance Tracking:** Call pages display auto-updating ROI, multiplier, and ATH (All-Time High) price/market cap.
- **Social Sharing:** "Share on X" buttons with pre-filled tweets and a copy link button.
- **Telegram Channel Broadcasting:** KOLs can broadcast token calls to linked Telegram channels with professionally formatted messages and inline buy buttons, utilizing their referral codes. The system includes automatic DexScreener data fetching, Markdown-formatted messages, inline keyboard buttons for all 5 trading platforms plus DexScreener chart, and smart referral link injection.

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **DexScreener API:** Real-time token data, prices, market cap, and charts.
- **Solana Wallet Adapter (Phantom):** Wallet connection and interaction.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.
- **Telegram Bot API:** Python-telegram-bot library for Telegram bot functionality.
- **Cryptography Libraries:** tweetnacl (Ed25519 signatures), bs58 (Base58 encoding), for wallet signature verification.