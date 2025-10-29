import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { serialize } from 'cookie';

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...authData } = data;
  
  const checkString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key as keyof typeof authData]}`)
    .join('\n');
  
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  
  return hmac === hash;
}

export async function POST(request: NextRequest) {
  try {
    const data: TelegramAuthData = await request.json();
    
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      );
    }

    // Verify the hash
    const isValid = verifyTelegramAuth(data, BOT_TOKEN);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      );
    }

    // Check auth_date freshness (reject if older than 24 hours)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours
    
    if (now - data.auth_date > maxAge) {
      return NextResponse.json(
        { error: 'Authentication data expired' },
        { status: 401 }
      );
    }

    // Create or update user in database
    const query = `
      INSERT INTO broadcall_users (
        telegram_id,
        username,
        first_name,
        last_name,
        profile_photo_url,
        auth_date,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (telegram_id) 
      DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        profile_photo_url = EXCLUDED.profile_photo_url,
        auth_date = EXCLUDED.auth_date,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      data.id,
      data.username || null,
      data.first_name,
      data.last_name || null,
      data.photo_url || null,
      data.auth_date
    ];

    const result = await pool.query(query, values);
    const user = result.rows[0];

    // Create JWT session token
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      telegramId: user.telegram_id,
      username: user.username,
      firstName: user.first_name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Create HTTP-only cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    const response = NextResponse.json({
      success: true,
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

    response.headers.set('Set-Cookie', cookie);
    
    return response;

  } catch (error: any) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
