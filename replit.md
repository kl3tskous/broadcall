# Coin Call Referral Platform

## Overview
The Coin Call Referral Platform is a Next.js-based application designed for Solana influencers to create and share "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data management, and displays real-time price charts via DexScreener. The platform enables users to publish professional token calls with automatic performance tracking (views, clicks, ROI, ATH stats) and social sharing capabilities. It supports multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan) by automatically attaching custom referral codes, allowing influencers to monetize their calls and track engagement. The business vision is to empower crypto influencers with a powerful tool for showcasing their insights and driving referrals, enhancing their market presence and potential earnings.

## User Preferences
I prefer detailed explanations.
Ask before making major changes.
I want iterative development.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The platform is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS for a modern, responsive UI/UX. It features a dark, modern design with an orange-to-red gradient theme.

**UI/UX Decisions:**
- **Flex-worthy Token Call Pages:** Designed for social sharing, featuring a dynamic header with an ape graphic, prominent ROI display, professional drop shadows, gradient overlays, and backdrop blur effects.
- **Mobile-Optimized Layouts:** Compact 3-column stats and a streamlined layout ensure an optimal viewing and sharing experience across devices.
- **Platform Logo Integration:** Official trading platform logos are integrated into buttons and settings fields for brand recognition.
- **OpenGraph Metadata:** Rich social previews are generated for shared links, displaying token information and performance stats.

**Technical Implementations:**
- **Wallet Integration:** Phantom wallet is integrated using the Solana Wallet Adapter for secure user authentication and interactions.
- **Database:** Supabase (PostgreSQL) is used for storing user profiles, settings, and call data, including detailed token metadata, views, and clicks.
- **Real-time Data:** DexScreener API provides automatic token metadata fetching (name, symbol, logo, initial price/mcap) and real-time price data (price, 24h change, liquidity, volume, market cap), which auto-refreshes every 30 seconds.
- **Tracking System:** Implements optimistic UI updates for view tracking on page load and click tracking on platform buttons with error rollback for robustness.
- **Referral System:** Supports multi-platform referral codes with smart priority (call-specific > user settings > default) and auto-fills saved referral codes during call creation.
- **File Upload System:** Integrated Replit App Storage for secure profile picture and banner uploads, with automatic path normalization.

**Feature Specifications:**
- **User Onboarding & Profile Management:** A welcome flow for new users, guiding them to set up referral codes and manage their profile (alias, avatar, Twitter handle).
- **Call Creation:** Users can create calls by entering a Solana token address and an optional thesis, with automatic metadata fetching and referral code attachment.
- **Performance Tracking:** Each call page displays ROI, multiplier, and ATH (All-Time High) price/market cap, which auto-updates.
- **Social Sharing:** "Share on X" buttons with pre-filled flex tweets and a copy link button with success feedback.

## External Dependencies
- **Supabase:** Used as the PostgreSQL database and for authentication.
- **DexScreener API:** Provides real-time token data, including price, market cap, and chart information.
- **Solana Wallet Adapter (Phantom):** For connecting and interacting with Phantom wallets.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.