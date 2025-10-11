'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Call, UserSettings } from '@/utils/supabaseClient'
import { platforms } from '@/components/PlatformLogos'

const DEFAULT_GMGN_REF = '7rpqjHdf'

interface TokenPrice {
  priceUsd: string
  priceChange24h: number
  liquidity: number
  volume24h: number
  marketCap: number
  pairAddress: string
  dexId: string
}

export default function CallPage() {
  const params = useParams()
  const id = params.id as string
  const [call, setCall] = useState<Call | null>(null)
  const [creatorSettings, setCreatorSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceData, setPriceData] = useState<TokenPrice | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setCall(data)

        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('*')
          .eq('wallet_address', data.creator_wallet)
          .single()

        if (settingsData) {
          setCreatorSettings(settingsData)
        }

        setLoading(false)

        const updatedViews = (data.views || 0) + 1

        void supabase
          .from('calls')
          .update({ views: updatedViews })
          .eq('id', id)
          .then(({ error: updateError }) => {
            if (!updateError) {
              setCall({ ...data, views: updatedViews })
            }
          })
          .catch(console.error)
      } catch (error) {
        console.error('Error fetching call:', error)
        setLoading(false)
      }
    }

    if (id) {
      fetchCall()
    }
  }, [id])

  useEffect(() => {
    const fetchPrice = async () => {
      if (!call?.token_address) return

      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${call.token_address}`
        )
        const data = await response.json()

        if (data.pairs && data.pairs.length > 0) {
          const mainPair = data.pairs[0]
          setPriceData({
            priceUsd: mainPair.priceUsd || '0',
            priceChange24h: mainPair.priceChange?.h24 || 0,
            liquidity: mainPair.liquidity?.usd || 0,
            volume24h: mainPair.volume?.h24 || 0,
            marketCap: mainPair.fdv || 0,
            pairAddress: mainPair.pairAddress,
            dexId: mainPair.dexId
          })
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      } finally {
        setPriceLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [call?.token_address])

  const getPlatformUrl = (platformId: string) => {
    if (!call) return ''
    
    const tokenAddress = call.token_address
    
    switch (platformId) {
      case 'gmgn':
        // Format: https://t.me/GMGN_sol_bot?start=i_{ref}_c_{token}
        const gmgnRef = call.gmgn_ref || creatorSettings?.gmgn_ref || DEFAULT_GMGN_REF
        return `https://t.me/GMGN_sol_bot?start=i_${gmgnRef}_c_${tokenAddress}`
      
      case 'axiom':
        // Format: https://axiom.trade/@{username} or direct token link
        const axiomRef = call.axiom_ref || creatorSettings?.axiom_ref || ''
        return axiomRef 
          ? `https://axiom.trade/@${axiomRef}`
          : `https://axiom.trade/solana/${tokenAddress}`
      
      case 'photon':
        // Format: https://photon-sol.tinyastro.io/{username} or direct token link
        const photonRef = call.photon_ref || creatorSettings?.photon_ref || ''
        return photonRef
          ? `https://photon-sol.tinyastro.io/${photonRef}`
          : `https://photon-sol.tinyastro.io/en/lp/${tokenAddress}`
      
      case 'bullx':
        // Format: https://neo.bullx.io/p/{referral_code}
        const bullxRef = call.bullx_ref || creatorSettings?.bullx_ref || ''
        return bullxRef
          ? `https://neo.bullx.io/p/${bullxRef}`
          : `https://bullx.io/terminal?chainId=1399811149&address=${tokenAddress}`
      
      case 'trojan':
        // Format: https://t.me/solana_trojanbot?start=r-{referralCode}
        const trojanRef = call.trojan_ref || creatorSettings?.trojan_ref || ''
        return trojanRef
          ? `https://t.me/solana_trojanbot?start=r-${trojanRef}`
          : `https://t.me/solana_trojanbot`
      
      default:
        return ''
    }
  }

  const handlePlatformClick = async (platformId: string) => {
    if (!call) return

    const url = getPlatformUrl(platformId)
    if (!url) return

    // Update clicks optimistically
    const updatedClicks = (call.clicks || 0) + 1
    setCall({ ...call, clicks: updatedClicks })

    // Open the platform URL
    window.open(url, '_blank', 'noopener,noreferrer')

    // Update database (non-blocking)
    supabase
      .from('calls')
      .update({ clicks: updatedClicks })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating clicks:', error)
          // Rollback on error
          setCall({ ...call, clicks: call.clicks })
        }
      })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-2">Call Not Found</h2>
          <p className="text-gray-400">This call doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-6 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Token Call
          </h1>
          <div className="text-sm text-gray-500">
            Views: {call.views} | Clicks: {call.clicks}
          </div>
        </div>

        {/* Mobile-First Responsive Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          
          {/* Token Information - Full width on mobile, 1 col on desktop */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Token Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Token Address
                </label>
                <div className="bg-dark-bg p-3 rounded-lg font-mono text-sm break-all">
                  {call.token_address}
                </div>
              </div>

              {call.thesis && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Thesis
                  </label>
                  <div className="bg-dark-bg p-3 rounded-lg text-sm">
                    {call.thesis}
                  </div>
                </div>
              )}

              {/* Buy on Platforms */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Buy on Your Favorite Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map((platform) => {
                    const Logo = platform.Logo
                    return (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformClick(platform.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/50 rounded-lg transition-all text-sm font-medium"
                      >
                        <Logo className="w-4 h-4" />
                        {platform.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Price Data - Full width on mobile, 1 col on desktop */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Price Data</h2>
            
            {priceLoading ? (
              <div className="text-center py-8 text-gray-400">Loading price data...</div>
            ) : priceData ? (
              <div className="space-y-4">
                <div className="bg-dark-bg p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Current Price</div>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    ${parseFloat(priceData.priceUsd).toFixed(6)}
                  </div>
                  <div className={`text-sm mt-1 ${priceData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceData.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceData.priceChange24h).toFixed(2)}% (24h)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Liquidity</div>
                    <div className="font-semibold text-sm">{formatNumber(priceData.liquidity)}</div>
                  </div>
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                    <div className="font-semibold text-sm">{formatNumber(priceData.volume24h)}</div>
                  </div>
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="font-semibold text-sm">{formatNumber(priceData.marketCap)}</div>
                  </div>
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">DEX</div>
                    <div className="font-semibold text-sm capitalize">{priceData.dexId}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Price data not available for this token
              </div>
            )}
          </div>

          {/* Interactive Chart - Full width on mobile, 1 col on desktop */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Live Chart</h2>
            
            {priceLoading ? (
              <div className="relative w-full bg-dark-bg rounded-lg flex items-center justify-center" style={{ paddingBottom: '100%' }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Loading chart...
                </div>
              </div>
            ) : priceData?.pairAddress ? (
              <>
                <div className="relative w-full bg-dark-bg rounded-lg overflow-hidden" style={{ paddingBottom: '100%' }}>
                  <iframe
                    src={`https://dexscreener.com/solana/${priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="absolute inset-0 w-full h-full border-0"
                    title="DexScreener Chart"
                    loading="lazy"
                  />
                </div>

                <a
                  href={`https://dexscreener.com/solana/${priceData.pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/50 text-white py-2.5 px-4 rounded-lg transition-all text-center font-medium mt-4 text-sm"
                >
                  Open Full Chart →
                </a>
              </>
            ) : (
              <div className="relative w-full bg-dark-bg rounded-lg flex items-center justify-center" style={{ paddingBottom: '100%' }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Chart not available for this token
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
