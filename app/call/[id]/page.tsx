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
        const callResponse = await fetch(`/api/calls/get?id=${id}`)
        const callResult = await callResponse.json()
        
        if (!callResult.success || !callResult.data) {
          throw new Error('Call not found')
        }

        const initialCall = callResult.data
        const creatorWalletAddr = initialCall.creator_wallet
        setCreatorWallet(creatorWalletAddr)

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

            if (call.price_at_call) {
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
    
    const DEFAULT_AXIOM_REF = 'BROADCALL'
    const DEFAULT_BULLX_REF = 'BROADCALL'
    
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
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black"
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
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-[40px] p-8 shadow-lg text-center relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-white">Call Not Found</h2>
          <p className="text-gray-300">This call doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const latestCall = allCalls[0]
  const previousCalls = allCalls.slice(1)
  
  const roi = latestCall.price_at_call && latestCall.current_price 
    ? calculateROI(parseFloat(latestCall.price_at_call), parseFloat(latestCall.current_price))
    : 0

  return (
    <main 
      className="relative min-h-screen overflow-hidden bg-black"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient Blobs */}
      <div className="size-[767px] left-[590px] top-[1105px] absolute bg-gradient-to-l from-orange-600/70 via-orange-500/70 to-amber-500/70 rounded-full blur-[300px]" />
      <div className="w-[901px] h-[720px] left-[26px] top-[-548px] absolute bg-emerald-400/50 rounded-full blur-[300px]" />
      <div className="size-64 left-[839px] top-[1326px] absolute bg-gradient-to-b from-purple-800 to-amber-700/0 rounded-full blur-[300px]" />

      <CallPageHeader />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:px-8">
        
        {/* Banner Image */}
        <img 
          className="w-full h-64 md:h-80 rounded-[40px] md:rounded-[51px] border-2 border-orange-600 object-cover mb-6" 
          src={creatorBanner || 'https://placehold.co/1271x312'} 
          alt="Banner"
        />

        {/* Main Content Card */}
        <div className="relative bg-white/10 rounded-[40px] border-2 border-white/10 p-6 md:p-8 mb-8">
          
          {/* User Profile Section */}
          <div className="flex items-start gap-4 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="size-32 md:size-36 bg-white/10 rounded-full border-2 border-orange-600 backdrop-blur-[10px] overflow-hidden">
                <img 
                  className="size-full rounded-full object-cover" 
                  src={creatorAvatar || 'https://placehold.co/146x146'} 
                  alt={creatorAlias || 'User'}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-gradient-to-l from-orange-600 via-orange-500 to-amber-500 rounded-full" />
                <h1 className="text-2xl md:text-4xl font-extrabold text-white">
                  {creatorAlias || 'Anonymous'}
                </h1>
              </div>
              <p className="text-base md:text-xl text-white/80 font-light opacity-60 mb-4">
                @{creatorAlias || 'anonymous'}
              </p>
              
              {/* Thesis */}
              {latestCall.thesis && (
                <div className="bg-white/10 rounded-2xl border border-white/10 p-4 mb-4">
                  <p className="text-white text-xl font-bold leading-4 mb-2">Thesis:</p>
                  <p className="text-white/80 text-sm font-normal leading-3">
                    &ldquo;{latestCall.thesis}&rdquo;
                  </p>
                </div>
              )}

              {/* Trades In */}
              {creatorSettings && (
                <div className="inline-block bg-white/10 rounded-2xl border border-white/10 px-4 py-3">
                  <span className="text-white text-xl font-extrabold">Trades in: </span>
                  <span className="text-orange-600 text-xl font-extrabold">
                    @{creatorAlias || 'anonymous'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Token Call Info */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            {/* Left: Called Token */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-extrabold text-orange-600">Called:</span>
                <span className="text-4xl font-extrabold text-white">
                  ${latestCall.token_symbol || 'TOKEN'}
                </span>
              </div>
              
              <p className="text-white/80 text-xl font-extrabold opacity-60 mb-2">
                And it's <span className="text-emerald-400">{roi >= 0 ? 'UP' : 'DOWN'}</span> by
              </p>
              
              {latestCall.price_at_call && latestCall.current_price && (
                <div className={`text-5xl md:text-6xl font-bold ${
                  roi >= 0 ? 'text-emerald-400' : 'text-red-500'
                }`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
                </div>
              )}
            </div>

            {/* Right: Market Cap & Chart Preview */}
            <div className="relative">
              {/* Market Cap Badge */}
              <div className="absolute top-0 right-0 z-10 bg-orange-600/80 rounded-md border border-white/10 px-4 py-1">
                <p className="text-white text-sm font-bold">
                  ${formatMarketCap(latestCall.market_cap_at_call || 0)}
                </p>
              </div>

              {/* Chart Preview */}
              <div className="relative bg-white/10 rounded-[40px] backdrop-blur-[10px] overflow-hidden border-2 border-orange-600 w-full md:w-56">
                {latestCall.priceData?.pairAddress && (
                  <iframe
                    src={`https://dexscreener.com/solana/${latestCall.priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-40 border-0"
                    style={{ background: 'transparent' }}
                  />
                )}
              </div>

              {/* Marketcap Stats */}
              <div className="mt-4 text-center">
                <p className="text-white text-base font-extrabold mb-1">
                  Marketcap when called:
                </p>
                <p className="text-emerald-400 text-xl font-extrabold">
                  ${formatMarketCap(latestCall.market_cap_at_call || 0)} ({calculateMultiplier(latestCall.market_cap_at_call || 0, latestCall.current_mcap || 0).toFixed(2)}x)
                </p>
              </div>
            </div>
          </div>

          {/* Platform Trading Buttons */}
          <div className="flex gap-4 flex-wrap justify-center md:justify-start">
            {platforms.map((platform) => {
              const Logo = platform.Logo
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(latestCall, platform.id)}
                  className={`bg-white/10 rounded-[20px] backdrop-blur-[20px] hover:bg-white/[0.18] transition-all shadow-lg hover:shadow-xl size-20 flex items-center justify-center ${
                    platform.id === 'gmgn' || platform.id === 'bullx' ? 'border-2 border-orange-600' : ''
                  }`}
                >
                  <Logo className="w-10 h-10" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Full DexScreener Chart */}
        {latestCall.priceData?.pairAddress && (
          <div className="relative bg-gradient-to-b from-orange-600/25 to-stone-500/0 rounded-[40px] border-2 border-orange-600 overflow-hidden mb-8">
            <iframe
              src={`https://dexscreener.com/solana/${latestCall.priceData.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
              className="w-full h-[280px] md:h-96 border-0"
              style={{ background: 'transparent' }}
            />
          </div>
        )}

        {/* Previous Calls */}
        {previousCalls.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-300">Previous Calls</h2>
            {previousCalls.map((call) => {
              const callRoi = call.price_at_call && call.current_price 
                ? calculateROI(parseFloat(call.price_at_call), parseFloat(call.current_price))
                : 0

              return (
                <div 
                  key={call.id}
                  className="relative bg-white/10 rounded-[40px] border border-white/10 p-6"
                >
                  {/* Token Logo */}
                  <div className="absolute top-6 right-6">
                    {call.token_logo ? (
                      <img 
                        src={call.token_logo} 
                        alt={call.token_symbol || 'Token'} 
                        className="size-16 rounded-xl shadow-lg"
                      />
                    ) : (
                      <div className="size-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-2xl">
                        {call.token_symbol?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-orange-600">Called:</span>
                    <span className="text-2xl font-bold text-white">${call.token_symbol || 'TOKEN'}</span>
                  </div>

                  <p className="text-white/80 text-base opacity-60 mb-2">
                    And it's <span className="text-emerald-400">{callRoi >= 0 ? 'UP' : 'DOWN'}</span> by
                  </p>

                  {call.price_at_call && call.current_price && (
                    <div className={`text-4xl font-bold mb-4 ${
                      callRoi >= 0 ? 'text-emerald-400' : 'text-red-500'
                    }`}>
                      {callRoi >= 0 ? '+' : ''}{callRoi.toFixed(0)}%
                    </div>
                  )}

                  {/* Thesis */}
                  {call.thesis && (
                    <div className="bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl p-4 mb-4">
                      <p className="text-gray-300 text-sm italic">&ldquo;{call.thesis}&rdquo;</p>
                    </div>
                  )}

                  {/* Platform Buttons */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {platforms.map((platform) => {
                      const Logo = platform.Logo
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handlePlatformClick(call, platform.id)}
                          className="flex-shrink-0 bg-white/10 rounded-[20px] backdrop-blur-[20px] hover:bg-white/[0.18] transition-all shadow-lg size-20 flex items-center justify-center"
                        >
                          <Logo className="w-8 h-8" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
