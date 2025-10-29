# BroadCall Deployment Guide

## 🚀 Quick Deploy to Production

BroadCall is ready for GitHub + Vercel deployment with webhook-based Telegram bot integration.

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Production Supabase database
- Twitter OAuth app (production credentials)
- Telegram bot token

---

## 📦 Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BroadCall production ready"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

---

## 🗄️ Step 2: Set Up Production Database

1. Go to your **production Supabase project**
2. Navigate to **SQL Editor**
3. Run the migration file: `database/FRESH_MIGRATION.sql`
4. This creates all required tables: `users`, `sessions`, `telegram_connection_tokens`

---

## ☁️ Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click **Deploy**

### Option B: Deploy via CLI
```bash
npm i -g vercel
vercel --prod
```

---

## 🔐 Step 4: Environment Variables

Set these in Vercel's Environment Variables section:

### Required Secrets
```env
# Backend URL (your production domain)
BACKEND_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app

# Twitter OAuth (Production)
TWITTER_CLIENT_ID=your_production_twitter_client_id
TWITTER_CLIENT_SECRET=your_production_twitter_client_secret

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Session Security
SESSION_SECRET=generate_a_random_32_char_string

# Object Storage (if using Replit Object Storage)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
PRIVATE_OBJECT_DIR=private
PUBLIC_OBJECT_SEARCH_PATHS=/public
```

---

## 🤖 Step 5: Set Up Telegram Webhook

After your app is deployed, set the webhook:

### Method 1: Using the API endpoint
Visit in your browser:
```
https://your-domain.vercel.app/api/telegram/set-webhook
```

Click the POST button or use curl:
```bash
curl -X POST https://your-domain.vercel.app/api/telegram/set-webhook
```

### Method 2: Check webhook status
```
https://your-domain.vercel.app/api/telegram/set-webhook
```
(GET request to see current webhook info)

---

## 🌐 Step 6: Configure Custom Domain

### Option A: Vercel Domain
Your app is already live at `your-app-name.vercel.app`

### Option B: Custom Domain (broadcall.xyz)
1. In Vercel Dashboard → **Settings** → **Domains**
2. Add `broadcall.xyz`
3. Update DNS records as instructed by Vercel
4. Update `BACKEND_URL` and `NEXTAUTH_URL` to `https://broadcall.xyz`
5. Re-set the Telegram webhook to the new domain

---

## 🔄 Step 7: Update Twitter OAuth Callback

In your Twitter Developer Portal:
1. Go to your app settings
2. Update **Callback URLs** to:
   ```
   https://your-domain.vercel.app/api/auth/twitter/callback
   https://broadcall.xyz/api/auth/twitter/callback
   ```
3. Update **Website URL** to your production domain

---

## ✅ Step 8: Test the Full Flow

1. Visit `https://your-domain.vercel.app`
2. Click **"Login with X (Twitter)"**
3. Authorize the Twitter app
4. Click **"Connect Telegram"**
5. Open the Telegram bot link
6. Send the `/start` command with your token
7. Verify you're redirected to the waitlist confirmation page

---

## 📊 Architecture Overview

### Webhook-Based Telegram Bot (Production-Ready)
- ✅ **No long-running processes** - Stateless, serverless architecture
- ✅ **Auto-scales** - Handles unlimited traffic via Vercel Edge
- ✅ **Zero conflicts** - No polling collisions or 409 errors
- ✅ **Integrated** - All bot logic runs through Next.js API routes

### Endpoints
- `POST /api/telegram/webhook` - Receives Telegram updates
- `POST /api/telegram/set-webhook` - Configure webhook URL
- `GET /api/telegram/set-webhook` - Check webhook status
- `POST /api/auth/twitter` - Twitter OAuth initiation
- `GET /api/auth/twitter/callback` - Twitter OAuth callback
- `POST /api/telegram/generate-token` - Generate connection token
- `POST /api/telegram/verify` - Verify Telegram connection

---

## 🐛 Troubleshooting

### Telegram Bot Not Responding
1. Check webhook is set correctly: `GET /api/telegram/set-webhook`
2. Verify `TELEGRAM_BOT_TOKEN` is set in Vercel
3. Check Vercel Function Logs for errors

### Twitter Login Fails
1. Verify callback URL is correct in Twitter Developer Portal
2. Check `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`
3. Ensure `BACKEND_URL` matches your deployment domain

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check Supabase allows connections from Vercel IPs
3. Run the migration if tables are missing

---

## 📝 Post-Deployment Checklist

- [ ] Database migration completed
- [ ] All environment variables set in Vercel
- [ ] Telegram webhook configured
- [ ] Twitter OAuth callback URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] Test full waitlist signup flow
- [ ] Test Telegram connection flow
- [ ] Verify Twitter login works

---

## 🎉 You're Live!

Your BroadCall platform is now deployed and ready for users!

**Next Steps:**
- Monitor Vercel Function Logs for any errors
- Test with real users
- Share the waitlist signup link
- Start building your KOL community!

---

## 🔧 Local Development

To run locally after cloning:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your local secrets to .env.local

# Run development server
npm run dev
```

**Note:** For local development, the Telegram bot will use polling instead of webhooks. You can optionally run the Python bot locally with `python bot.py` (though it's deprecated in favor of webhooks).
