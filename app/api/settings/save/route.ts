import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wallet_address,
      gmgn_ref,
      axiom_ref,
      photon_ref,
      bullx_ref,
      trojan_ref,
      trades_in_name,
      trades_in_image
    } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Create client with service key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert settings
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          wallet_address,
          gmgn_ref: gmgn_ref || null,
          axiom_ref: axiom_ref || null,
          photon_ref: photon_ref || null,
          bullx_ref: bullx_ref || null,
          trojan_ref: trojan_ref || null,
          trades_in_name: trades_in_name || null,
          trades_in_image: trades_in_image || null,
          onboarded: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'wallet_address' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving settings:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
