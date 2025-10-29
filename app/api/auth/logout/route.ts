import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Logout Endpoint
 * 
 * Clears the session cookie and deletes the session from the database.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('broadCall_session')?.value

    if (sessionToken) {
      // Hash the session token to match what's stored in database
      const { createHash } = require('crypto')
      const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

      // Delete session from database using hashed token
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', hashedToken)
    }

    // Clear session cookie
    cookieStore.delete('broadCall_session')

    return NextResponse.json({ success: true, message: 'Logged out successfully' })
    
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
