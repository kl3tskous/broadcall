import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Twitter OAuth 2.0 - Callback Handler
 * 
 * This endpoint receives the authorization code from Twitter,
 * exchanges it for access tokens, fetches user profile data,
 * and stores it in Supabase.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Twitter OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=twitter_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=missing_code`)
    }

    // Verify state parameter (CSRF protection)
    const cookieStore = cookies()
    const storedState = cookieStore.get('twitter_oauth_state')?.value
    
    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { storedState, receivedState: state })
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=invalid_state`)
    }

    // Get code verifier from cookie
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value
    
    if (!codeVerifier) {
      console.error('Code verifier not found in cookies')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=missing_verifier`)
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, codeVerifier)
    
    if (!tokenData || !tokenData.access_token) {
      console.error('Failed to get access token')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=token_exchange_failed`)
    }

    // Fetch user profile from Twitter API
    const userProfile = await fetchTwitterUserProfile(tokenData.access_token)
    
    if (!userProfile) {
      console.error('Failed to fetch user profile')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=profile_fetch_failed`)
    }

    // Store user data in Supabase
    const user = await upsertUserInSupabase(userProfile, tokenData)
    
    if (!user) {
      console.error('Failed to store user in database')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=database_error`)
    }

    // Create session token (unhashed, will be hashed before storage)
    const sessionToken = generateSessionToken()
    
    // Store session in HTTP-only cookie (store unhashed version in cookie)
    // IMPORTANT: Replit always uses HTTPS, so always set secure: true
    // SameSite=Lax is needed for mobile Safari compatibility
    cookieStore.set('broadCall_session', sessionToken, {
      httpOnly: true,
      secure: true, // Always true on Replit (HTTPS)
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    // Store session with hashed token for security
    await storeSession(sessionToken, user.id, user.twitter_id)

    // Clean up OAuth cookies
    cookieStore.delete('twitter_code_verifier')
    cookieStore.delete('twitter_oauth_state')

    // Redirect to Connect Telegram screen
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/connect-telegram`)
    
  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=callback_failed`)
  }
}

// Helper Functions

async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const tokenUrl = 'https://api.twitter.com/2/oauth2/token'
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`
  
  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  })

  // Basic Auth with client_id:client_secret
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token exchange failed:', response.status, errorText)
    return null
  }

  return await response.json()
}

async function fetchTwitterUserProfile(accessToken: string) {
  const userUrl = 'https://api.twitter.com/2/users/me'
  const params = new URLSearchParams({
    'user.fields': 'id,username,name,profile_image_url,description,created_at,profile_banner_url'
  })

  const response = await fetch(`${userUrl}?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Profile fetch failed:', response.status, errorText)
    return null
  }

  const data = await response.json()
  return data.data
}

async function upsertUserInSupabase(twitterProfile: any, tokenData: any) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Calculate token expiration time
  const expiresAt = new Date()
  expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 7200))

  const userData = {
    twitter_id: twitterProfile.id,
    twitter_username: twitterProfile.username,
    twitter_name: twitterProfile.name,
    profile_image_url: twitterProfile.profile_image_url?.replace('_normal', '_400x400') || null,
    banner_image_url: twitterProfile.profile_banner_url || null,
    bio: twitterProfile.description || null,
    twitter_access_token: tokenData.access_token,
    twitter_refresh_token: tokenData.refresh_token || null,
    twitter_token_expires_at: expiresAt.toISOString(),
    last_login_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, {
      onConflict: 'twitter_id',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase upsert error:', error)
    return null
  }

  return data
}

async function storeSession(sessionToken: string, userId: string, twitterId: string) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Hash the session token before storing for security
  const { createHash } = require('crypto')
  const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

  // Store hashed token in database
  const { error } = await supabase
    .from('sessions')
    .upsert({
      session_token: hashedToken,
      user_id: userId,
      twitter_id: twitterId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }, {
      onConflict: 'session_token'
    })

  if (error) {
    console.error('Session storage error:', error)
  }
}

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
