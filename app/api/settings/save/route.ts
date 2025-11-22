import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: NextRequest) {
  try {
    // Authenticate via session cookie
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('broadCall_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Hash the session token
    const { createHash } = require('crypto')
    const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_token', hashedToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', hashedToken)
      
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const userId = session.user_id

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('twitter_username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      gmgn_ref,
      axiom_ref,
      photon_ref,
      bullx_ref,
      trojan_ref,
      trades_in_name,
      trades_in_image
    } = body

    // Use twitter_username as wallet_address for settings
    const wallet_address = user.twitter_username

    const query = `
      INSERT INTO user_settings (
        wallet_address,
        gmgn_ref,
        axiom_ref,
        photon_ref,
        bullx_ref,
        trojan_ref,
        trades_in_name,
        trades_in_image,
        onboarded,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (wallet_address) 
      DO UPDATE SET
        gmgn_ref = EXCLUDED.gmgn_ref,
        axiom_ref = EXCLUDED.axiom_ref,
        photon_ref = EXCLUDED.photon_ref,
        bullx_ref = EXCLUDED.bullx_ref,
        trojan_ref = EXCLUDED.trojan_ref,
        trades_in_name = EXCLUDED.trades_in_name,
        trades_in_image = EXCLUDED.trades_in_image,
        onboarded = EXCLUDED.onboarded,
        updated_at = NOW()
      RETURNING *;
    `

    const values = [
      wallet_address,
      gmgn_ref || null,
      axiom_ref || null,
      photon_ref || null,
      bullx_ref || null,
      trojan_ref || null,
      trades_in_name || null,
      trades_in_image || null,
      true
    ]

    const pool = getPool()
    const result = await pool.query(query, values)

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    })
  } catch (error: any) {
    console.error('API error saving settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}
