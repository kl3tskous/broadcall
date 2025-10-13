import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, alias, avatar_url, banner_url, twitter_handle, bio, telegram, website } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Create client with service key for direct SQL access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, try to get existing profile
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', wallet_address)
      .single();

    let result;
    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          alias: alias || null,
          avatar_url: avatar_url || null,
          banner_url: banner_url || null,
          twitter_handle: twitter_handle || null,
          bio: bio || null,
          telegram: telegram || null,
          website: website || null,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet_address)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address,
          alias: alias || null,
          avatar_url: avatar_url || null,
          banner_url: banner_url || null,
          twitter_handle: twitter_handle || null,
          bio: bio || null,
          telegram: telegram || null,
          website: website || null
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}
