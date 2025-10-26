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

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'wallet_address is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        'SELECT * FROM user_settings WHERE wallet_address = $1',
        [walletAddress]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          data: null
        })
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
