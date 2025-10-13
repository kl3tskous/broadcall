import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Create client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use raw SQL to bypass schema cache completely
    const { data, error } = await supabase.rpc('get_profile_data', {
      p_wallet_address: wallet_address
    });

    if (error) {
      console.error('RPC error:', error);
      // Return empty data if profile not found
      return NextResponse.json({ success: true, data: null });
    }

    // RPC returns an array, get first item
    const profileData = Array.isArray(data) && data.length > 0 ? data[0] : null;
    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
