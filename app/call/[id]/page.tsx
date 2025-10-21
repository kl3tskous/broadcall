'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Call, UserSettings } from '@/utils/supabaseClient'
import { platforms } from '@/components/PlatformLogos'
import { formatTimeAgo, formatPrice, formatMarketCap, calculateROI, calculateMultiplier } from '@/utils/dexscreener'
import { CallPageHeader } from '@/components/CallPageHeader'

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
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-xl text-gray-300 relative z-10">Loading...</div>
      </div>
    )
  }

  if (!call) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-white">Call Not Found</h2>
          <p className="text-gray-300">This call doesn't exist or has been removed.</p>
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
    <main 
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Glassmorphic Header */}
      <CallPageHeader />

      {/* Decorative Corner Lines */}
      <div className="fixed pointer-events-none">
        {/* Top Right Lines */}
        <div className="absolute right-96 top-64 w-16 h-1 bg-white/12 origin-left" style={{ transform: 'rotate(38.66deg)' }} />
        <div className="absolute right-96 top-72 w-16 h-1 bg-white/12 origin-left" style={{ transform: 'rotate(-38.66deg)' }} />
        
        {/* Top Left Lines */}
        <div className="absolute left-96 top-64 w-16 h-1 bg-white/12 origin-right" style={{ transform: 'rotate(-38.66deg)' }} />
        <div className="absolute left-96 top-72 w-16 h-1 bg-white/12 origin-right" style={{ transform: 'rotate(38.66deg)' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4 md:py-6">
        
        {/* Hero Token Card */}
        <div className="mb-6 relative">
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-4 md:p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            
            {/* Token Logo - Top Right */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              {call.token_logo ? (
                <img 
                  src={call.token_logo} 
                  alt={call.token_symbol || 'Token'} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  {call.token_symbol?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Token Name & ROI */}
            <div className="mb-4">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3">
                ${call.token_symbol || 'TOKEN'}
              </h1>
              {call.initial_price && call.current_price && (
                <div className={`text-4xl md:text-6xl font-black ${
                  roi >= 0 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'text-red-500'
                } bg-clip-text text-transparent`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
                </div>
              )}
            </div>

            {/* Since called by */}
            <div className="mb-4">
              <p className="text-gray-400 text-lg mb-3">Since called by:</p>
              <Link href={`/profile/${call.creator_wallet}`} className="flex items-center gap-3 group">
                <div className="flex-shrink-0">
                  {creatorAvatar ? (
                    <img 
                      src={creatorAvatar} 
                      alt={creatorAlias || 'User'} 
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl font-bold">
                      {creatorAlias?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xl font-bold group-hover:underline">
                    @{creatorAlias || 'Anonymous'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Inline Chart */}
            {priceData?.pairAddress && (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://dexscreener.com/solana/${priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                  className="w-full h-[200px] md:h-[280px] border-0"
                  style={{ background: 'transparent' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Every buy powers call */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white flex items-center justify-center gap-4">
            {/* Left Arrow */}
            <img 
              src="/arrow-down.png" 
              alt="Arrow" 
              className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
            />
            
            <span>
              Every buy powers{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                @{creatorAlias || 'Anonymous'}
              </span>
              's call
            </span>
            
            {/* Right Arrow */}
            <img 
              src="/arrow-down.png" 
              alt="Arrow" 
              className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
            />
          </h2>
          
          {/* Horizontal Scrollable Platform Buttons */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-3 mx-auto">
              {platforms.map((platform) => {
                const Logo = platform.Logo
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformClick(platform.id)}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-32 h-32 bg-white/[0.12] border border-white/20 backdrop-blur-[20px] hover:bg-white/[0.18] rounded-[28px] transition-all shadow-[0px_4px_6px_rgba(0,0,0,0.38)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.5)]"
                  >
                    <Logo className="w-12 h-12" />
                    <span className="text-white font-extrabold text-xs">{platform.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Thesis Quote */}
        {call.thesis && (
          <div className="mb-8 bg-white/[0.08] backdrop-blur-[20px] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-200 text-lg italic">&ldquo;{call.thesis}&rdquo;</p>
          </div>
        )}

        {/* Stats & Social Sharing */}
        <div className="mb-8 bg-white/[0.08] backdrop-blur-[20px] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-6 text-gray-300">
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/call/${call.id}`
                  const shareText = `🚀 ${call.token_symbol} ${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI\n\nCalled by @${creatorAlias || call.user_alias || 'Anonymous'} on BroadCall`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
                }}
                className="flex items-center gap-2 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🔁</span>
                <span className="text-sm font-medium">Share on X</span>
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/call/${call.id}`)
                  alert('Link copied to clipboard!')
                }}
                className="flex items-center gap-2 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🔗</span>
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="text-orange-400">👁</span> {call.views || 0} views
              </span>
              <span className="flex items-center gap-2">
                <span className="text-orange-400">🖱</span> {call.clicks || 0} clicks
              </span>
            </div>
          </div>
        </div>

        {/* More Calls by Creator */}
        {moreCalls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              More calls by{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                @{creatorAlias || 'Anonymous'}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {moreCalls.map((otherCall) => {
                const otherROI = otherCall.initial_price && otherCall.current_price
                  ? calculateROI(otherCall.initial_price, otherCall.current_price)
                  : 0

                return (
                  <Link
                    key={otherCall.id}
                    href={`/call/${otherCall.id}`}
                    className="bg-white/[0.08] backdrop-blur-[20px] border border-white/10 hover:bg-white/[0.12] hover:border-white/20 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {otherCall.token_logo ? (
                        <img 
                          src={otherCall.token_logo} 
                          alt={otherCall.token_name || ''} 
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg font-bold">
                          {otherCall.token_symbol?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white">
                          ${otherCall.token_symbol || 'TOKEN'}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {otherCall.token_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    {otherCall.initial_price && otherCall.current_price && (
                      <div className={`text-2xl font-bold ${
                        otherROI >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'text-red-400'
                      } ${otherROI >= 0 ? 'bg-clip-text text-transparent' : ''}`}>
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
  )
}
