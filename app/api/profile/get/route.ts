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

    // Query PostgreSQL directly - ensures all columns are returned
    const result = await pool.query(
      'SELECT * FROM profiles WHERE wallet_address = $1',
      [wallet_address]
    );

    const profileData = result.rows[0] || null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
