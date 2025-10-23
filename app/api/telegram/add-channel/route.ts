import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { telegram_id, channel_id, channel_name, channel_username } = await request.json()

    if (!telegram_id || !channel_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Verify the user has a BroadCall profile
      const profileResult = await client.query(
        `SELECT wallet_address, alias FROM profiles WHERE telegram_id = $1`,
        [telegram_id]
      )

      if (profileResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'User does not have a connected BroadCall account' },
          { status: 404 }
        )
      }

      const walletAddress = profileResult.rows[0].wallet_address
      const alias = profileResult.rows[0].alias

      // Check if channel already exists
      const existingChannel = await client.query(
        `SELECT id FROM telegram_channels WHERE channel_id = $1`,
        [channel_id]
      )

      if (existingChannel.rows.length > 0) {
        return NextResponse.json(
          { error: 'Channel already connected', alias },
          { status: 409 }
        )
      }

      // Add the channel
      await client.query(
        `INSERT INTO telegram_channels (wallet_address, telegram_id, channel_id, channel_name, channel_username, enabled)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [walletAddress, telegram_id, channel_id, channel_name, channel_username]
      )

      return NextResponse.json({
        success: true,
        alias,
        wallet_address: walletAddress,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in add-channel:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
