import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Pool } from 'pg';

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Update user to mark as joined waitlist
    const query = `
      UPDATE broadcall_users 
      SET joined_waitlist = true,
          updated_at = NOW()
      WHERE twitter_id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [session.user.twitter_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
