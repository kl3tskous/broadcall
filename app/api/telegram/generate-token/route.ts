import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: NextRequest) {
  try {
    // Get session from cookies
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Hash the session token for lookup
    const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex')

    // Get user from session
    const sessionResult = await pool.query(
      'SELECT user_id FROM sessions WHERE session_token = $1 AND expires_at > NOW()',
      [hashedToken]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const userId = sessionResult.rows[0].user_id
    const token = crypto.randomBytes(32).toString('hex')
    
    // Store connection token (5 minute expiry)
    const client = await pool.connect()
    try {
      await client.query(
        `INSERT INTO telegram_connection_tokens (user_id, token, created_at, expires_at)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '5 minutes')
         ON CONFLICT (user_id) DO UPDATE SET
           token = $2,
           created_at = NOW(),
           expires_at = NOW() + INTERVAL '5 minutes'`,
        [userId, token]
      )
    } finally {
      client.release()
    }

    return NextResponse.json({ 
      token,
      bot_url: `https://t.me/Broadcall_Bot?start=${token}`
    })
  } catch (error) {
    console.error('Error in generate-token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
