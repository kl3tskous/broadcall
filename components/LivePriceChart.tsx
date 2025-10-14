'use client'

import { useEffect, useRef, useState } from 'react'

interface LivePriceChartProps {
  tokenAddress: string
  pairAddress?: string
}

export default function LivePriceChart({ tokenAddress, pairAddress }: LivePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const maxDataPoints = 60 // 60 seconds of data

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
          
          setPriceHistory(prev => {
            const newHistory = [...prev, price]
            // Keep only last maxDataPoints
            return newHistory.slice(-maxDataPoints)
          })
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }

    // Initial fetch
    fetchPrice()

    // Fetch every 1 second
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

    // Set canvas size for retina displays
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Find min and max for scaling
    const minPrice = Math.min(...priceHistory)
    const maxPrice = Math.max(...priceHistory)
    const priceRange = maxPrice - minPrice || 1

    // Add padding
    const padding = rect.height * 0.1

    // Create gradient for line stroke
    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
    gradient.addColorStop(0, '#f97316') // orange-500
    gradient.addColorStop(1, '#ea580c') // orange-600

    // Draw line
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
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

  }, [priceHistory, maxDataPoints])

  return (
    <div className="relative w-full bg-gray-900/90 backdrop-blur-sm overflow-hidden" style={{ paddingBottom: '56.25%' }}>
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
