import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, alias, avatar_url, banner_url, twitter_handle, bio, telegram, website } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Create client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use RPC to save profile (bypasses schema cache)
    const { data, error } = await supabase.rpc('upsert_profile_data', {
      p_wallet_address: wallet_address,
      p_alias: alias || null,
      p_avatar_url: avatar_url || null,
      p_banner_url: banner_url || null,
      p_twitter_handle: twitter_handle || null,
      p_bio: bio || null,
      p_telegram: telegram || null,
      p_website: website || null
    });

    if (error) throw error;

    // RPC returns an array, get first item
    const profileData = Array.isArray(data) && data.length > 0 ? data[0] : null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}
