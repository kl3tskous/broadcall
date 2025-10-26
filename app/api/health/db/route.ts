import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        status: 'error',
        error: 'DATABASE_URL environment variable is not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Create a temporary pool for testing
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
      ssl: connectionString?.includes('localhost') ? false : {
        rejectUnauthorized: false
      }
    });

    // Try to connect and run a simple query
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    // Check if waitlist table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'waitlist'
    `);

    // Close the pool
    await pool.end();

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        current_time: result.rows[0].current_time,
        pg_version: result.rows[0].pg_version,
        waitlist_table_exists: tableCheck.rows.length > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      },
      database_url_exists: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
