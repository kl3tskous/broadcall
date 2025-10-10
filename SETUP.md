# Setup Guide

## ⚡ Quick Start

Your Coin Call Platform is ready to use! Follow these steps to complete the setup:

## 📊 Step 1: Create Supabase Database Table

You already have your Supabase credentials configured. Now you just need to create the database table:

1. **Go to your Supabase Project**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard/projects)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SQL**
   - Copy the contents of `supabase-schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

That's it! Your database is now set up.

## 🚀 Step 2: Test Your App

1. **Connect Your Wallet**
   - Click the "Select Wallet" button
   - Choose Phantom from the list
   - Approve the connection

2. **Create Your First Call**
   - Enter a Solana token address (example: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)
   - Add an optional thesis/analysis
   - Click "Generate Link"

3. **Share the Link**
   - Copy the generated link
   - Share it with your audience
   - Track views and clicks automatically!

## 📱 How It Works

- **Views**: Auto-tracked when someone visits your call page
- **Clicks**: Counted when someone clicks "Buy via GMGN"
- **Referral Code**: `7rpqjHdf` is automatically included in all buy links
- **Charts**: Live GMGN price charts embedded on each call page

## 🎨 Customize

Want to change the referral code or add more features? Check out:
- `app/call/[id]/page.tsx` - Call page with tracking
- `components/CallForm.tsx` - Call creation form
- `app/globals.css` - Styling and theme colors

## 🚢 Deploy

Ready to go live? Click the **Publish** button in Replit to deploy your app with a custom domain!

---

Need help? Check `README.md` for full documentation.
