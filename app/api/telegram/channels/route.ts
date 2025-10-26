import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')
    const signature = request.headers.get('x-wallet-signature')
    const messageBase64 = request.headers.get('x-wallet-message')
    
    // Decode base64 message
    const message = messageBase64 ? Buffer.from(messageBase64, 'base64').toString('utf-8') : null

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Require authentication for channel access
    if (!signature || !message) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the signature matches the wallet address
    try {
      const { PublicKey } = await import('@solana/web3.js')
      const nacl = await import('tweetnacl')
      const bs58 = await import('bs58')
      
      const publicKey = new PublicKey(walletAddress)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = bs58.default.decode(signature)

      const verified = nacl.default.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      )

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      // Verify message contains the wallet address (prevents signature reuse)
      if (!message.includes(walletAddress)) {
        return NextResponse.json(
          { error: 'Invalid message' },
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
      const result = await client.query(
        `SELECT id, channel_id, channel_name, channel_username, enabled, created_at as added_at
         FROM telegram_channels
         WHERE wallet_address = $1
         ORDER BY created_at DESC`,
        [walletAddress]
      )

      return NextResponse.json({
        channels: result.rows,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
