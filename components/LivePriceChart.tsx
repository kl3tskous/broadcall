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

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export default function LivePriceChart({ tokenAddress, pairAddress, tokenName, tokenSymbol, tokenLogo }: LivePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [currentData, setCurrentData] = useState<TokenData | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchCandles = async () => {
      if (!tokenAddress) return

      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
        )
        const data = await response.json()

        if (data.pairs && data.pairs.length > 0 && isMounted) {
          const pair = data.pairs[0]
          const price = parseFloat(pair.priceUsd || '0')
          const marketCap = parseFloat(pair.marketCap || '0')
          
          setCurrentData({ price, marketCap })

          // Create 5-minute candles from price updates
          const now = Date.now()
          const currentCandleTime = Math.floor(now / (5 * 60 * 1000)) * (5 * 60 * 1000)

          setCandles(prev => {
            const newCandles = [...prev]
            const lastCandle = newCandles[newCandles.length - 1]

            if (!lastCandle || lastCandle.time !== currentCandleTime) {
              // New candle
              newCandles.push({
                time: currentCandleTime,
                open: price,
                high: price,
                low: price,
                close: price
              })
            } else {
              // Update current candle
              lastCandle.high = Math.max(lastCandle.high, price)
              lastCandle.low = Math.min(lastCandle.low, price)
              lastCandle.close = price
            }

            // Keep last 24 candles (2 hours of data)
            return newCandles.slice(-24)
          })
        }
      } catch (error) {
        console.error('Error fetching candles:', error)
      }
    }

    fetchCandles()
    const interval = setInterval(fetchCandles, 5000) // Update every 5 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [tokenAddress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candles.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    // Find price range
    const allPrices = candles.flatMap(c => [c.high, c.low])
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    let priceRange = maxPrice - minPrice
    
    if (priceRange === 0 || priceRange < maxPrice * 0.001) {
      priceRange = maxPrice * 0.1
    }
    
    const padding = rect.height * 0.1
    const chartHeight = rect.height - padding * 2

    // Calculate candle width
    const candleWidth = (rect.width / candles.length) * 0.7
    const candleSpacing = rect.width / candles.length

    // Draw candles
    candles.forEach((candle, index) => {
      const x = index * candleSpacing + candleSpacing / 2
      
      // Calculate y positions (inverted because canvas y increases downward)
      const yHigh = padding + ((maxPrice - candle.high) / priceRange) * chartHeight
      const yLow = padding + ((maxPrice - candle.low) / priceRange) * chartHeight
      const yOpen = padding + ((maxPrice - candle.open) / priceRange) * chartHeight
      const yClose = padding + ((maxPrice - candle.close) / priceRange) * chartHeight

      // Determine if bullish or bearish
      const isBullish = candle.close >= candle.open

      // Set colors - orange theme
      const bodyColor = isBullish ? '#f97316' : '#dc2626' // orange-500 for bullish, red-600 for bearish
      const wickColor = isBullish ? '#fb923c' : '#ef4444' // orange-400 for bullish, red-500 for bearish

      // Draw wick (high-low line)
      ctx.strokeStyle = wickColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, yHigh)
      ctx.lineTo(x, yLow)
      ctx.stroke()

      // Draw candle body
      ctx.fillStyle = bodyColor
      const bodyTop = Math.min(yOpen, yClose)
      const bodyHeight = Math.abs(yClose - yOpen) || 1 // Minimum height of 1px for doji
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)
    })

  }, [candles])

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
      {candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Loading candle data...
        </div>
      )}
    </div>
  )
}
