# BroadCall Database Migration Instructions

## Twitter OAuth 2.0 + Telegram Integration

This guide will help you set up the required database tables for the new Twitter OAuth authentication system.

---

## Prerequisites

- Access to your Supabase dashboard
- Admin privileges on your PostgreSQL database

---

## Migration Steps

### Step 1: Create Users Table

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `database/users-table-schema.sql`
4. Click **Run** to execute the SQL

This will create the `users` table with the following fields:
- `id` (UUID, Primary Key)
- `twitter_id` (TEXT, UNIQUE, NOT NULL)
- `twitter_username` (TEXT)
- `twitter_name` (TEXT)
- `profile_image_url` (TEXT)
- `banner_image_url` (TEXT)
- `bio` (TEXT)
- `telegram_id` (TEXT, UNIQUE)
- `telegram_username` (TEXT)
- `wallet_address` (TEXT, UNIQUE)
- `joined_waitlist` (BOOLEAN, DEFAULT FALSE)
- `access_granted` (BOOLEAN, DEFAULT FALSE)
- `twitter_access_token` (TEXT)
- `twitter_refresh_token` (TEXT)
- `twitter_token_expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_login_at` (TIMESTAMP)

### Step 2: Create Sessions Table

1. In **SQL Editor**, create a new query
2. Copy and paste the contents of `database/sessions-table-schema.sql`
3. Click **Run** to execute the SQL

This will create the `sessions` table with the following fields:
- `id` (UUID, Primary Key)
- `session_token` (TEXT, UNIQUE, NOT NULL) - **Note: This stores SHA256 hashed tokens for security**
- `user_id` (UUID, Foreign Key → users.id)
- `twitter_id` (TEXT)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `last_accessed_at` (TIMESTAMP)

**Important:** Session tokens are automatically hashed with SHA256 before storage. The authentication system handles hashing transparently - you don't need to manually hash tokens when querying.

### Step 3: Verify Tables Were Created

Run this query to verify both tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'sessions');
```

You should see both `users` and `sessions` in the results.

---

## Optional: Grant Access to Test User

If you want to grant immediate access to a specific Twitter user for testing:

```sql
-- Update by Twitter ID
UPDATE users 
SET access_granted = TRUE 
WHERE twitter_id = 'YOUR_TWITTER_ID_HERE';

-- Or update by Twitter username
UPDATE users 
SET access_granted = TRUE 
WHERE twitter_username = 'your_username';
```

---

## Migrating Existing Data (If Applicable)

### If you have existing users in a `waitlist` table:

```sql
-- This is a template - adjust based on your actual schema
INSERT INTO users (
  twitter_id,
  twitter_username,
  wallet_address,
  joined_waitlist,
  access_granted,
  created_at
)
SELECT 
  telegram_id::text AS twitter_id,  -- Replace with actual Twitter ID if available
  telegram_username,
  wallet_address,
  TRUE AS joined_waitlist,
  access_granted,
  created_at
FROM waitlist
WHERE twitter_id IS NOT NULL
ON CONFLICT (twitter_id) DO NOTHING;
```

**⚠️ Warning:** This is just a template. Review your existing schema and adjust accordingly.

---

## Environment Variables Checklist

Ensure these environment variables are set in your Replit project:

- ✅ `TWITTER_CLIENT_ID` - Your Twitter OAuth 2.0 Client ID
- ✅ `TWITTER_CLIENT_SECRET` - Your Twitter OAuth 2.0 Client Secret
- ✅ `NEXTAUTH_SECRET` - Random secret for session encryption
- ✅ `NEXTAUTH_URL` - Your app's URL (https://broadcall.xyz)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- ✅ `SUPABASE_SERVICE_KEY` - Supabase service role key (optional, for admin operations)
- ✅ `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- ✅ `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your Telegram bot username (without @)

---

## Twitter Developer Portal Configuration

Make sure your Twitter App is configured with:

1. **OAuth 2.0 Settings:**
   - Type: Web App
   - Callback URL: `https://broadcall.xyz/api/auth/twitter/callback`
   - Website URL: `https://broadcall.xyz`

2. **Required Scopes:**
   - `tweet.read`
   - `users.read`
   - `offline.access`

3. **User Authentication Settings:**
   - Request email address: No (Twitter OAuth 2.0 doesn't provide emails)

---

## Testing the Migration

After running the SQL migrations:

1. Visit your app at `https://broadcall.xyz`
2. Click "Login with X (Twitter)"
3. Complete the OAuth flow
4. Connect your Telegram account
5. Verify you're on the waitlist confirmation page

Check the database:

```sql
-- View all users
SELECT id, twitter_username, twitter_name, telegram_id, joined_waitlist, access_granted
FROM users
ORDER BY created_at DESC;

-- View active sessions
SELECT session_token, user_id, expires_at, created_at
FROM sessions
WHERE expires_at > NOW()
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Users table already exists?

If you get an error that the table already exists:

```sql
-- Drop and recreate (⚠️ WARNING: This deletes all user data!)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run the schema files again
```

### Session not persisting?

Check your cookie settings match your environment:
- Development: `secure: false`
- Production: `secure: true` (requires HTTPS)

### Twitter OAuth errors?

1. Verify callback URL matches exactly in Twitter Developer Portal
2. Check `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are correct
3. Ensure your app URL uses HTTPS in production

---

## Rollback Plan

If you need to rollback to the old system:

```sql
-- Backup new tables first
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE sessions_backup AS SELECT * FROM sessions;

-- Drop new tables
DROP TABLE sessions CASCADE;
DROP TABLE users CASCADE;

-- Restore from backup if needed
CREATE TABLE users AS SELECT * FROM users_backup;
CREATE TABLE sessions AS SELECT * FROM sessions_backup;
```

---

## Support

If you encounter issues:
1. Check the Supabase dashboard for SQL errors
2. Review the browser console for client-side errors
3. Check server logs for OAuth flow errors
4. Verify all environment variables are set correctly

---

**Ready to migrate? Start with Step 1 above!**
