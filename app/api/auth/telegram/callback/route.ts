import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, createHash } from 'crypto'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const botToken = process.env.TELEGRAM_BOT_TOKEN || ''

/**
 * Telegram OAuth Callback Handler
 * 
 * Verifies Telegram login data, links it to the user's account,
 * and sets joined_waitlist = true
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Get Telegram data from URL params
    const telegramData: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      telegramData[key] = value
    })

    // Verify Telegram authentication
    if (!verifyTelegramAuth(telegramData)) {
      console.error('Invalid Telegram authentication data')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/connect-telegram?error=invalid_telegram_auth`)
    }

    // Get current user session
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('broadCall_session')?.value

    if (!sessionToken) {
      console.error('No session token found')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=not_authenticated`)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Hash the session token to match what's stored in database
    const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

    // Get session using hashed token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_token', hashedToken)
      .single()

    if (sessionError || !session) {
      console.error('Session not found:', sessionError)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=invalid_session`)
    }

    // Update user with Telegram data and set joined_waitlist = true
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        telegram_id: telegramData.id,
        telegram_username: telegramData.username || null,
        joined_waitlist: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user_id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update user:', updateError)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/connect-telegram?error=update_failed`)
    }

    // Redirect to waitlist confirmation page
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/waitlist-confirmed`)
    
  } catch (error: any) {
    console.error('Telegram callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/connect-telegram?error=callback_failed`)
  }
}

// Helper function to verify Telegram authentication (Login Widget spec)
function verifyTelegramAuth(data: Record<string, string>): boolean {
  const hash = data.hash
  if (!hash) return false

  // Check auth_date freshness (must be within 24 hours)
  const authDate = parseInt(data.auth_date || '0')
  const now = Math.floor(Date.now() / 1000)
  const maxAge = 24 * 60 * 60 // 24 hours in seconds
  
  if (!authDate || now - authDate > maxAge) {
    console.error('Telegram auth_date is missing or expired')
    return false
  }

  // Create data check string (sorted keys, excluding hash)
  const keys = Object.keys(data).filter(key => key !== 'hash').sort()
  const dataCheckString = keys.map(key => `${key}=${data[key]}`).join('\n')

  // Calculate secret key using Telegram Login Widget spec
  // For Login Widget: secret = SHA256(bot_token)
  const { createHash } = require('crypto')
  const secretKey = createHash('sha256')
    .update(botToken)
    .digest()

  // Calculate hash using HMAC-SHA256
  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return calculatedHash === hash
}
