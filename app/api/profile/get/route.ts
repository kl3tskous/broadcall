import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic'

// Use direct PostgreSQL connection to bypass Supabase PostgREST schema cache issues
// PostgREST schema cache doesn't update automatically when columns are added

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Query PostgreSQL directly - joins with users table to get custom images
    // Custom images override default images if they're set
    // Priority: custom uploads > profile table > twitter defaults
    const pool = getPool()
    const result = await pool.query(
      `SELECT 
        COALESCE(p.wallet_address, u.wallet_address) as wallet_address,
        COALESCE(p.alias, u.twitter_name, u.twitter_username) as alias,
        COALESCE(p.bio, u.bio) as bio,
        COALESCE(
          NULLIF(u.custom_profile_image, ''),
          NULLIF(p.avatar_url, ''),
          NULLIF(u.profile_image_url, '')
        ) as avatar_url,
        COALESCE(
          NULLIF(u.custom_banner_image, ''),
          NULLIF(p.banner_url, ''),
          NULLIF(u.banner_image_url, '')
        ) as banner_url,
        p.twitter_handle,
        p.telegram,
        p.website,
        p.created_at,
        p.updated_at
      FROM users u
      LEFT JOIN profiles p ON p.wallet_address = u.wallet_address OR p.wallet_address = u.twitter_username
      WHERE u.wallet_address = $1 OR u.twitter_username = $1`,
      [wallet_address]
    );

    const profileData = result.rows[0] || null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
