import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { token, telegram_id, telegram_username } = await request.json()

    if (!token || !telegram_id || !telegram_username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('telegram_connection_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_id,
        telegram_username,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', tokenData.wallet_address)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to link Telegram account' },
        { status: 500 }
      )
    }

    await supabase
      .from('telegram_connection_tokens')
      .update({ used: true })
      .eq('token', token)

    const { data: profile } = await supabase
      .from('profiles')
      .select('alias')
      .eq('wallet_address', tokenData.wallet_address)
      .single()

    return NextResponse.json({
      success: true,
      alias: profile?.alias || 'Anonymous',
      wallet_address: tokenData.wallet_address,
    })
  } catch (error) {
    console.error('Error in verify:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
