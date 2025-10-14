'use client'

import { useEffect, useRef, useState } from 'react'

interface LivePriceChartProps {
  tokenAddress: string
  pairAddress?: string
  tokenName?: string
  tokenSymbol?: string
  tokenLogo?: string
}

interface TokenData {
  price: number
  marketCap: number
}

export default function LivePriceChart({ tokenAddress, pairAddress, tokenName, tokenSymbol, tokenLogo }: LivePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [currentData, setCurrentData] = useState<TokenData | null>(null)
  const maxDataPoints = 300 // 5 minutes of data (300 seconds at 1 second intervals)

  useEffect(() => {
    let isMounted = true

    const fetchPrice = async () => {
      if (!tokenAddress) return

      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
        )
        const data = await response.json()

        if (data.pairs && data.pairs.length > 0 && isMounted) {
          const price = parseFloat(data.pairs[0].priceUsd || '0')
          const marketCap = parseFloat(data.pairs[0].marketCap || '0')
          
          setCurrentData({ price, marketCap })
          
          setPriceHistory(prev => {
            const newHistory = [...prev, price]
            return newHistory.slice(-maxDataPoints)
          })
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [tokenAddress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || priceHistory.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const minPrice = Math.min(...priceHistory)
    const maxPrice = Math.max(...priceHistory)
    const priceRange = maxPrice - minPrice || 1
    const padding = rect.height * 0.1

    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
    gradient.addColorStop(0, '#f97316')
    gradient.addColorStop(1, '#ea580c')

    // Draw smooth curved line using quadratic curves
    ctx.beginPath()
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    priceHistory.forEach((price, index) => {
      const x = (index / (maxDataPoints - 1)) * rect.width
      const y = rect.height - padding - ((price - minPrice) / priceRange) * (rect.height - padding * 2)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        // Get previous point
        const prevPrice = priceHistory[index - 1]
        const prevX = ((index - 1) / (maxDataPoints - 1)) * rect.width
        const prevY = rect.height - padding - ((prevPrice - minPrice) / priceRange) * (rect.height - padding * 2)
        
        // Calculate control point for smooth curve
        const cpX = (prevX + x) / 2
        const cpY = (prevY + y) / 2
        
        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
      }
    })

    // Complete the path to the last point
    if (priceHistory.length > 1) {
      const lastPrice = priceHistory[priceHistory.length - 1]
      const lastX = rect.width
      const lastY = rect.height - padding - ((lastPrice - minPrice) / priceRange) * (rect.height - padding * 2)
      ctx.lineTo(lastX, lastY)
    }

    ctx.stroke()

  }, [priceHistory, maxDataPoints])

  const formatMarketCap = (mc: number) => {
    if (mc >= 1000000) {
      return `$${(mc / 1000000).toFixed(2)}M`
    } else if (mc >= 1000) {
      return `$${(mc / 1000).toFixed(2)}K`
    }
    return `$${mc.toFixed(2)}`
  }

  return (
    <div className="relative w-full bg-gray-900/90 backdrop-blur-sm overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      {/* Token Info Overlay */}
      {currentData && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          {tokenLogo && (
            <img 
              src={tokenLogo} 
              alt={tokenSymbol || 'Token'} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full"
            />
          )}
          <div>
            <h3 className="text-white font-bold text-lg md:text-xl">
              {tokenSymbol || 'TOKEN'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-green-500 font-semibold text-sm">
                {formatMarketCap(currentData.marketCap)} MC
              </span>
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      {priceHistory.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Loading price data...
        </div>
      )}
    </div>
  )
}
