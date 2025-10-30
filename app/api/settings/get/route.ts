import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(request: NextRequest) {
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

    // Fetch settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('wallet_address', user.twitter_username)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError
    }

    return NextResponse.json({
      success: true,
      settings: settings || null
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
