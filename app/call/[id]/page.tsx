'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Call, UserSettings } from '@/utils/supabaseClient'
import { platforms } from '@/components/PlatformLogos'
import { formatTimeAgo, formatPrice, formatMarketCap, calculateROI, calculateMultiplier } from '@/utils/dexscreener'

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
  const [activeTab, setActiveTab] = useState<'pinned' | 'recent'>('pinned')

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
      <main className="min-h-screen">
        {/* Twitter/X Style Profile Header */}
        {call.creator_wallet && (
          <div className="border-b border-gray-800">
            {/* Full-Width Banner */}
            <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-br from-orange-900/50 to-red-900/50">
              {creatorBanner && (
                <img 
                  src={creatorBanner} 
                  alt="Profile banner" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Profile Info Section */}
            <div className="max-w-6xl mx-auto px-4">
              {/* Profile Image (Overlapping) */}
              <div className="relative">
                <div className="absolute -top-16 md:-top-20 left-0">
                  <Link href={`/profile/${call.creator_wallet}`}>
                    <div className="p-[4px] rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
                      {creatorAvatar ? (
                        <img 
                          src={creatorAvatar} 
                          alt={creatorAlias || 'User'} 
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl font-bold border-4 border-black">
                          {creatorAlias?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              </div>

              {/* User Info */}
              <div className="pt-20 md:pt-24 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/profile/${call.creator_wallet}`}>
                        <h1 className="text-xl md:text-2xl font-bold text-white hover:underline">
                          {creatorAlias || 'Anonymous'}
                        </h1>
                      </Link>
                      {/* Verified Badge */}
                      <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5 12.5l2.5 2.5 5-5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      @{creatorAlias || call.creator_wallet.slice(0, 8)}
                    </p>
                    
                    {/* Bio */}
                    {creatorBio && (
                      <p className="text-white text-base mb-3 max-w-xl">
                        {creatorBio}
                      </p>
                    )}

                    {/* Follower/Following Counts */}
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">
                        <strong className="text-white">0</strong> Following
                      </span>
                      <span className="text-gray-400">
                        <strong className="text-white">0</strong> Followers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800 -mx-4 px-4">
                  <div className="flex gap-8">
                    <button
                      onClick={() => setActiveTab('pinned')}
                      className={`pb-3 px-1 border-b-2 transition-colors font-semibold ${
                        activeTab === 'pinned' 
                          ? 'border-orange-500 text-white' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      📌 Pinned Call
                    </button>
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`pb-3 px-1 border-b-2 transition-colors font-semibold ${
                        activeTab === 'recent' 
                          ? 'border-orange-500 text-white' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Recent Calls
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'pinned' && (
            <div className="border-b border-gray-800 p-4">
              {/* Pinned Call - Custom Dark Card with Gradient Outline */}
              <div className="mb-4 relative rounded-2xl p-[2px] bg-gradient-to-br from-orange-500/50 to-orange-600/50">
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {/* Token Image */}
                <div className="flex-shrink-0">
                  {call.token_logo ? (
                    <img 
                      src={call.token_logo} 
                      alt={call.token_name || call.token_symbol || 'Token'} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl md:text-3xl font-bold">
                      {call.token_symbol?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                    {call.token_symbol || 'TOKEN'}
                  </h1>
                  <p className="text-base md:text-lg text-gray-400 mb-3">
                    {call.token_name || 'Unknown Token'}
                  </p>
                  
                  {/* Shared at Market Cap */}
                  {call.initial_mcap && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm text-gray-400">
                        <span className="text-green-500 font-semibold">{formatMarketCap(call.initial_mcap)}</span> MC
                      </span>
                    </div>
                  )}
                </div>

                {/* ROI Badge (Right Side) */}
                {call.initial_price && call.current_price && (
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-3xl md:text-4xl font-black ${
                      roi >= 0 ? 'text-green-400' : 'text-red-500'
                    }`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {multiplier.toFixed(2)}x
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-4 text-sm">
                {call.initial_mcap && (
                  <div className="text-gray-400">
                    Entry: <span className="text-white font-semibold">{formatMarketCap(call.initial_mcap)}</span>
                  </div>
                )}
                {priceData && (
                  <div className="text-gray-400">
                    Current: <span className="text-white font-semibold">{formatMarketCap(priceData.marketCap)}</span>
                  </div>
                )}
                {call.ath_price && (
                  <div className="text-gray-400">
                    ATH: <span className="text-yellow-400 font-semibold">+{athROI.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Platform Buttons */}
          <div className="mb-4">
            <h3 className="text-gray-400 text-sm font-medium mb-3">
              Buy with @{call.user_alias || 'user'} on your preferred platform
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {platforms.map((platform) => {
                const Logo = platform.Logo
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformClick(platform.id)}
                    className="flex flex-col items-center justify-center gap-2 px-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    <Logo className="w-16 h-16" />
                    <span className="text-white font-bold text-xs">{platform.name}</span>
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

            </div>
          )}

          {/* Recent Calls Tab */}
          {activeTab === 'recent' && (
            <div className="divide-y divide-gray-800 p-4">
              {moreCalls.length > 0 ? (
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
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No other calls yet
                </div>
              )}
            </div>
          )}
        </div>
      </main>
  )
}
