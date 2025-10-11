import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, alias, avatar_url, banner_url, twitter_handle } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Use raw SQL to bypass schema cache issues
    const { data, error } = await supabase.rpc('upsert_profile', {
      p_wallet_address: wallet_address,
      p_alias: alias || null,
      p_avatar_url: avatar_url || null,
      p_banner_url: banner_url || null,
      p_twitter_handle: twitter_handle || null
    });

    if (error) {
      console.error('Profile save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}
