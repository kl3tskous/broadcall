# Callor - Coin Call Referral Platform

## Overview
Callor is a Next.js-based platform empowering Solana influencers to create and share professional "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data management, and displays real-time price charts via DexScreener. The platform automates performance tracking (views, clicks, ROI, ATH stats) and offers social sharing capabilities. Influencers can monetize their calls by attaching custom referral codes for multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan), enhancing their market presence and earnings.

## User Preferences
I prefer detailed explanations.
Ask before making major changes.
I want iterative development.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The platform is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, featuring a dark, modern design with an orange-to-red gradient theme.

**UI/UX Decisions:**
- **Flex-worthy Token Call Pages:** Designed for social sharing with dynamic headers, prominent ROI display, professional drop shadows, gradient overlays, and backdrop blur effects.
- **Mobile-Optimized Layouts:** Compact, streamlined layouts for optimal viewing and sharing across devices.
- **Platform Logo Integration:** Official trading platform logos are integrated into buttons and settings.
- **OpenGraph Metadata:** Generates rich social previews for shared links with token information and performance stats.
- **Glassmorphic Design:** Features glassmorphic elements for buttons, landing page components, and navigation, with semi-transparent backgrounds, backdrop blur, and enhanced shadow effects.

**Technical Implementations:**
- **Wallet Integration:** Phantom wallet integration using Solana Wallet Adapter for secure authentication.
- **Database:** Supabase (PostgreSQL) stores user profiles, settings, and call data, including detailed token metadata, views, and clicks.
- **Real-time Data:** DexScreener API provides automatic token metadata and real-time price data (auto-refreshes every 30 seconds).
- **Tracking System:** Implements optimistic UI updates for view tracking on page load and click tracking on platform buttons, with error rollback.
- **Referral System:** Supports multi-platform referral codes with smart priority (call-specific > user settings > default) and auto-fills saved codes.
- **File Upload System:** Replit App Storage for secure profile picture and banner uploads.
- **KOL Profile System:** Public profile pages (`/profile/[address]`) with Twitter-style layouts, including user bio, social links, performance stats, and tabbed views for "Calls" and "Stats."
- **Embedded Charts:** Integrates compact DexScreener embedded iframes for live charts within call cards and profile feed.

**Feature Specifications:**
- **User Onboarding & Profile Management:** Welcome flow for new users to set up referral codes and manage profile (alias, avatar, Twitter handle, bio, Telegram, website).
- **Call Creation:** Users create calls by entering a Solana token address and optional thesis, with automatic metadata fetching and referral code attachment.
- **Performance Tracking:** Call pages display auto-updating ROI, multiplier, and ATH (All-Time High) price/market cap.
- **Social Sharing:** "Share on X" buttons with pre-filled tweets and a copy link button.
- **Tabbed Feed System:** Profile pages feature "Pinned Call" and "Recent Calls" tabs, displaying calls in a grid layout with ROI.

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **DexScreener API:** Real-time token data, prices, market cap, and charts.
- **Solana Wallet Adapter (Phantom):** Wallet connection and interaction.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.