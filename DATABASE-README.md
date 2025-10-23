# BroadCall Database Management

## 📋 Available SQL Files

### 1. **COMPLETE-DATABASE-CHECK.sql**
**What it does:** Shows your entire database structure and all data
**When to use:** Anytime you want to see what's in your Supabase database
**How to run:**
```bash
# In terminal
psql $DATABASE_URL -f COMPLETE-DATABASE-CHECK.sql

# OR copy/paste into Supabase SQL Editor
```

### 2. **FIX-ALL-ISSUES.sql** ✅ (Already run)
**What it fixed:**
- ✅ Corrected telegram username: `Jobbatradess` → `Jobbatrades`
- ✅ Added missing `channel_username` column to `telegram_channels` table

### 3. **check-database-structure.sql**
**What it does:** Quick overview of tables and data
**When to use:** For a faster check than COMPLETE-DATABASE-CHECK

### 4. **fix-supabase-complete.sql** ✅ (Already run)
**What it did:**
- Created `user_settings` table
- Created `telegram_channels` table
- Merged your duplicate profiles

## ✅ What's Been Fixed

### 1. Database Tables
All required tables now exist with correct structure:
- ✅ `profiles` - Has telegram_id & telegram_username
- ✅ `user_settings` - For referral codes
- ✅ `telegram_channels` - For channel management (now with channel_username)
- ✅ `telegram_connection_tokens` - For Telegram linking

### 2. Your Profile Data
```
Wallet: 5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT
Alias: Jobba
Twitter: @Jobbatrades
Telegram: @Jobbatrades (ID: 6046882827) ✅ FIXED
```

### 3. Code Fixes
- ✅ `/api/telegram/add-channel` now correctly inserts `telegram_id` column
- ✅ `/api/profile/get` uses direct PostgreSQL to bypass Supabase cache issues

## 🧪 Testing

To test if everything works:

1. **Refresh Settings page** and connect your wallet
2. **Check your Telegram connection** - should show @Jobbatrades (not @Jobbatradess)
3. **Add @Broadcall_Bot as admin to a Telegram channel**
4. **Channel should connect successfully** (no more "Error connecting channel")

## 📊 Quick Database Check Commands

```bash
# See all tables
psql $DATABASE_URL -c "\dt"

# Check your profile
psql $DATABASE_URL -c "SELECT * FROM profiles WHERE wallet_address = '5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT';"

# Check telegram channels
psql $DATABASE_URL -c "SELECT * FROM telegram_channels;"

# Check telegram_channels structure
psql $DATABASE_URL -c "\d telegram_channels"
```

## 🔧 Why Direct PostgreSQL?

We use `pg` library instead of Supabase client for `/api/profile/get` because:
- Supabase's PostgREST caches schema and doesn't auto-update when columns are added
- Direct PostgreSQL always returns current data
- This is a known issue with managed Supabase instances

## 📝 Notes

- All fixes have been applied to your database ✅
- Your Telegram username is now correct: @Jobbatrades ✅
- Channel connection should work now ✅
- Use `COMPLETE-DATABASE-CHECK.sql` anytime to see full database state
