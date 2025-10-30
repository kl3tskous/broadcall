import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    // Add the missing columns
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
      ADD COLUMN IF NOT EXISTS custom_profile_image TEXT,
      ADD COLUMN IF NOT EXISTS custom_banner_image TEXT;
    `)

    await pool.end()

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added image columns to users table' 
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run migration' },
      { status: 500 }
    )
  }
}
