import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function POST(request: NextRequest) {
  try {
    const { wallet_address } = await request.json()

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    
    // Use direct SQL to bypass Supabase schema cache issue
    const client = await pool.connect()
    try {
      await client.query(
        `INSERT INTO telegram_connection_tokens (wallet_address, token, created_at, expires_at)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '10 minutes')`,
        [wallet_address.toLowerCase(), token]
      )
    } finally {
      client.release()
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error in generate-token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
