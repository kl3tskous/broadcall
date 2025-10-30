import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic'

// Use direct PostgreSQL connection to bypass Supabase PostgREST schema cache issues
// PostgREST schema cache doesn't update automatically when columns are added
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Query PostgreSQL directly - joins with users table to get custom images
    // Custom images override default images if they're set
    const result = await pool.query(
      `SELECT 
        p.*,
        COALESCE(u.custom_profile_image, p.avatar_url, u.profile_image_url) as avatar_url,
        COALESCE(u.custom_banner_image, p.banner_url, u.banner_image_url) as banner_url
      FROM profiles p
      LEFT JOIN users u ON u.twitter_username = p.wallet_address
      WHERE p.wallet_address = $1`,
      [wallet_address]
    );

    const profileData = result.rows[0] || null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
