import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json(
      { hasAccess: false, error: 'Wallet address required' },
      { status: 400 }
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const query = 'SELECT access_granted, status FROM waitlist WHERE wallet_address = $1';
    const result = await pool.query(query, [wallet]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        hasAccess: false,
        onWaitlist: false,
        message: 'Wallet not found'
      });
    }

    const user = result.rows[0];
    const hasAccess = user.access_granted === true;

    return NextResponse.json({
      hasAccess,
      onWaitlist: true,
      status: user.status,
      message: hasAccess 
        ? 'Access granted' 
        : 'You are on the waitlist. Access will be granted soon.'
    });

  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { hasAccess: false, error: 'Failed to check access' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
