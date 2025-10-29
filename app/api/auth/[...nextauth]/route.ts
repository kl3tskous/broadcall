import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { Pool } from 'pg';

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // Use OAuth 2.0
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      try {
        // Twitter OAuth 2.0 profile structure
        const twitterProfile = profile as any;
        
        // Extract Twitter data
        const twitter_id = user.id || twitterProfile.data?.id;
        const twitter_username = twitterProfile.data?.username || user.name?.replace('@', '');
        const twitter_name = twitterProfile.data?.name || user.name;
        const profile_image_url = twitterProfile.data?.profile_image_url || user.image;
        const bio = twitterProfile.data?.description || '';

        // Banner image URL (if available from expanded profile)
        const banner_image_url = twitterProfile.data?.profile_banner_url || null;

        // Upsert user in database
        const query = `
          INSERT INTO broadcall_users (
            twitter_id,
            twitter_username,
            twitter_name,
            profile_image_url,
            banner_image_url,
            bio,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (twitter_id) 
          DO UPDATE SET
            twitter_username = EXCLUDED.twitter_username,
            twitter_name = EXCLUDED.twitter_name,
            profile_image_url = EXCLUDED.profile_image_url,
            banner_image_url = EXCLUDED.banner_image_url,
            bio = EXCLUDED.bio,
            updated_at = NOW()
          RETURNING *;
        `;

        const values = [
          twitter_id,
          twitter_username,
          twitter_name,
          profile_image_url,
          banner_image_url,
          bio
        ];

        await pool.query(query, values);
        return true;
      } catch (error) {
        console.error('Error saving user to database:', error);
        return false;
      }
    },
    async session({ session, token }) {
      // Fetch user data from our database
      try {
        const result = await pool.query(
          'SELECT * FROM broadcall_users WHERE twitter_id = $1',
          [token.sub]
        );

        if (result.rows.length > 0) {
          const dbUser = result.rows[0];
          session.user = {
            ...session.user,
            id: dbUser.id,
            twitter_id: dbUser.twitter_id,
            twitter_username: dbUser.twitter_username,
            twitter_name: dbUser.twitter_name,
            profile_image_url: dbUser.profile_image_url,
            banner_image_url: dbUser.banner_image_url,
            bio: dbUser.bio,
            telegram_id: dbUser.telegram_id,
            telegram_username: dbUser.telegram_username,
            wallet_address: dbUser.wallet_address,
            joined_waitlist: dbUser.joined_waitlist,
          };
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
      }

      return session;
    },
  },
  pages: {
    signIn: '/',  // Redirect to landing page for sign in
    error: '/',   // Redirect to landing page on error
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
