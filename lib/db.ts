import { Pool } from 'pg'

// Singleton database pool - shared across all API routes
// This prevents "max clients reached" errors by reusing connections
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10, // Maximum 10 connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 2000, // Fail fast if can't connect
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err)
    })
  }

  return pool
}
