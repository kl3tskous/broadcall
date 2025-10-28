import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { PublicKey } from '@solana/web3.js';

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address } = body;

    // Validate wallet address
    if (!wallet_address || typeof wallet_address !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid wallet address' },
        { status: 400 }
      );
    }

    // Validate Solana address format
    if (!isValidSolanaAddress(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address format' },
        { status: 400 }
      );
    }

    // Insert into waitlist with pending status
    const query = `
      INSERT INTO waitlist (wallet_address, status)
      VALUES ($1, 'pending')
      RETURNING *;
    `;

    const result = await pool.query(query, [wallet_address]);

    return NextResponse.json({
      success: true,
      message: 'Wallet added to waitlist. Please verify via Telegram.',
      data: result.rows[0]
    });

  } catch (error: any) {
    // Handle duplicate wallet address
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This wallet is already on the waitlist!' },
        { status: 409 }
      );
    }

    console.error('Waitlist signup error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      error_stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to join waitlist. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
