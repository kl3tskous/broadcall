import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function PUT(request: NextRequest) {
  try {
    const { channel_id, wallet_address, enabled, signature, message } = await request.json()

    if (!channel_id || !wallet_address || enabled === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Require authentication
    if (!signature || !message) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the signature
    try {
      const { PublicKey } = await import('@solana/web3.js')
      const nacl = await import('tweetnacl')
      const bs58 = await import('bs58')
      
      const publicKey = new PublicKey(wallet_address)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = bs58.default.decode(signature)

      const verified = nacl.default.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      )

      if (!verified || !message.includes(wallet_address)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      // Verify the channel ID is bound to the signature (prevents cross-channel replay)
      const expectedChannelText = `Channel: ${channel_id}`
      if (!message.includes(expectedChannelText)) {
        return NextResponse.json(
          { error: 'Signature does not match channel' },
          { status: 401 }
        )
      }

      // Verify the enabled state is bound to the signature
      const expectedEnabledText = enabled ? 'Enable: true' : 'Enable: false'
      if (!message.includes(expectedEnabledText)) {
        return NextResponse.json(
          { error: 'Signature does not match action' },
          { status: 401 }
        )
      }

      // Verify timestamp freshness (reject signatures older than 5 minutes)
      const timestampMatch = message.match(/Timestamp: (\d+)/)
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1])
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        if (now - timestamp > fiveMinutes) {
          return NextResponse.json(
            { error: 'Signature expired' },
            { status: 401 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid message format' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const client = await pool.connect()
    try {
      // Update the channel's enabled status
      const result = await client.query(
        `UPDATE telegram_channels
         SET enabled = $1
         WHERE channel_id = $2 AND wallet_address = $3
         RETURNING id, channel_name, enabled`,
        [enabled, channel_id, wallet_address]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        channel: result.rows[0],
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error toggling channel:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
