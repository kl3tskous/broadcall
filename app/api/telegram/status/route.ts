import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Use direct PostgreSQL connection to bypass Supabase PostgREST schema cache
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telegram_id = searchParams.get('telegram_id')

    if (!telegram_id) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Query PostgreSQL directly to avoid Supabase PostgREST cache
    const result = await pool.query(
      `SELECT telegram_id, telegram_username, alias, wallet_address 
       FROM profiles 
       WHERE telegram_id = $1`,
      [parseInt(telegram_id)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        connected: false,
      })
    }

    const profile = result.rows[0]
    return NextResponse.json({
      connected: true,
      telegram_username: profile.telegram_username,
      alias: profile.alias,
      wallet_address: profile.wallet_address,
    })
  } catch (error) {
    console.error('Error in status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
