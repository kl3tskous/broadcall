export interface DexScreenerToken {
  address: string
  name: string
  symbol: string
}

export interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: DexScreenerToken
  quoteToken: DexScreenerToken
  priceNative: string
  priceUsd: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
  info?: {
    imageUrl?: string
    header?: string
    openGraph?: string
    websites?: { label: string; url: string }[]
    socials?: { type: string; url: string }[]
  }
}

export interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexScreenerPair[] | null
}

export interface TokenMetadata {
  name: string
  symbol: string
  logo: string | null
  price: number
  marketCap: number
  liquidity: number
  fdv: number
}

export async function fetchTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
    
    if (!response.ok) {
      console.error('DexScreener API error:', response.status)
      return null
    }

    const data: DexScreenerResponse = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      console.error('No pairs found for token:', tokenAddress)
      return null
    }

    const pair = data.pairs[0]
    
    return {
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      logo: null,
      price: parseFloat(pair.priceUsd),
      marketCap: pair.marketCap || pair.fdv || 0,
      liquidity: pair.liquidity?.usd || 0,
      fdv: pair.fdv || 0
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return null
  }
}

export async function fetchTokenLogo(tokenAddress: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
    
    if (!response.ok) {
      return null
    }

    const data: DexScreenerResponse = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      return null
    }

    const pair = data.pairs[0]
    
    if (pair.info?.imageUrl) {
      return pair.info.imageUrl
    }
    
    const constructedUrl = `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`
    
    try {
      const imgResponse = await fetch(constructedUrl, { method: 'HEAD' })
      if (imgResponse.ok) {
        return constructedUrl
      }
    } catch {
    }
    
    return null
  } catch (error) {
    console.error('Error fetching token logo:', error)
    return null
  }
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatPrice(price: number): string {
  if (price < 0.000001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2)
}

export function formatMarketCap(mcap: number): string {
  if (mcap >= 1e9) return `$${(mcap / 1e9).toFixed(2)}B`
  if (mcap >= 1e6) return `$${(mcap / 1e6).toFixed(2)}M`
  if (mcap >= 1e3) return `$${(mcap / 1e3).toFixed(2)}K`
  return `$${mcap.toFixed(2)}`
}

export function calculateROI(initialPrice: number, currentPrice: number): number {
  if (initialPrice === 0) return 0
  return ((currentPrice - initialPrice) / initialPrice) * 100
}

export function calculateMultiplier(initialPrice: number, currentPrice: number): number {
  if (initialPrice === 0) return 0
  return currentPrice / initialPrice
}
