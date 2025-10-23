import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
        `SELECT wallet_address, expires_at, used 
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

      if (tokenData.used) {
        return NextResponse.json(
          { error: 'Token already used' },
          { status: 400 }
        )
      }

      const expiresAt = new Date(tokenData.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 400 }
        )
      }

      // Update profile with Telegram info
      await client.query(
        `UPDATE profiles 
         SET telegram_id = $1, telegram_username = $2, updated_at = NOW()
         WHERE wallet_address = $3`,
        [telegram_id, telegram_username, tokenData.wallet_address]
      )

      // Mark token as used
      await client.query(
        `UPDATE telegram_connection_tokens 
         SET used = true 
         WHERE token = $1`,
        [token]
      )

      // Get profile alias
      const profileResult = await client.query(
        `SELECT alias FROM profiles WHERE wallet_address = $1`,
        [tokenData.wallet_address]
      )

      const alias = profileResult.rows[0]?.alias || 'Anonymous'

      return NextResponse.json({
        success: true,
        alias,
        wallet_address: tokenData.wallet_address,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in verify:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
