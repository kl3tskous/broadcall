'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null)
  const [creatorAlias, setCreatorAlias] = useState<string | null>(null)
  const [creatorBio, setCreatorBio] = useState<string | null>(null)
  const [moreCalls, setMoreCalls] = useState<Call[]>([])
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
          .select('banner_url, avatar_url, alias, bio')
          .eq('wallet_address', data.creator_wallet)
          .single()

        if (profileData) {
          setCreatorBanner(profileData.banner_url || null)
          setCreatorAvatar(profileData.avatar_url || null)
          setCreatorAlias(profileData.alias || null)
          setCreatorBio(profileData.bio || null)
        }

        // Fetch more calls by the same creator
        const { data: moreCallsData } = await supabase
          .from('calls')
          .select('*')
          .eq('creator_wallet', data.creator_wallet)
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (moreCallsData) {
          setMoreCalls(moreCallsData)
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
          
          {/* User Profile Section */}
          {call.creator_wallet && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-800">
              {/* User Banner Background */}
              <div className="relative h-40 overflow-hidden">
                {creatorBanner ? (
                  <img 
                    src={creatorBanner} 
                    alt="Profile banner" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-900/50 to-red-900/50" />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                
                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                  <Link href={`/profile/${call.creator_wallet}`}>
                    {creatorAvatar ? (
                      <img 
                        src={creatorAvatar} 
                        alt={creatorAlias || 'User'} 
                        className="w-16 h-16 rounded-full border-4 border-black/50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl font-bold border-4 border-black/50">
                        {creatorAlias?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex-1">
                    <Link href={`/profile/${call.creator_wallet}`}>
                      <p className="text-white font-bold text-lg hover:underline">
                        {creatorAlias || 'Anonymous'}
                      </p>
                      <p className="text-white/70 text-sm">
                        @{creatorAlias || call.creator_wallet.slice(0, 8)}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* User Bio */}
              {creatorBio && (
                <div className="px-4 py-3 bg-gray-900/60 border-t border-gray-800">
                  <p className="text-sm text-gray-300">{creatorBio}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Full-Width Banner with Ape Background */}
          <div 
            className="relative mb-4 rounded-2xl overflow-hidden border-2 border-orange-500/40 h-[420px] flex items-center"
            style={{ 
              backgroundImage: 'url(/banner-ape-chill.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Gradient Overlay - Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            
            {/* Content - Left Aligned */}
            <div className="relative z-10 pl-6 md:pl-12 max-w-[600px] text-white">
              {/* Token Name & Ticker */}
              <h1 className="text-3xl md:text-5xl font-black mb-1">
                ${call.token_symbol || 'TOKEN'}
              </h1>
              <p className="text-base md:text-lg text-white/80 mb-1">
                {call.token_name || 'Unknown Token'}
              </p>
              {call.creator_wallet && (
                <Link 
                  href={`/profile/${call.creator_wallet}`}
                  className="flex items-center gap-2 mt-3 mb-6 hover:opacity-80 transition-opacity"
                >
                  {creatorAvatar ? (
                    <img 
                      src={creatorAvatar} 
                      alt={creatorAlias || 'User'} 
                      className="w-8 h-8 rounded-full border-2 border-white/30"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold border-2 border-white/30">
                      {(creatorAlias || call.user_alias)?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-sm text-white/90">
                    Called by <strong>@{creatorAlias || call.user_alias || 'Anonymous'}</strong>
                  </span>
                </Link>
              )}

              {/* ROI & PnL Display */}
              {call.initial_price && call.current_price && (
                <div className="mb-4">
                  <div className={`text-5xl md:text-7xl font-black ${
                    roi >= 0 ? 'text-green-400' : 'text-red-500'
                  }`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white/90 mt-1">
                    {multiplier.toFixed(2)}x
                  </div>
                </div>
              )}

              {/* Stats Line */}
              <div className="text-sm md:text-base text-gray-300 flex flex-wrap gap-3">
                {call.ath_price && (
                  <span className="text-yellow-400">
                    ATH: +{athROI.toFixed(1)}%
                  </span>
                )}
                {call.initial_mcap && (
                  <span>
                    Entry: {formatMarketCap(call.initial_mcap)}
                  </span>
                )}
                {priceData && (
                  <span>
                    Current: {formatMarketCap(priceData.marketCap)}
                  </span>
                )}
              </div>
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

          {/* Thesis Quote */}
          {call.thesis && (
            <div className="mb-4 p-4 bg-gray-800/30 border-l-4 border-orange-500 rounded-r-lg">
              <p className="text-gray-300 italic">&ldquo;{call.thesis}&rdquo;</p>
            </div>
          )}

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

          {/* Twitter/X Style Interaction Buttons */}
          <div className="mt-4 flex items-center justify-between border-t border-b border-gray-800 py-3">
            <div className="flex space-x-8 text-gray-400">
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/call/${call.id}`
                  const shareText = `🚀 ${call.token_symbol} ${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI\n\nCalled by @${creatorAlias || call.user_alias || 'Anonymous'} on Coin Call`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
                }}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🔁</span>
                <span className="text-sm font-medium">Share on X</span>
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/call/${call.id}`)
                  alert('Link copied to clipboard!')
                }}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🔗</span>
                <span className="text-sm font-medium">Copy Link</span>
              </button>

              <button className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">Comment</span>
                <span className="text-xs text-gray-500">(soon)</span>
              </button>
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
              <span>{call.views} views</span>
              <span>{call.clicks} clicks</span>
            </div>
          </div>

          {/* More Calls by User */}
          {moreCalls.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                📊 More Calls by @{creatorAlias || call.user_alias || 'This User'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {moreCalls.map((otherCall) => {
                  const otherROI = otherCall.initial_price && otherCall.current_price
                    ? calculateROI(otherCall.initial_price, otherCall.current_price)
                    : 0

                  return (
                    <Link
                      key={otherCall.id}
                      href={`/call/${otherCall.id}`}
                      className="bg-gray-800/50 hover:bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {otherCall.token_logo ? (
                          <img 
                            src={otherCall.token_logo} 
                            alt={otherCall.token_name || ''} 
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">
                            {otherCall.token_symbol?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-white">
                            ${otherCall.token_symbol || 'TOKEN'}
                          </h3>
                          <p className="text-xs text-gray-400 truncate">
                            {otherCall.token_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {otherCall.initial_price && otherCall.current_price && (
                        <div className={`text-2xl font-bold ${
                          otherROI >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {otherROI >= 0 ? '+' : ''}{otherROI.toFixed(1)}%
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
