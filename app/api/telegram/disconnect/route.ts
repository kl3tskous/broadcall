import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

export async function DELETE(request: NextRequest) {
  try {
    const { telegram_id } = await request.json()

    if (!telegram_id) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('telegram_id', telegram_id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'No connected account found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_id: null,
        telegram_username: null,
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegram_id)

    if (error) {
      console.error('Error disconnecting Telegram:', error)
      return NextResponse.json(
        { error: 'Failed to disconnect Telegram' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in disconnect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
