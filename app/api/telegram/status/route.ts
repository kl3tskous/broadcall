import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telegram_id = searchParams.get('telegram_id')

    if (!telegram_id) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_id, telegram_username, alias, wallet_address')
      .eq('telegram_id', parseInt(telegram_id))
      .single()

    if (error || !profile) {
      return NextResponse.json({
        connected: false,
      })
    }

    return NextResponse.json({
      connected: true,
      telegram_username: profile.telegram_username,
      alias: profile.alias,
      wallet_address: profile.wallet_address,
    })
  } catch (error) {
    console.error('Error in status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
