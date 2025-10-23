import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

        // Transform data to match expected format (creator_wallet alias)
        const call = result.rows[0]
        const transformedCall = {
          ...call,
          creator_wallet: call.wallet_address
        }

        return NextResponse.json({
          success: true,
          data: transformedCall
        })
      } else {
        // Fetch all calls for a wallet address
        result = await client.query(
          'SELECT * FROM calls WHERE wallet_address = $1 ORDER BY created_at DESC',
          [walletAddress]
        )
        
        // Transform data to match expected format (creator_wallet alias)
        const transformedCalls = result.rows.map(call => ({
          ...call,
          creator_wallet: call.wallet_address
        }))
        
        return NextResponse.json({
          success: true,
          data: transformedCalls
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
