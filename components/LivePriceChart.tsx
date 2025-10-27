'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface LivePriceChartProps {
  tokenAddress: string
  userProfileImage?: string
  initialMarketCap?: number
  callTimestamp?: string
}

interface KOLCallData {
  timestamp: number | null
  marketCap: number
  price: number | null
  dataIndex: number | null
}

export function LivePriceChart({ 
  tokenAddress, 
  userProfileImage = 'https://placehold.co/40x40',
  initialMarketCap = 948000,
  callTimestamp
}: LivePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [priceData, setPriceData] = useState<number[]>([])
  const [timeLabels, setTimeLabels] = useState<string[]>([])
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [marketCapData, setMarketCapData] = useState<number[]>([])
  const [currentMarketCap, setCurrentMarketCap] = useState<number | null>(null)
  const [kolCall, setKolCall] = useState<KOLCallData>({
    timestamp: null,
    marketCap: initialMarketCap,
    price: null,
    dataIndex: null
  })
  const [kolMarkerStyle, setKolMarkerStyle] = useState({ left: 0, top: 0, display: 'none' })
  const [mcapBubbleStyle, setMcapBubbleStyle] = useState({ left: 0, top: 0, display: 'none' })

  const MAX_DATA_POINTS = 50
  const UPDATE_INTERVAL = 1000

  const formatMarketCap = (value: number): string => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(2) + 'M'
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K'
    }
    return '$' + value.toFixed(0)
  }

  const initChart = () => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, 120)
    gradient.addColorStop(0, 'rgba(255, 140, 0, 0.6)')
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0.05)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Market Cap (USD)',
          data: [],
          yAxisID: 'y',
          borderColor: '#ff8c00',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.45,
          pointRadius: (context) => {
            return context.dataIndex === context.dataset.data.length - 1 ? 5 : 0
          },
          pointBackgroundColor: (context) => {
            return context.dataIndex === context.dataset.data.length - 1 ? '#00ff88' : '#ff8c00'
          },
          pointBorderColor: (context) => {
            return context.dataIndex === context.dataset.data.length - 1 ? '#00ff88' : '#fff'
          },
          pointBorderWidth: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#ff8c00',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#666',
              font: { size: 9 },
              maxTicksLimit: 6,
              callback: function(value, index) {
                const label = this.getLabelForValue(value as number)
                if (label && label.includes(':')) {
                  const parts = label.split(':')
                  return parts[0] + ':' + parts[1]
                }
                return label
              }
            }
          },
          y: {
            display: true,
            position: 'right',
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#666',
              font: { size: 9 },
              callback: function(value) {
                const numValue = value as number
                if (numValue >= 1000000000) {
                  return (numValue / 1000000000).toFixed(2) + 'B'
                } else if (numValue >= 1000000) {
                  return (numValue / 1000000).toFixed(2) + 'M'
                } else if (numValue >= 1000) {
                  return (numValue / 1000).toFixed(0) + 'K'
                }
                return numValue.toFixed(0)
              },
              padding: 5
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animation: {
          duration: 300
        }
      }
    })
  }

  const updateKolMarkerPosition = () => {
    if (!chartRef.current || kolCall.marketCap === null || kolCall.dataIndex === null) return

    const chartArea = chartRef.current.chartArea
    if (!chartArea) return

    const datasetMeta = chartRef.current.getDatasetMeta(0)
    if (datasetMeta.data[kolCall.dataIndex]) {
      const point = datasetMeta.data[kolCall.dataIndex]
      const x = point.x
      const y = point.y

      setKolMarkerStyle({ left: x, top: y, display: 'block' })
      setMcapBubbleStyle({ left: x, top: y - 30, display: 'block' })
    }
  }

  const fetchTokenData = async () => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
      
      if (!response.ok) return

      const data = await response.json()
      
      if (data && data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0]
        updateChart(pair)
      }
    } catch (error) {
      console.error('Error fetching token data:', error)
    }
  }

  const formatTimeHHMM = (timestamp: number): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp))
  }

  const updateChart = (pair: any) => {
    const currentTimestamp = Date.now()
    const currentTime = formatTimeHHMM(currentTimestamp)
    const price = parseFloat(pair.priceUsd)
    const marketCap = pair.marketCap || pair.fdv || currentMarketCap

    if (marketCap) setCurrentMarketCap(marketCap)

    setTimeLabels(prev => {
      const newLabels = [...prev, currentTime]
      if (newLabels.length > MAX_DATA_POINTS) {
        newLabels.shift()
        // Update KOL marker index after shift (keep it at 0 if already at 0)
        setKolCall(k => ({ 
          ...k, 
          dataIndex: k.dataIndex !== null && k.dataIndex > 0 ? k.dataIndex - 1 : 0 
        }))
      }
      return newLabels
    })

    setPriceData(prev => {
      const newData = [...prev, price]
      if (newData.length > MAX_DATA_POINTS) {
        newData.shift()
      }
      return newData
    })

    setMarketCapData(prev => {
      const newData = [...prev, marketCap]
      if (newData.length > MAX_DATA_POINTS) {
        newData.shift()
      }
      return newData
    })

    setTimestamps(prev => {
      const newData = [...prev, currentTimestamp]
      if (newData.length > MAX_DATA_POINTS) {
        newData.shift()
      }
      return newData
    })
  }

  const initializeWithHistoricalData = async () => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
      const data = await response.json()

      if (data && data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0]
        const currentPrice = parseFloat(pair.priceUsd)
        const currentMcap = pair.marketCap || pair.fdv || 1000000

        setCurrentMarketCap(currentMcap)

        const historyCount = 20
        const now = Date.now()
        
        // Parse the actual call timestamp if provided
        const actualCallTime = callTimestamp ? new Date(callTimestamp).getTime() : now - 75000 // Default to 15 intervals ago
        
        // Calculate how far back we need to go to include the call time
        const timeSinceCall = now - actualCallTime
        const intervalsNeeded = Math.max(historyCount, Math.ceil(timeSinceCall / 5000) + 5)
        const effectiveHistoryCount = Math.min(intervalsNeeded, MAX_DATA_POINTS)

        const newTimeLabels: string[] = []
        const newPriceData: number[] = []
        const newMarketCapData: number[] = []
        const newTimestamps: number[] = []
        let kolCallIndex: number | null = null
        let closestDistance = Infinity

        for (let i = 0; i < effectiveHistoryCount; i++) {
          const variation = (Math.random() - 0.5) * 0.0000001
          const historicalPrice = currentPrice + (variation * (effectiveHistoryCount - i))
          const timestamp = now - (effectiveHistoryCount - i) * 5000
          const time = formatTimeHHMM(timestamp)

          const priceRatio = historicalPrice / currentPrice
          const historicalMarketCap = currentMcap * priceRatio

          newTimeLabels.push(time)
          newPriceData.push(historicalPrice)
          newMarketCapData.push(historicalMarketCap)
          newTimestamps.push(timestamp)

          // Find the data point closest to the actual call time
          const distance = Math.abs(timestamp - actualCallTime)
          if (distance < closestDistance) {
            closestDistance = distance
            kolCallIndex = i
          }
        }

        // Set KOL call data at the identified index (fallback to earliest point if not found)
        const finalIndex = kolCallIndex !== null ? kolCallIndex : 0
        setKolCall({
          timestamp: newTimestamps[finalIndex],
          price: newPriceData[finalIndex],
          dataIndex: finalIndex,
          marketCap: newMarketCapData[finalIndex] || initialMarketCap
        })

        setTimeLabels(newTimeLabels)
        setPriceData(newPriceData)
        setMarketCapData(newMarketCapData)
        setTimestamps(newTimestamps)
      }
    } catch (error) {
      console.error('Error initializing historical data:', error)
    }
  }

  useEffect(() => {
    initChart()
    initializeWithHistoricalData()

    const interval = setInterval(fetchTokenData, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.labels = timeLabels
      chartRef.current.data.datasets[0].data = marketCapData
      chartRef.current.update('none')
      updateKolMarkerPosition()
    }
  }, [timeLabels, marketCapData])

  return (
    <div className="relative w-full h-[120px] overflow-visible">
      <canvas ref={canvasRef} />
      
      {/* KOL Marker */}
      <div 
        className="absolute pointer-events-none z-10"
        style={{ 
          left: `${kolMarkerStyle.left}px`, 
          top: `${kolMarkerStyle.top}px`,
          display: kolMarkerStyle.display,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          {/* Broadcast Waves */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10">
            <div className="wave wave-1" />
            <div className="wave wave-2" />
            <div className="wave wave-3" />
          </div>
          
          {/* KOL Avatar */}
          <div className="relative w-10 h-10 rounded-full border-2 border-orange-600 overflow-hidden bg-[#111] z-[2]">
            <img 
              src={userProfileImage} 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Market Cap Bubble */}
      <div 
        className="absolute pointer-events-none z-[11] bg-orange-600 text-black px-3 py-1 rounded-xl font-bold text-xs whitespace-nowrap shadow-[0_2px_8px_rgba(255,140,0,0.4)]"
        style={{ 
          left: `${mcapBubbleStyle.left}px`, 
          top: `${mcapBubbleStyle.top}px`,
          display: mcapBubbleStyle.display,
          transform: 'translateX(-50%)'
        }}
      >
        {formatMarketCap(kolCall.marketCap)}
      </div>

      <style jsx>{`
        .wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid #ff8c00;
          border-radius: 50%;
          opacity: 0;
          animation: broadcast 2s ease-out infinite;
        }

        .wave-1 {
          animation-delay: 0s;
        }

        .wave-2 {
          animation-delay: 0.6s;
        }

        .wave-3 {
          animation-delay: 1.2s;
        }

        @keyframes broadcast {
          0% {
            width: 40px;
            height: 40px;
            opacity: 0.8;
          }
          100% {
            width: 80px;
            height: 80px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
