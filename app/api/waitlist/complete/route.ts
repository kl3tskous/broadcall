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
    const { wallet_address, telegram_user_id, telegram_username } = body;

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

    // Validate Telegram info
    if (!telegram_user_id) {
      return NextResponse.json(
        { error: 'Telegram user ID is required' },
        { status: 400 }
      );
    }

    // Check if wallet exists in waitlist (pending status)
    const checkQuery = 'SELECT * FROM waitlist WHERE wallet_address = $1';
    const checkResult = await pool.query(checkQuery, [wallet_address]);

    if (checkResult.rows.length === 0) {
      // Wallet not found - user needs to connect wallet on website first
      return NextResponse.json(
        { error: 'Wallet not found. Please connect your wallet on BroadCall website first.' },
        { status: 404 }
      );
    }

    const existingEntry = checkResult.rows[0];

    // If already completed, return success (idempotent)
    if (existingEntry.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Already on waitlist!',
        data: existingEntry
      });
    }

    // Complete the waitlist signup
    const updateQuery = `
      UPDATE waitlist 
      SET 
        telegram_user_id = $1,
        telegram_username = $2,
        status = 'completed',
        completed_at = NOW()
      WHERE wallet_address = $3
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      telegram_user_id,
      telegram_username,
      wallet_address
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Waitlist completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete waitlist signup. Please try again.' },
      { status: 500 }
    );
  }
}
