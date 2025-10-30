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
        { error: 'Not authenticated. Please log in.' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Hash the session token to match database
    const { createHash } = require('crypto')
    const hashedToken = createHash('sha256').update(sessionToken).digest('hex')

    // Fetch session from database
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_token', hashedToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      )
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', hashedToken)
      
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
    }

    const userId = session.user_id

    // Fetch user and check access
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.access_granted) {
      return NextResponse.json(
        { error: 'Access not granted yet. You are on the waitlist - we will notify you when access is granted.' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { token_address, thesis } = body

    if (!token_address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      )
    }

    // Fetch token data from DexScreener
    let tokenData
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token_address}`)
      const data = await response.json()
      
      if (!data.pairs || data.pairs.length === 0) {
        return NextResponse.json(
          { error: 'Token not found on DexScreener' },
          { status: 404 }
        )
      }

      // Get the pair with highest liquidity
      const pair = data.pairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0]

      tokenData = {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        logo: pair.info?.imageUrl || '',
        price: parseFloat(pair.priceUsd || '0'),
        marketCap: parseInt(pair.fdv || '0'),
        dexscreenerUrl: `https://dexscreener.com/solana/${token_address}`,
      }
    } catch (error) {
      console.error('DexScreener fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch token data' },
        { status: 500 }
      )
    }

    // Store call in database
    const pool = getPool()
    const result = await pool.query(
      `INSERT INTO calls (
        creator_wallet, 
        token_address, 
        token_name, 
        token_symbol, 
        token_logo, 
        initial_price, 
        initial_mcap, 
        thesis, 
        platform,
        current_price,
        current_mcap,
        ath_price,
        ath_mcap,
        first_shared_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id, created_at`,
      [
        user.twitter_username, // Use Twitter username as creator identifier
        token_address,
        tokenData.name,
        tokenData.symbol,
        tokenData.logo,
        tokenData.price,
        tokenData.marketCap,
        thesis || '',
        'BroadCall',
        tokenData.price,
        tokenData.marketCap,
        tokenData.price,
        tokenData.marketCap,
      ]
    )

    const callId = result.rows[0].id
    const createdAt = result.rows[0].created_at

    // Trigger broadcast to Telegram channels
    try {
      console.log('Triggering broadcast for call:', callId)
      const backendUrl = (process.env.BACKEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000').replace(/\/$/, '')
      const broadcastResponse = await fetch(`${backendUrl}/api/telegram/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          call_id: callId,
        }),
      })

      const broadcastResult = await broadcastResponse.json()
      if (!broadcastResponse.ok) {
        console.error('Broadcast failed:', broadcastResult)
      } else {
        console.log('Broadcast successful:', broadcastResult)
      }
    } catch (error) {
      console.error('Broadcast trigger error:', error)
      // Don't fail the call creation if broadcast fails
    }

    return NextResponse.json({
      success: true,
      call: {
        id: callId,
        token_address,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_logo: tokenData.logo,
        price_at_call: tokenData.price,
        market_cap_at_call: tokenData.marketCap,
        thesis,
        dexscreener_url: tokenData.dexscreenerUrl,
        created_at: createdAt,
      },
    })
  } catch (error: any) {
    console.error('Create call error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    })
    return NextResponse.json(
      { 
        error: 'Failed to create call',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
