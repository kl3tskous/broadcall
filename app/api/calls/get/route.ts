import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('id')
    const walletAddress = searchParams.get('wallet_address')

    if (!callId && !walletAddress) {
      return NextResponse.json(
        { error: 'Either id or wallet_address is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      let result
      
      if (callId) {
        // Fetch single call by ID
        result = await client.query(
          'SELECT * FROM calls WHERE id = $1',
          [callId]
        )
        
        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Call not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: result.rows[0]
        })
      } else {
        // Fetch all calls for a wallet address
        result = await client.query(
          'SELECT * FROM calls WHERE creator_wallet = $1 ORDER BY created_at DESC',
          [walletAddress]
        )
        
        return NextResponse.json({
          success: true,
          data: result.rows
        })
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
