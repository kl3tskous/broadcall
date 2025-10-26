import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Direct PostgreSQL connection (bypasses PostgREST cache)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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

    // Use direct PostgreSQL to bypass PostgREST schema cache
    const query = `
      INSERT INTO user_settings (
        wallet_address,
        gmgn_ref,
        axiom_ref,
        photon_ref,
        bullx_ref,
        trojan_ref,
        trades_in_name,
        trades_in_image,
        onboarded,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (wallet_address) 
      DO UPDATE SET
        gmgn_ref = EXCLUDED.gmgn_ref,
        axiom_ref = EXCLUDED.axiom_ref,
        photon_ref = EXCLUDED.photon_ref,
        bullx_ref = EXCLUDED.bullx_ref,
        trojan_ref = EXCLUDED.trojan_ref,
        trades_in_name = EXCLUDED.trades_in_name,
        trades_in_image = EXCLUDED.trades_in_image,
        onboarded = EXCLUDED.onboarded,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      wallet_address,
      gmgn_ref || null,
      axiom_ref || null,
      photon_ref || null,
      bullx_ref || null,
      trojan_ref || null,
      trades_in_name || null,
      trades_in_image || null,
      true
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error: any) {
    console.error('API error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
