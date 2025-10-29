import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookie = serialize('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookie);
  
  return response;
}
