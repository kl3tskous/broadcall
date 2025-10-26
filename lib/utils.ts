/**
 * Get the base URL for the application
 * Uses broadcall.xyz in production, localhost in development
 */
export function getBaseUrl(): string {
  // Check if we have a custom app URL set (for production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // In production on Replit, use the Replit domain
  if (process.env.REPLIT_DEPLOYMENT === '1') {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  }

  // Development - use localhost
  return 'http://localhost:5000'
}

/**
 * Generate a full URL for a given path
 * @param path - The path to append to the base URL (e.g., '/call/123')
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Get the domain name only (without protocol)
 * Useful for display purposes
 */
export function getDomain(): string {
  const baseUrl = getBaseUrl()
  return baseUrl.replace(/^https?:\/\//, '')
}
