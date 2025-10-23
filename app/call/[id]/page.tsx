'use client'

import { useEffect, useState, useRef } from 'react'
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

interface CallWithPrice extends Call {
  priceData?: TokenPrice | null
}

export default function CallPage() {
  const params = useParams()
  const id = params.id as string
  
  const [allCalls, setAllCalls] = useState<CallWithPrice[]>([])
  const [creatorSettings, setCreatorSettings] = useState<UserSettings | null>(null)
  const [creatorBanner, setCreatorBanner] = useState<string | null>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null)
  const [creatorAlias, setCreatorAlias] = useState<string | null>(null)
  const [creatorBio, setCreatorBio] = useState<string | null>(null)
  const [creatorWallet, setCreatorWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const callsRef = useRef<CallWithPrice[]>([])
  
  useEffect(() => {
    callsRef.current = allCalls
  }, [allCalls])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch call data using API endpoint (bypasses Supabase PostgREST cache)
        const callResponse = await fetch(`/api/calls/get?id=${id}`)
        const callResult = await callResponse.json()
        
        if (!callResult.success || !callResult.data) {
          throw new Error('Call not found')
        }

        const initialCall = callResult.data
        const creatorWalletAddr = initialCall.creator_wallet
        setCreatorWallet(creatorWalletAddr)

        // Fetch additional data in parallel
        const [settingsResponse, profileResponse, callsResponse] = await Promise.all([
          fetch(`/api/settings/get?wallet_address=${creatorWalletAddr}`),
          fetch(`/api/profile/get?wallet_address=${creatorWalletAddr}`),
          fetch(`/api/calls/get?wallet_address=${creatorWalletAddr}`)
        ])

        const [settingsResult, profileResult, callsResult] = await Promise.all([
          settingsResponse.json(),
          profileResponse.json(),
          callsResponse.json()
        ])

        if (settingsResult.success && settingsResult.data) {
          setCreatorSettings(settingsResult.data)
        }

        if (profileResult.success && profileResult.data) {
          setCreatorBanner(profileResult.data.banner_url || null)
          setCreatorAvatar(profileResult.data.avatar_url || null)
          setCreatorAlias(profileResult.data.alias || null)
          setCreatorBio(profileResult.data.bio || null)
        }

        if (callsResult.success && callsResult.data) {
          setAllCalls(callsResult.data)
        }

        setLoading(false)

        // Update views count
        const updatedViews = (initialCall.views || 0) + 1
        supabase
          .from('calls')
          .update({ views: updatedViews })
          .eq('id', id)
          .then(({ error: updateError }) => {
            if (updateError) {
              console.error('Error updating views:', updateError)
            }
          })
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    const fetchPrices = async () => {
      const currentCalls = callsRef.current
      if (currentCalls.length === 0) return

      const pricePromises = currentCalls.map(async (call) => {
        if (!call.token_address) return { ...call, priceData: null }

        try {
          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${call.token_address}`
          )
          const data = await response.json()

          if (data.pairs && data.pairs.length > 0) {
            const mainPair = data.pairs[0]
            const priceData: TokenPrice = {
              priceUsd: mainPair.priceUsd || '0',
              priceChange24h: mainPair.priceChange?.h24 || 0,
              liquidity: mainPair.liquidity?.usd || 0,
              volume24h: mainPair.volume?.h24 || 0,
              marketCap: mainPair.fdv || 0,
              pairAddress: mainPair.pairAddress,
              dexId: mainPair.dexId
            }

            if (call.initial_price) {
              const currentPrice = parseFloat(mainPair.priceUsd)
              const currentMcap = mainPair.fdv || 0
              const shouldUpdateATH = !call.ath_price || currentPrice > call.ath_price

              const updates = shouldUpdateATH
                ? {
                    current_price: currentPrice,
                    current_mcap: currentMcap,
                    ath_price: currentPrice,
                    ath_mcap: currentMcap
                  }
                : {
                    current_price: currentPrice,
                    current_mcap: currentMcap,
                  }

              await supabase
                .from('calls')
                .update(updates)
                .eq('id', call.id)

              return {
                ...call,
                ...updates,
                priceData
              }
            }

            return { ...call, priceData }
          }
        } catch (error) {
          console.error(`Error fetching price for ${call.token_symbol}:`, error)
        }

        return { ...call, priceData: null }
      })

      const callsWithPrices = await Promise.all(pricePromises)
      setAllCalls(callsWithPrices)
    }

    if (allCalls.length > 0) {
      fetchPrices()
    }
    
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [allCalls.length])

  const getPlatformUrl = (call: Call, platformId: string) => {
    const tokenAddress = call.token_address
    
    // Default BroadCall referral codes (fallback when user hasn't set their own)
    const DEFAULT_AXIOM_REF = 'BROADCALL' // TODO: Replace with actual BroadCall ref code
    const DEFAULT_BULLX_REF = 'BROADCALL' // TODO: Replace with actual BroadCall ref code
    
    switch (platformId) {
      case 'gmgn':
        const gmgnRef = call.gmgn_ref || creatorSettings?.gmgn_ref || DEFAULT_GMGN_REF
        return `https://gmgn.ai/sol/token/${gmgnRef}_${tokenAddress}`
      
      case 'axiom':
        const axiomRef = call.axiom_ref || creatorSettings?.axiom_ref || DEFAULT_AXIOM_REF
        return `https://axiom.trade/t/${tokenAddress}/@${axiomRef}`
      
      case 'photon':
        const photonRef = call.photon_ref || creatorSettings?.photon_ref || ''
        return photonRef
          ? `https://photon-sol.tinyastro.io/en/lp/${tokenAddress}?ref=${photonRef}`
          : `https://photon-sol.tinyastro.io/en/lp/${tokenAddress}`
      
      case 'bullx':
        const bullxRef = call.bullx_ref || creatorSettings?.bullx_ref || DEFAULT_BULLX_REF
        return `https://neo.bullx.io/terminal?chainId=1399811149&address=${tokenAddress}&r=${bullxRef}&l=en&r=${bullxRef}`
      
      case 'trojan':
        const trojanRef = call.trojan_ref || creatorSettings?.trojan_ref || ''
        return trojanRef
          ? `https://trojan.bot/trade/${tokenAddress}?ref=${trojanRef}`
          : `https://trojan.bot/trade/${tokenAddress}`
      
      default:
        return ''
    }
  }

  const handlePlatformClick = async (call: Call, platformId: string) => {
    const url = getPlatformUrl(call, platformId)
    if (!url) return

    const updatedClicks = (call.clicks || 0) + 1
    setAllCalls(prev => prev.map(c => c.id === call.id ? { ...c, clicks: updatedClicks } : c))

    window.open(url, '_blank', 'noopener,noreferrer')

    supabase
      .from('calls')
      .update({ clicks: updatedClicks })
      .eq('id', call.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating clicks:', error)
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

  if (allCalls.length === 0) {
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

  const latestCall = allCalls[0]
  const previousCalls = allCalls.slice(1)

  const renderCallCard = (call: CallWithPrice, isHero: boolean = false) => {
    const roi = call.initial_price && call.current_price 
      ? calculateROI(call.initial_price, call.current_price)
      : 0

    return (
      <div 
        key={call.id}
        className={`relative bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] shadow-[0px_4px_6px_rgba(0,0,0,0.38)] ${
          isHero ? 'p-6 md:p-8 mb-8' : 'p-6 mb-6'
        }`}
      >
        {/* Token Logo - Top Right */}
        <div className={`absolute ${isHero ? 'top-6 right-6 md:top-8 md:right-8' : 'top-6 right-6'}`}>
          {call.token_logo ? (
            <img 
              src={call.token_logo} 
              alt={call.token_symbol || 'Token'} 
              className={`rounded-xl shadow-lg ${isHero ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16'}`}
            />
          ) : (
            <div className={`rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold shadow-lg ${
              isHero ? 'w-20 h-20 md:w-24 md:h-24 text-3xl' : 'w-16 h-16 text-2xl'
            }`}>
              {call.token_symbol?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* Called: Token Name & ROI */}
        <div className="mb-6">
          <div className={`${isHero ? 'text-2xl md:text-3xl' : 'text-xl'} font-bold text-white mb-2 flex items-center gap-2`}>
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Called:
            </span>
            <span>${call.token_symbol || 'TOKEN'}</span>
          </div>
          <p className={`${isHero ? 'text-base md:text-lg' : 'text-sm'} text-gray-400 mb-3`}>
            And it's {roi >= 0 ? 'UP' : 'DOWN'} by
          </p>
          {call.initial_price && call.current_price && (
            <div className={`font-black ${
              roi >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'text-red-500'
            } ${roi >= 0 ? 'bg-clip-text text-transparent' : ''} ${
              isHero ? 'text-5xl md:text-7xl' : 'text-4xl'
            }`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
            </div>
          )}
        </div>

        {/* Platform Buttons */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {platforms.map((platform) => {
              const Logo = platform.Logo
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(call, platform.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center gap-2 bg-white/[0.12] border border-white/20 backdrop-blur-[20px] hover:bg-white/[0.18] rounded-[28px] transition-all shadow-[0px_4px_6px_rgba(0,0,0,0.38)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.5)] ${
                    isHero ? 'w-28 h-28 md:w-32 md:h-32' : 'w-24 h-24'
                  }`}
                >
                  <Logo className={isHero ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8'} />
                  <span className="text-white font-extrabold text-xs">{platform.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart */}
        {call.priceData?.pairAddress && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://dexscreener.com/solana/${call.priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
              className={`w-full border-0 ${isHero ? 'h-[280px] md:h-[350px]' : 'h-[250px]'}`}
              style={{ background: 'transparent' }}
            />
          </div>
        )}

        {/* Market Cap Info */}
        {call.priceData?.marketCap && (
          <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
            <span>Marketcap when called:</span>
            <span className="text-green-400 font-bold">
              ${formatMarketCap(call.initial_mcap || 0)}
            </span>
          </div>
        )}

        {/* Thesis */}
        {call.thesis && (
          <div className="bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl p-4">
            <p className="text-gray-300 text-sm italic">&ldquo;{call.thesis}&rdquo;</p>
          </div>
        )}
      </div>
    )
  }

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
      <CallPageHeader />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        
        {/* KOL Profile Banner Section */}
        <div className="mb-8 relative">
          {/* Banner Image */}
          <div 
            className="w-full h-48 md:h-64 rounded-[34px] md:rounded-[51px] overflow-hidden bg-gradient-to-br from-orange-500/20 to-purple-600/20"
            style={{
              backgroundImage: creatorBanner ? `url(${creatorBanner})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Avatar Overlay - positioned to overlap banner */}
          <div className="absolute bottom-0 left-6 md:left-8 z-20" style={{ transform: 'translateY(50%)' }}>
            {creatorAvatar ? (
              <img 
                src={creatorAvatar} 
                alt={creatorAlias || 'User'} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl"
                style={{
                  border: '4px solid transparent',
                  backgroundImage: 'linear-gradient(black, black), linear-gradient(135deg, #ff8800, #ff4400)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              />
            ) : (
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-4xl md:text-5xl font-bold shadow-2xl"
                style={{
                  border: '4px solid transparent',
                  backgroundImage: 'linear-gradient(135deg, #ff5722, #ff9800), linear-gradient(135deg, #ff8800, #ff4400)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
                {creatorAlias?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-16 md:mt-20 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Link 
                href={`/profile/${creatorWallet}`}
                className="text-2xl md:text-3xl font-black text-white hover:underline flex items-center gap-2"
              >
                @{creatorAlias || 'Anonymous'}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </Link>
            </div>

            {/* Bio */}
            {creatorBio && (
              <p className="text-gray-300 text-base md:text-lg mb-4 max-w-2xl">
                {creatorBio}
              </p>
            )}

            {/* Trades In Label */}
            {creatorSettings && (
              <div className="bg-white/[0.08] border border-white/12 rounded-2xl px-4 py-2 inline-block">
                <span className="text-gray-400 text-sm">Trades in: </span>
                <span className="text-orange-400 font-bold text-sm">
                  @{creatorAlias || 'Anonymous'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Latest Call - Hero Card */}
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-4">Latest Call</h2>
          {renderCallCard(latestCall, true)}
        </div>

        {/* Previous Calls */}
        {previousCalls.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-4">Previous Calls</h2>
            {previousCalls.map((call) => (
              <div key={call.id} className="relative">
                {renderCallCard(call, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
