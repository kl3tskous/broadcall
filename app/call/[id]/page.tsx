'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Call, UserSettings } from '@/utils/supabaseClient'
import { platforms } from '@/components/PlatformLogos'
import { formatTimeAgo, formatPrice, formatMarketCap, calculateROI, calculateMultiplier } from '@/utils/dexscreener'
import Head from 'next/head'

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
  const [creatorBanner, setCreatorBanner] = useState<string | null>(null)
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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('banner_url')
          .eq('wallet_address', data.creator_wallet)
          .single()

        if (profileData?.banner_url) {
          setCreatorBanner(profileData.banner_url)
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

          if (call.initial_price) {
            const currentPrice = parseFloat(mainPair.priceUsd)
            const currentMcap = mainPair.fdv || 0
            
            const shouldUpdateATH = !call.ath_price || currentPrice > call.ath_price
            
            if (shouldUpdateATH) {
              await supabase
                .from('calls')
                .update({
                  current_price: currentPrice,
                  current_mcap: currentMcap,
                  ath_price: currentPrice,
                  ath_mcap: currentMcap
                })
                .eq('id', id)
                
              setCall(prev => prev ? {
                ...prev,
                current_price: currentPrice,
                current_mcap: currentMcap,
                ath_price: currentPrice,
                ath_mcap: currentMcap
              } : null)
            } else {
              await supabase
                .from('calls')
                .update({
                  current_price: currentPrice,
                  current_mcap: currentMcap,
                })
                .eq('id', id)
                
              setCall(prev => prev ? {
                ...prev,
                current_price: currentPrice,
                current_mcap: currentMcap,
              } : null)
            }
          }
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
  }, [call?.token_address, call?.initial_price, id])

  const getPlatformUrl = (platformId: string) => {
    if (!call) return ''
    
    const tokenAddress = call.token_address
    
    switch (platformId) {
      case 'gmgn':
        const gmgnRef = call.gmgn_ref || creatorSettings?.gmgn_ref || DEFAULT_GMGN_REF
        return `https://gmgn.ai/sol/token/${gmgnRef}_${tokenAddress}`
      
      case 'axiom':
        const axiomRef = call.axiom_ref || creatorSettings?.axiom_ref || ''
        return axiomRef 
          ? `https://axiom.trade/t/${tokenAddress}/@${axiomRef}`
          : `https://axiom.trade/solana/${tokenAddress}`
      
      case 'photon':
        const photonRef = call.photon_ref || creatorSettings?.photon_ref || ''
        return photonRef
          ? `https://photon-sol.tinyastro.io/${photonRef}`
          : `https://photon-sol.tinyastro.io/en/lp/${tokenAddress}`
      
      case 'bullx':
        const bullxRef = call.bullx_ref || creatorSettings?.bullx_ref || ''
        return bullxRef
          ? `https://neo.bullx.io/p/${bullxRef}`
          : `https://bullx.io/terminal?chainId=1399811149&address=${tokenAddress}`
      
      case 'trojan':
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

    const updatedClicks = (call.clicks || 0) + 1
    setCall({ ...call, clicks: updatedClicks })

    window.open(url, '_blank', 'noopener,noreferrer')

    supabase
      .from('calls')
      .update({ clicks: updatedClicks })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating clicks:', error)
          setCall({ ...call, clicks: call.clicks })
        }
      })
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

  const roi = call.initial_price && call.current_price 
    ? calculateROI(call.initial_price, call.current_price)
    : 0
  
  const multiplier = call.initial_price && call.current_price
    ? calculateMultiplier(call.initial_price, call.current_price)
    : 0

  const athROI = call.initial_price && call.ath_price
    ? calculateROI(call.initial_price, call.ath_price)
    : 0

  return (
    <>
      <Head>
        <title>{call.token_name || 'Token Call'} - Performance Tracker</title>
        <meta property="og:title" content={`${call.token_name || 'Token'} Call - ${roi > 0 ? '+' : ''}${roi.toFixed(1)}% ROI`} />
        <meta property="og:description" content={`First shared at ${call.initial_mcap ? formatMarketCap(call.initial_mcap) : 'N/A'}${call.user_alias ? ' by @' + call.user_alias : ''}`} />
        {call.token_logo && <meta property="og:image" content={call.token_logo} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen py-4 md:py-8 px-3 md:px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Flex Card Banner with Ape on Right */}
          <div 
            className="relative mb-4 rounded-2xl overflow-hidden border-2 border-orange-500/40"
            style={{ height: '420px' }}
          >
            {/* Ape Background Image - Positioned Right, Contained */}
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: 'url(/banner-ape-chill.webp)',
                backgroundSize: 'contain',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Dark Gradient Overlay - Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            
            {/* Content - Aligned Left */}
            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
              {/* Top: Token Info */}
              <div className="flex items-start gap-4 max-w-xl">
                {call.token_logo ? (
                  <img 
                    src={call.token_logo} 
                    alt={call.token_name || 'Token'} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-3 border-white/30 shadow-2xl flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-2xl">
                    {call.token_symbol?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl mb-2">
                    ${call.token_symbol || 'TOKEN'}
                  </h1>
                  <p className="text-base md:text-xl text-white/90 drop-shadow-lg">
                    {call.token_name || 'Unknown Token'}
                  </p>
                  {call.user_alias && (
                    <p className="text-sm text-white/70 mt-2 drop-shadow">
                      Called by @{call.user_alias}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle: ROI Flex Display */}
              {call.initial_price && call.current_price && (
                <div className="max-w-xl">
                  <div className={`text-6xl md:text-8xl font-black drop-shadow-2xl ${
                    roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white/90 drop-shadow-lg mt-2">
                    {multiplier.toFixed(2)}x Multiplier
                  </div>
                  {call.ath_price && (
                    <div className="text-lg text-yellow-400 drop-shadow-lg mt-3">
                      All-Time High: +{athROI.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {/* Bottom: Stats Bar */}
              {call.initial_price && (
                <div className="flex items-center gap-6 text-sm md:text-base text-white/80 max-w-2xl">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-white/60">Entry: </span>
                    <span className="font-bold text-white">
                      {call.initial_mcap && formatMarketCap(call.initial_mcap)}
                    </span>
                  </div>
                  {priceData && (
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
                      <span className="text-white/60">Current: </span>
                      <span className="font-bold text-white">
                        {formatMarketCap(priceData.marketCap)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Platform Buttons */}
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {platforms.map((platform) => {
                const Logo = platform.Logo
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformClick(platform.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-transparent hover:bg-orange-500/10 border-2 border-orange-500/50 hover:border-orange-400/70 rounded-lg transition-all text-sm font-medium"
                  >
                    <Logo className="w-4 h-4" />
                    <span className="hidden md:inline">{platform.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live Chart */}
          <div className="card p-0 overflow-hidden">
            {priceLoading ? (
              <div className="relative w-full bg-dark-bg flex items-center justify-center" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Loading chart...
                </div>
              </div>
            ) : priceData?.pairAddress ? (
              <div className="relative w-full bg-dark-bg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://dexscreener.com/solana/${priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                  className="absolute inset-0 w-full h-full border-0"
                  title="DexScreener Chart"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="relative w-full bg-dark-bg flex items-center justify-center" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Chart unavailable
                </div>
              </div>
            )}
          </div>

          {/* Compact Stats Footer */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div>
              {call.thesis && (
                <p className="text-sm text-gray-400 max-w-2xl">{call.thesis}</p>
              )}
            </div>
            <div className="flex gap-4">
              <span>{call.views} views</span>
              <span>{call.clicks} clicks</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
