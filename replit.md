# BroadCall - Coin Call Referral Platform

## Overview
BroadCall is a Next.js-based platform empowering Solana influencers to create and share professional "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data management, and displays real-time price charts via DexScreener. The platform automates performance tracking (views, clicks, ROI, ATH stats) and offers social sharing capabilities. Influencers can monetize their calls by attaching custom referral codes for multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan), enhancing their market presence and earnings.

## Recent Changes
- ✅ **Telegram Bot Integration - Phase 1: Account Linking** (October 23, 2025)
  - **Secure KOL-Telegram account linking** with cryptographic wallet signature verification
  - **Python Telegram bot** (@BroadCallBot) with /start, /status, /disconnect commands
  - **Settings page UI**: Glassmorphic Telegram connection section with connect/disconnect functionality
  - **Security implementation**:
    - Ed25519 signature verification using tweetnacl and bs58
    - Strict message format validation (prevents replay attacks)
    - 5-minute timestamp window (prevents signature reuse)
    - Wallet ownership proof required for all connections
  - **Backend API endpoints**:
    - POST /api/telegram/generate-token: Creates secure connection tokens with signature verification
    - POST /api/telegram/verify: Links Telegram account after bot verification
    - GET /api/telegram/status: Checks connection status
    - DELETE /api/telegram/disconnect: Unlinks Telegram account
  - **Database schema**: Added telegram_id, telegram_username to profiles table; created telegram_connection_tokens table
  - **Dual-workflow system**: Next.js server + Python bot running in parallel
  - **Connection flow**: Settings → Sign message with wallet → Deep link to Telegram → Bot verifies → Account linked
  - **Phase 2 roadmap**: Enable KOLs to broadcast token calls to Telegram channels with buy buttons
  - **Architect-approved**: Security reviewed and validated, no vulnerabilities

- ✅ **Token Call Page KOL Showcase Redesign** (October 22, 2025)
  - **Complete UX transformation**: Token call pages now showcase the KOL's full profile and track record
  - **KOL Profile Banner Section** at top:
    - Twitter-style banner image with avatar overlay positioned in front (overlapping banner bottom with z-20)
    - Avatar uses `transform: translateY(50%)` positioning center of avatar at banner's bottom edge (50% on banner, 50% below)
    - Avatar has orange gradient stroke border (135deg, #ff8800 to #ff4400) using CSS border-box technique
    - Proper spacing between banner and username (mt-16 md:mt-20) to accommodate avatar overlap
    - Username with verification badge (orange gradient checkmark)
    - Bio/description text
    - "Trades in: @username" label in glassmorphic pill
  - **Latest Call Hero Card**: Most recent call prominently featured first
    - "Called: $TOKEN And it's UP/DOWN by" typography
    - Large ROI display (5xl-7xl, green gradient for gains, red for losses)
    - Token logo positioned top-right (20-24px rounded square)
    - Platform trading buttons (24-32px, glassmorphic design)
    - Embedded DexScreener chart (280-350px height)
    - Market cap when called info
    - Thesis quote if available
  - **Previous Calls Stack**: All other calls by the KOL shown chronologically below
    - Smaller call cards (same structure as hero but 4xl text, 250px charts)
    - Each card fully functional with platform buttons, charts, and stats
  - **Data fetching**: Fetches ALL calls by creator on page load, sorted by date (newest first)
  - **Performance**: Parallel price fetching for all calls with 30-second auto-refresh
  - **Social sharing benefit**: Users clicking shared links immediately see KOL's credibility and full track record
  - **Glassmorphic consistency**: All cards use white/12% bg, 20px blur, white/20% borders, 34-51px corners
  - **Fully responsive**: Mobile-first design with md: breakpoints for desktop

- ✅ **Fixed Double Header Issue** (October 22, 2025)
  - Removed ConditionalHeader from root layout that was causing duplicate headers
  - **Single glassmorphic header across all pages** - No more double menu issue
  - Added CallPageHeader to authenticated Homepage for consistency
  - Clean, unified navigation experience throughout the platform
  - **Architect-approved**: No functional regressions

- ✅ **Glassmorphic Navigation Header on All Pages** (October 21, 2025)
  - **Profile and Settings pages now use CallPageHeader** (glassmorphic navigation header)
  - Replaced old dark banner/headers with consistent glassmorphic design across all pages
  - **Navigation links** visible when wallet is connected: Home, Profile, Settings
  - **Create Call button** prominently displayed in header
  - **Profile page**: CallPageHeader appears above the Twitter-style banner/avatar section
  - **Settings page**: CallPageHeader at top (removed redundant back button)
  - **Architect-approved**: Clean integration with no functional regressions

- ✅ **Custom Background Image Implementation** (October 21, 2025)
  - **ALL pages now use custom background image** (`/background.png`) for consistent visual identity
  - Replaced programmatic CSS gradient blur orbs with static background image
  - **Background styling**: cover, center position, no-repeat, fixed attachment on main pages
  - **Applied across all pages and states**:
    - Token Call Page (loading, not-found, authenticated)
    - Settings Page (no-wallet, loading, authenticated)
    - Profile Page (loading, not-found, authenticated)
    - Homepage (authenticated)
    - Landing Page
  - **Glassmorphic UI preserved**: All cards, inputs, and buttons maintain their frosted glass aesthetic
  - **Architect-approved**: Clean implementation with no functional regressions

- ✅ **Universal Glassmorphic UI Redesign - Complete Platform Overhaul** (October 21, 2025)
  - **Settings Page**: Glassmorphic profile editor, referral code section, semi-transparent form fields
  - **Profile Page**: Glassmorphic tabs, call cards, and stats sections (maintains Twitter-style banner/avatar header)
  - **Homepage**: Glassmorphic "Create New Call" form card with atmospheric background
  - **All page states**: Loading, error, not-found, and authenticated views use consistent styling
  - **Unified glassmorphic styling**: Cards (white/12%, 20px blur, white/20% borders, 34px corners), Inputs (white/8%, 10px blur, white/10% borders, 2xl corners)
  - **Complete visual consistency across entire platform**

- ✅ **Token Call Page Glassmorphic Header** (October 21, 2025)
  - Replaced black header on token call pages with glassmorphic design matching landing page
  - Button displays "Connect Wallet" for non-connected users, "Create Call" for connected users
  - Seamless visual consistency across all pages

- ✅ **Landing Page Infinite Scroll Platform Logos** (October 21, 2025)
  - Platform logos now smoothly scroll horizontally in endless loop
  - Centered layout with elegant CSS mask fade effects on left/right edges
  - Logos fade seamlessly into background without visible overlay artifacts
  - Compact spacing ensures all content visible above the fold

- ✅ **Landing Page UX Improvement** (October 21, 2025)
  - Removed duplicate header issue on landing page
  - Created conditional header that only shows when wallet is connected
  - "Launch App" and "Create Profile" buttons now trigger wallet connection modal
  - Clean, single glassmorphic header experience for new visitors

- ✅ **Rebranding: Callor → BroadCall** (October 21, 2025)
  - Updated brand identity from "Callor" to "BroadCall" across the entire platform
  - New logo: Orange "B" with broadcast signal icon representing influence and reach
  - Updated all references: Header, Landing Page, metadata, share text, and documentation
  - Seamless transition maintaining all existing functionality

- ✅ **Complete Token Call Page Redesign - Figma-Based Glassmorphic Overhaul** (October 21, 2025)
  - **Major visual transformation** inspired by user's Figma design for maximum social media impact
  - **Atmospheric layered background**: Pure black with gradient blur orbs for depth
    - Orange/red gradient (767px) at bottom center • Green (901×720px) at top-left • Purple (269px) at bottom-right • Gray center blur • Red/brown gradient for warmth
  - **Decorative corner accents**: White/12% diagonal lines in all corners (38.66° rotation)
  - **Hero glassmorphic card**: Large centered card (white/12% bg, 20px backdrop blur, white/20% border, 34px rounded corners)
    - Token name: Massive 5xl-7xl typography with "$" prefix (e.g., "$Futardio")
    - ROI display: Matching large orange gradient text showing performance (+400% style)
    - Token logo: Positioned in top-right corner (80-96px rounded square with shadow)
    - "Since called by" section: Profile avatar (48px) + @username + orange verification badge (circular with checkmark)
    - Inline chart: DexScreener embed (250-350px) integrated within hero card
  - **"APE on your favorite platform below"**: Bold centered headline with "APE" in orange gradient
    - Horizontal scrollable platform buttons (160×160px, rounded-[34px], hidden scrollbar)
    - Larger, more prominent glassmorphic design matching landing page aesthetic
  - **Streamlined single-page layout**: Removed tabs/profile sections for focused call presentation
  - **Consistent glassmorphic styling**: Thesis quote, stats/social sharing, "More calls" sections all use unified design language
  - **Fully responsive**: Mobile-first with Tailwind md: breakpoints for desktop optimization
  - **Functionality preserved**: All tracking, referral links, social sharing, and price updates work perfectly
  - **Architect-approved**: Clean implementation maintaining all existing features with improved UX

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
- **Telegram Bot Integration:** Python-based Telegram bot for KOL account linking with Ed25519 signature verification, secure token generation, and webhook-free polling architecture.

**Feature Specifications:**
- **User Onboarding & Profile Management:** Welcome flow for new users to set up referral codes and manage profile (alias, avatar, Twitter handle, bio, Telegram, website).
- **Call Creation:** Users create calls by entering a Solana token address and optional thesis, with automatic metadata fetching and referral code attachment.
- **Performance Tracking:** Call pages display auto-updating ROI, multiplier, and ATH (All-Time High) price/market cap.
- **Social Sharing:** "Share on X" buttons with pre-filled tweets and a copy link button.
- **Tabbed Feed System:** Profile pages feature "Pinned Call" and "Recent Calls" tabs, displaying calls in a grid layout with ROI.
- **Telegram Account Linking:** Secure wallet-signature-based Telegram connection for KOLs, with deep linking flow and status management in Settings page.

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **DexScreener API:** Real-time token data, prices, market cap, and charts.
- **Solana Wallet Adapter (Phantom):** Wallet connection and interaction.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.
- **Telegram Bot API:** Python-telegram-bot library for Telegram bot functionality and account linking.
- **Cryptography Libraries:** tweetnacl (Ed25519 signatures), bs58 (Base58 encoding), for wallet signature verification.