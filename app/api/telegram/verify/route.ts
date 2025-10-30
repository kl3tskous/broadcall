import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: NextRequest) {
  try {
    const { token, telegram_id, telegram_username } = await request.json()

    if (!token || !telegram_id || !telegram_username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Check if token exists and is valid
      const tokenResult = await client.query(
        `SELECT user_id, expires_at 
         FROM telegram_connection_tokens 
         WHERE token = $1`,
        [token]
      )

      if (tokenResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 400 }
        )
      }

      const tokenData = tokenResult.rows[0]

      const expiresAt = new Date(tokenData.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 400 }
        )
      }

      // First, clear any existing Telegram ID to prevent conflicts
      await client.query(
        `UPDATE users 
         SET telegram_id = NULL, 
             telegram_username = NULL
         WHERE telegram_id = $1 AND id != $2`,
        [telegram_id.toString(), tokenData.user_id]
      )

      // Update user with Telegram info and mark as joined waitlist
      await client.query(
        `UPDATE users 
         SET telegram_id = $1, 
             telegram_username = $2, 
             joined_waitlist = true,
             updated_at = NOW()
         WHERE id = $3`,
        [telegram_id.toString(), telegram_username, tokenData.user_id]
      )

      // Delete the used token
      await client.query(
        `DELETE FROM telegram_connection_tokens WHERE token = $1`,
        [token]
      )

      // Get user info
      const userResult = await client.query(
        `SELECT twitter_name, twitter_username FROM users WHERE id = $1`,
        [tokenData.user_id]
      )

      const user = userResult.rows[0]

      return NextResponse.json({
        success: true,
        twitter_name: user?.twitter_name || 'User',
        twitter_username: user?.twitter_username || 'user',
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error in verify:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
