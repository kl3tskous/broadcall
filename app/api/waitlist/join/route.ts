import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, telegram_handle } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Insert into waitlist
    const query = `
      INSERT INTO waitlist (email, telegram_handle)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      email.toLowerCase().trim(),
      telegram_handle?.trim() || null
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: result.rows[0]
    });

  } catch (error: any) {
    // Handle duplicate email
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This email is already on the waitlist!' },
        { status: 409 }
      );
    }

    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}
