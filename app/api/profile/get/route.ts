import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Use DATABASE_URL for direct PostgreSQL connection (bypasses Supabase PostgREST cache)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Query directly from PostgreSQL database, bypassing Supabase PostgREST completely
    const result = await pool.query(
      `SELECT 
        id, wallet_address, alias, avatar_url, banner_url, 
        twitter_handle, bio, telegram, website, 
        created_at, updated_at, telegram_id, telegram_username
      FROM profiles 
      WHERE wallet_address = $1`,
      [wallet_address]
    );

    const profileData = result.rows[0] || null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
