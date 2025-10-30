import { Pool } from 'pg'

// Singleton database pool - shared across all API routes
// This prevents "max clients reached" errors by reusing connections
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    // For Vercel/serverless, use Supabase transaction pooling (port 6543 with pgbouncer=true)
    // Not session pooling (port 5432) which causes connection timeouts
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5, // Reduced for serverless (Vercel has connection limits)
      idleTimeoutMillis: 10000, // Shorter idle timeout for serverless
      connectionTimeoutMillis: 10000, // 10s timeout (increased from 2s)
      statement_timeout: 30000, // 30s query timeout
      query_timeout: 30000, // 30s total query timeout
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err)
      // Reset pool on error to force reconnection
      pool = null
    })
  }

  return pool
}
