'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Call, UserSettings } from '@/utils/supabaseClient'
import { platforms } from '@/components/PlatformLogos'
import { fetchTokenMetadata, formatTimeAgo, formatPrice, formatMarketCap, calculateROI, calculateMultiplier } from '@/utils/dexscreener'
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
  const [loading, setLoading] = useState(true)
  const [priceData, setPriceData] = useState<TokenPrice | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

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

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleShareOnX = () => {
    if (!call) return
    
    const roi = call.initial_price && call.current_price 
      ? calculateROI(call.initial_price, call.current_price).toFixed(1)
      : '0'
    
    const initialMcap = call.initial_mcap ? formatMarketCap(call.initial_mcap) : '$0'
    const tokenSymbol = call.token_symbol || 'TOKEN'
    
    const tweetText = `I called $${tokenSymbol} at ${initialMcap} — now up ${roi}% 🚀\n\n${window.location.href}`
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
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

      <main className="min-h-screen py-6 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Token Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              {call.token_logo ? (
                <img 
                  src={call.token_logo} 
                  alt={call.token_name || 'Token'} 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-purple-500/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold">
                  {call.token_symbol?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  {call.token_name || 'Unknown Token'}
                  {call.token_symbol && (
                    <span className="text-gray-400 ml-2">${call.token_symbol}</span>
                  )}
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">
                  {call.user_alias && `First shared by @${call.user_alias} `}
                  {call.initial_mcap && `at ${formatMarketCap(call.initial_mcap)} MCap`}
                  {call.first_shared_at && ` • ${formatTimeAgo(call.first_shared_at)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Flex Card */}
          {call.initial_price && call.current_price && (
            <div className="card mb-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50">
              <h2 className="text-xl md:text-2xl font-bold mb-4">📊 Performance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center md:text-left">
                  <div className="text-sm text-gray-400 mb-1">Current ROI</div>
                  <div className={`text-4xl md:text-5xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {multiplier.toFixed(2)}x from entry
                  </div>
                </div>

                {call.ath_price && (
                  <div className="text-center md:text-left">
                    <div className="text-sm text-gray-400 mb-1">All-Time High</div>
                    <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                      +{athROI.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {call.ath_mcap && formatMarketCap(call.ath_mcap)} peak
                    </div>
                  </div>
                )}

                <div className="text-center md:text-left">
                  <div className="text-sm text-gray-400 mb-1">Entry → Current</div>
                  <div className="text-lg md:text-xl font-semibold">
                    <div className="text-gray-300">
                      ${formatPrice(call.initial_price)} → ${formatPrice(call.current_price)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {call.initial_mcap && call.current_mcap && 
                      `${formatMarketCap(call.initial_mcap)} → ${formatMarketCap(call.current_mcap)}`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleShareOnX}
              className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-900 border border-gray-700 rounded-lg transition-all font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </button>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all font-medium"
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            
            {/* Token Information & Platform Buttons */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Token Info</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Contract Address
                  </label>
                  <div className="bg-dark-bg p-3 rounded-lg font-mono text-xs md:text-sm break-all">
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

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Buy on Platform
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

                <div className="pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium">Views:</span> {call.views} • <span className="font-medium">Clicks:</span> {call.clicks}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Price Data */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Live Price</h2>
              
              {priceLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
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
                  Price data unavailable
                </div>
              )}
            </div>

            {/* Live Chart */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Chart</h2>
              
              {priceLoading ? (
                <div className="relative w-full bg-dark-bg rounded-lg flex items-center justify-center" style={{ paddingBottom: '100%' }}>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Loading...
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
                    Chart unavailable
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
