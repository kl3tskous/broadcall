import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { wallet_address } = await request.json()

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    
    const { error } = await supabase
      .from('telegram_connection_tokens')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        token,
      })

    if (error) {
      console.error('Error creating token:', error)
      return NextResponse.json(
        { error: 'Failed to generate token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error in generate-token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
