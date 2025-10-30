import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Get Current Authenticated User
 * 
 * This endpoint checks the session cookie and returns the current user's data.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('broadCall_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Hash the session token to match what's stored in database
    const { createHash } = require('crypto')
    const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

    // Fetch session from database using hashed token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_token', hashedToken)
      .single()

    if (sessionError || !session) {
      // Invalid session - clear cookie
      cookieStore.delete('broadCall_session')
      return NextResponse.json(
        { error: 'Invalid session', authenticated: false },
        { status: 401 }
      )
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      // Session expired - delete it and clear cookie (use hashed token)
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', hashedToken)
      
      cookieStore.delete('broadCall_session')
      
      return NextResponse.json(
        { error: 'Session expired', authenticated: false },
        { status: 401 }
      )
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 404 }
      )
    }

    // Update last accessed timestamp (use hashed token)
    await supabase
      .from('sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('session_token', hashedToken)

    // Return user data (exclude sensitive fields)
    const userData = {
      id: user.id,
      twitter_id: user.twitter_id,
      twitter_username: user.twitter_username,
      twitter_name: user.twitter_name,
      profile_image_url: user.profile_image_url,
      banner_image_url: user.banner_image_url || null,
      custom_profile_image: user.custom_profile_image || null,
      custom_banner_image: user.custom_banner_image || null,
      bio: user.bio,
      telegram_id: user.telegram_id,
      telegram_username: user.telegram_username,
      wallet_address: user.wallet_address,
      joined_waitlist: user.joined_waitlist,
      access_granted: user.access_granted,
      created_at: user.created_at,
      last_login_at: user.last_login_at
    }

    return NextResponse.json({
      authenticated: true,
      user: userData
    })
    
  } catch (error: any) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    )
  }
}
