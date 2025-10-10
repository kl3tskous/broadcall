# Coin Call Referral Platform

A Next.js-based Solana influencer coin-call referral platform with Phantom wallet integration, Supabase database, and GMGN chart embeds.

## Features

✨ **Phantom Wallet Integration** - Connect your Solana wallet to create and track calls  
📊 **DexScreener Price Data** - Real-time token prices with 24h change, liquidity, volume, and market cap  
🔗 **Shareable Links** - Auto-generated unique links for each call  
📈 **Analytics Tracking** - Automatic view and click tracking  
💰 **Referral System** - Built-in GMGN referral code integration  
🎨 **Modern Dark UI** - Sleek design with purple gradient accents  
🔄 **Auto-Refresh** - Price data updates every 30 seconds

## Quick Start

### 1. Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project or use existing one
3. Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor

### 2. Configure Environment

Your Supabase credentials are already set up in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Install & Run

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5000

## How to Use

### Creating a Call

1. Click **Select Wallet** to connect your Phantom wallet
2. Enter the Solana token address
3. Add an optional thesis/analysis
4. Click **Generate Link** to create your shareable call

### Sharing Calls

Each call gets a unique URL like `/call/[id]` that you can share with your audience. The page includes:
- **Token information and thesis** - Your analysis and token details
- **Real-time price data** - Live updates every 30 seconds (price, 24h change, liquidity, volume, market cap)
- **Embedded interactive chart** - DexScreener chart displays by default on desktop & mobile
- **Buy button** - Opens GMGN Telegram bot with your referral code
- **Automatic tracking** - Views and clicks tracked in real-time

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Adapter
- **Database**: Supabase (PostgreSQL)
- **Charts**: GMGN iframe embeds

## Project Structure

```
/app
  ├── layout.tsx              # Root layout with wallet provider
  ├── page.tsx                # Homepage with wallet connect & form
  ├── globals.css             # Global styles
  └── /call/[id]
      └── page.tsx            # Dynamic call page

/components
  ├── WalletProvider.tsx      # Solana wallet configuration
  └── CallForm.tsx            # Call creation form

/utils
  └── supabaseClient.ts       # Supabase client & types
```

## Database Schema

```sql
create table calls (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null,
  token_address text not null,
  platform text not null,
  thesis text,
  views int default 0,
  clicks int default 0,
  created_at timestamp with time zone default now()
);
```

## Referral System

The platform uses a hardcoded GMGN referral code `7rpqjHdf`. When users click the "Buy via GMGN" button, they're redirected to:

```
https://t.me/gmgnaibot?start=i_7rpqjHdf_sol_[TOKEN_ADDRESS]
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Publishing

Ready to deploy your app? Click the **Publish** button in Replit to make it live with a public URL!

---

Built with ❤️ using Next.js, Solana, and Supabase
