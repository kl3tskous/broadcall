# Callor - Coin Call Referral Platform

## Overview
Callor is a Next.js-based application designed for Solana influencers to create and share "flex-worthy" token call pages. It integrates with Phantom wallet, uses Supabase for data management, and displays real-time price charts via DexScreener. The platform enables users to publish professional token calls with automatic performance tracking (views, clicks, ROI, ATH stats) and social sharing capabilities. It supports multiple trading platforms (GMGN, Axiom, Photon, BullX, Trojan) by automatically attaching custom referral codes, allowing influencers to monetize their calls and track engagement. The business vision is to empower crypto influencers with a powerful tool for showcasing their insights and driving referrals, enhancing their market presence and potential earnings.

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

## Recent Changes
- ✅ **Signal Icon Badge on Call Cards** (October 2025)
  - Added distinctive orange "C" signal/broadcast icon to all call cards
  - **Corner sticker design**: Icon floats outside top-left corner of cards using negative positioning (-top-2/-left-2)
  - **Consistent placement**: Applied to both pinned call cards and recent call cards
  - **Responsive sizing**: 40px on desktop, 32px on mobile for pinned calls; 32px desktop, 24px mobile for recent calls
  - **Clean visual hierarchy**: Badge positioned outside card boundaries to avoid content overlap

- ✅ **Callor Branding & Navigation Header** (October 2025)
  - Added official Callor logo to the website (transparent background version)
  - **Global navigation header**: Sticky header with logo, settings, and wallet connect
  - **Professional branding**: Orange-themed Callor wordmark with broadcast icon (48px height for visibility)
  - **Transparent logo**: Clean PNG with no background, blends perfectly with dark theme
  - **Responsive header**: Mobile-optimized layout with proper spacing
  - **Unified navigation**: Logo links to home, settings easily accessible
  - Updated site metadata to reflect Callor brand identity

- ✅ **Embedded DexScreener Chart in Call Card** (October 2025)
  - Replaced custom chart with compact DexScreener embedded iframe
  - **Positioned within call card**: Chart displays inside the orange bordered token card for a cleaner layout
  - **Compact design**: 200px height on mobile, 250px on desktop for optimal viewing
  - **Dark theme**: Matches site aesthetic with dark mode enabled
  - **Clean UI**: Trades and info panels hidden for minimal, focused chart view
  - **Live data**: Real-time price action powered by DexScreener's reliable API

- ✅ **Dynamic Banner Backgrounds with Gradient Fade** (October 2025)
  - Token call pages now feature the creator's uploaded banner as a full-page dynamic background
  - **Jupiter wallet-inspired design**: Banner fades smoothly into dark background using gradient overlay
  - **Gradient overlay system**: Transparent at top → semi-transparent middle → solid dark (gray-900) at bottom
  - **Fixed background positioning**: Banner stays in place while content scrolls over it
  - **Responsive heights**: Limited to 100px on mobile (stops at profile image, fades before tabs), full-screen on desktop
  - **Semi-transparent cards**: Token cards use `bg-gray-900/90` with backdrop blur for subtle banner visibility
  - **Fallback handling**: Pages without banner display solid gray-900 background
  - **Performance optimized**: Uses CSS fixed positioning and gradient overlays for smooth rendering

- ✅ **Gradient Platform Buttons with Custom Logos** (October 2025)
  - Redesigned all platform buttons (GMGN, Axiom, Photon, BullX, Trojan) with:
    - **Orange gradient background**: `from-orange-500 to-orange-600` with hover effect
    - **Extra large custom platform logos**: 64px size (w-16 h-16) for maximum visibility
    - **White bold text**: Platform name in text-sm font-extrabold below logo
    - **Vertical compact design**: Logo stacked above text (flex-col) for minimal width and maximum logo size
    - **Minimal padding**: px-2 py-3 for compact square-like buttons
    - **Personalized title**: Large centered heading (text-2xl/3xl) with orange gradient @username, matching token name size
    - **Shadow effects**: Added `shadow-lg hover:shadow-xl` for depth
    - **Consistent layout**: Vertical logo + text layout on all pages
  - All platform logos replaced with custom uploaded images:
    - GMGN: Green pixelated character logo
    - Axiom: Blue pyramid logo  
    - Photon: Cyan/purple gradient rocket logo
    - BullX: Green bull head logo
    - Trojan: White horse head logo
  - All logos stored in `/public/platforms/` directory
  - Buttons now visible on all screen sizes (removed mobile hidden state)
  - Applied to both call pages and profile feed cards

- ✅ **Simplified Profile Header & Tabbed Feed** (October 2025)
  - Clean, compact profile header on token call pages:
    - **Left-aligned layout**: Small profile image (48-64px) next to username with verified badge
    - **No bio section**: Streamlined header focuses on the call content
    - **Wider centered content**: Using max-w-6xl for optimal reading width
  - **Tabbed feed system** with "Pinned Call" and "Recent Calls":
    - **Pinned Call tab**: Shows the specific call with:
      - Custom dark card with gradient orange border
      - Token image, symbol, name, and "shared @ X mcap" format
      - ROI percentage and multiplier badge
      - Entry/Current/ATH stats row
      - Platform buttons (GMGN, Axiom, Photon, BullX, Trojan) with referral code priority
      - Thesis displayed as styled quote block
      - Live DexScreener chart (1-second candles, dark theme)
      - Twitter/X-style interaction buttons (Share on X, Copy Link, Comment) with view/click counts
    - **Recent Calls tab**: Grid layout showing user's other recent token calls with ROI display
  - Mobile-responsive design with proper breakpoints for all elements
  - Fixed Next.js App Router compatibility (removed old Head component)
  
- ✅ **Embedded Live Charts in Profile Feed** (October 2025)
  - Redesigned profile page token calls as self-contained social media posts:
    - **Simplified header**: User avatar, name, and date (no banner on feed cards)
    - **Token information**: Image, name, and "shared @ X mcap" format
    - **Thesis display**: Clean text block (when available)
    - **Embedded DexScreener chart**: Live 1-second candles with dark theme (300px height) directly in each card
    - **Platform buy buttons**: GMGN, Axiom, Photon, BullX, Trojan with proper referral codes below chart
  - Platform buttons correctly link to external trading platforms with referral code priority:
    - Call-specific referral code → User settings → Default fallback
    - Buttons open in new tab without interfering with card navigation
  - Card navigation: User info and token info sections are clickable to view call details
  - Mobile-responsive grid: 2 columns for buttons on mobile, 5 columns on desktop
  - Created reusable `EmbeddedChart` component for DexScreener integration
  
- ✅ **KOL Profile System** (October 2025)
  - Added bio (160 char max), telegram, and website fields to user profiles
  - Created public profile page at `/profile/[address]` with Twitter-style layout:
    - Full-width user banner at top with circular avatar overlapping
    - Display name, handle, bio, and social links (Twitter, Telegram, Website)
    - Performance stats: Total Calls, Avg ROI, Best Call
    - Tabs for "Calls" and "Stats" views
    - List of user's calls with ROI display using ATH fallback
  - Updated Settings page with new profile fields in organized grid layout
  - Token call pages now show caller's avatar with clickable link to profile
  - Added "More Calls by @user" section on token pages (shows 3 recent calls)
  - Database schema updated with new profile fields (bio, telegram, website)
  
- ✅ **Custom Dark Card with Gradient Borders** (October 2025)
  - Replaced full-width ape banner with sleek dark card design
  - Orange gradient border effect matching platform buttons (`from-orange-500/50 to-orange-600/50`)
  - Dark inner background (`bg-gray-900`) for high contrast and readability
  - Card layout features:
    - Token image (64-80px circular) on the left
    - Token symbol, name, and market cap displayed prominently
    - Green dot indicator with "shared at X MC" format
    - ROI percentage and multiplier badge on the right
    - Stats row at bottom showing Entry, Current, and ATH values
  - Mobile-responsive flexbox layout with proper spacing
  - Modern, clean design matching social media platform aesthetics

## External Dependencies
- **Supabase:** Used as the PostgreSQL database and for authentication.
- **DexScreener API:** Provides real-time token data, including price, market cap, and chart information.
- **Solana Wallet Adapter (Phantom):** For connecting and interacting with Phantom wallets.
- **Trading Platforms:** Integration with GMGN, Axiom, Photon, BullX, and Trojan for referral linking.