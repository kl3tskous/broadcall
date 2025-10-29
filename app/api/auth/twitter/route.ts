import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * Twitter OAuth 2.0 - Initiate Authentication
 * 
 * This endpoint redirects the user to Twitter's OAuth 2.0 authorization page.
 * Uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`

    if (!clientId) {
      return NextResponse.json(
        { error: 'Twitter OAuth not configured' },
        { status: 500 }
      )
    }

    // Generate code verifier and challenge for PKCE
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    // Generate random state for CSRF protection
    const state = generateRandomString(32)

    // Store code verifier and state in HTTP-only cookies
    const cookieStore = cookies()
    cookieStore.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })
    cookieStore.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Build Twitter OAuth URL
    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize')
    twitterAuthUrl.searchParams.set('response_type', 'code')
    twitterAuthUrl.searchParams.set('client_id', clientId)
    twitterAuthUrl.searchParams.set('redirect_uri', redirectUri)
    twitterAuthUrl.searchParams.set('scope', 'tweet.read users.read offline.access')
    twitterAuthUrl.searchParams.set('state', state)
    twitterAuthUrl.searchParams.set('code_challenge', codeChallenge)
    twitterAuthUrl.searchParams.set('code_challenge_method', 'S256')

    // Redirect to Twitter
    return NextResponse.redirect(twitterAuthUrl.toString())
    
  } catch (error: any) {
    console.error('Twitter OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter authentication' },
      { status: 500 }
    )
  }
}

// Helper Functions

function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  
  return result
}

function generateCodeVerifier(): string {
  return generateRandomString(128)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data.buffer)
  
  // Convert hash to base64url
  return base64UrlEncode(hash)
}

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
