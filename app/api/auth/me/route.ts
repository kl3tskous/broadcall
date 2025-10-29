import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth-token');
    
    if (!cookie || !cookie.value) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(cookie.value, secret);

    // Fetch latest user data from database
    const result = await pool.query(
      'SELECT * FROM broadcall_users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePhotoUrl: user.profile_photo_url,
        walletAddress: user.wallet_address
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
