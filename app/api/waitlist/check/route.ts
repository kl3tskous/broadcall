import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ onWaitlist: false });
    }

    const query = 'SELECT * FROM waitlist WHERE wallet_address = $1';
    const result = await pool.query(query, [wallet]);

    return NextResponse.json({
      onWaitlist: result.rows.length > 0,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('Waitlist check error:', error);
    return NextResponse.json({ onWaitlist: false });
  }
}
