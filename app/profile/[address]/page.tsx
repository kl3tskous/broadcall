'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Profile } from '@/utils/supabaseClient'
import Link from 'next/link'
import EmbeddedChart from '@/components/EmbeddedChart'
import { platforms } from '@/components/PlatformLogos'

interface CallStats {
  total_calls: number
  avg_roi: number
  best_call_roi: number
}

interface UserSettings {
  gmgn_ref?: string
  axiom_ref?: string
  photon_ref?: string
  bullx_ref?: string
  trojan_ref?: string
}

const DEFAULT_GMGN_REF = 'cKHW_sol'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const address = params.address as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [calls, setCalls] = useState<any[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [stats, setStats] = useState<CallStats>({
    total_calls: 0,
    avg_roi: 0,
    best_call_roi: -Infinity
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'calls' | 'stats'>('calls')

  useEffect(() => {
    const fetchProfileAndCalls = async () => {
      if (!address) return

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', address)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch user settings for referral codes
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('gmgn_ref, axiom_ref, photon_ref, bullx_ref, trojan_ref')
          .eq('wallet_address', address)
          .single()

        if (settingsData) {
          setUserSettings(settingsData)
        }

        // Fetch user's calls
        const { data: callsData } = await supabase
          .from('calls')
          .select('*')
          .eq('creator_wallet', address)
          .order('created_at', { ascending: false })

        if (callsData) {
          setCalls(callsData)
          
          // Calculate stats
          const totalCalls = callsData.length
          let totalROI = 0
          let validCallsCount = 0
          let bestROI = -Infinity

          callsData.forEach(call => {
            if (call.initial_price) {
              // Use ATH price as fallback if current_price is not available
              const priceToUse = call.ath_price || call.current_price
              if (priceToUse) {
                const roi = ((priceToUse - call.initial_price) / call.initial_price) * 100
                totalROI += roi
                validCallsCount++
                if (roi > bestROI) bestROI = roi
              }
            }
          })

          setStats({
            total_calls: totalCalls,
            avg_roi: validCallsCount > 0 ? totalROI / validCallsCount : 0,
            best_call_roi: bestROI === -Infinity ? 0 : bestROI
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndCalls()
  }, [address])

  const formatROI = (initial: number, current: number | null | undefined, ath: number | null | undefined) => {
    // Use ATH as fallback if current price is not available
    const priceToUse = ath || current
    if (!priceToUse) return 'N/A'
    const roi = ((priceToUse - initial) / initial) * 100
    return roi >= 0 ? `+${roi.toFixed(1)}%` : `${roi.toFixed(1)}%`
  }

  const formatMarketCap = (mcap: number) => {
    if (mcap >= 1_000_000) return `$${(mcap / 1_000_000).toFixed(2)}M`
    if (mcap >= 1_000) return `$${(mcap / 1_000).toFixed(1)}K`
    return `$${mcap.toFixed(0)}`
  }

  const getPlatformUrl = (platformId: string, call: any) => {
    const tokenAddress = call.token_address
    
    switch (platformId) {
      case 'gmgn':
        const gmgnRef = call.gmgn_ref || userSettings?.gmgn_ref || DEFAULT_GMGN_REF
        return `https://gmgn.ai/sol/token/${gmgnRef}_${tokenAddress}`
      
      case 'axiom':
        const axiomRef = call.axiom_ref || userSettings?.axiom_ref || ''
        return axiomRef 
          ? `https://axiom.trade/t/${tokenAddress}/@${axiomRef}`
          : `https://axiom.trade/solana/${tokenAddress}`
      
      case 'photon':
        const photonRef = call.photon_ref || userSettings?.photon_ref || ''
        return photonRef
          ? `https://photon-sol.tinyastro.io/${photonRef}`
          : `https://photon-sol.tinyastro.io/en/lp/${tokenAddress}`
      
      case 'bullx':
        const bullxRef = call.bullx_ref || userSettings?.bullx_ref || ''
        return bullxRef
          ? `https://neo.bullx.io/p/${bullxRef}`
          : `https://bullx.io/terminal?chainId=1399811149&address=${tokenAddress}`
      
      case 'trojan':
        const trojanRef = call.trojan_ref || userSettings?.trojan_ref || ''
        return trojanRef
          ? `https://t.me/solana_trojanbot?start=r-${trojanRef}`
          : `https://t.me/solana_trojanbot`
      
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto text-center py-20">
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">This user hasn't set up their profile yet.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Profile Header with Banner */}
      <div className="profile-header relative">
        {/* Banner Image */}
        <div className="w-full h-[300px] bg-gradient-to-br from-orange-900/50 to-red-900/50 overflow-hidden">
          {profile.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              No banner
            </div>
          )}
        </div>

        {/* Avatar overlapping banner */}
        <div className="absolute bottom-[-60px] left-8">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.alias || 'User'} 
              className="w-28 h-28 rounded-full border-4 border-black"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-black bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl font-bold">
              {profile.alias?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="max-w-5xl mx-auto px-8 mt-20">
          <h1 className="text-3xl font-bold text-white">
            {profile.alias || 'Anonymous User'}
          </h1>
          <p className="text-gray-400">
            @{profile.alias || address.slice(0, 8)}
          </p>

          {profile.bio && (
            <p className="mt-3 text-gray-300 max-w-2xl">{profile.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex space-x-4 mt-4">
            {profile.twitter_handle && (
              <a 
                href={`https://x.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🐦</span>
              </a>
            )}
            {profile.telegram && (
              <a 
                href={`https://t.me/${profile.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">✈️</span>
              </a>
            )}
            {profile.website && (
              <a 
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <span className="text-xl">🌐</span>
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex space-x-6 text-sm">
            <span className="text-gray-400">
              <strong className="text-white">{stats.total_calls}</strong> Calls
            </span>
            <span className="text-gray-400">
              <strong className={`${stats.avg_roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.avg_roi >= 0 ? '+' : ''}{stats.avg_roi.toFixed(1)}%
              </strong> Avg ROI
            </span>
            {stats.best_call_roi !== 0 && (
              <span className="text-gray-400">
                <strong className={`${stats.best_call_roi > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {stats.best_call_roi > 0 ? '+' : ''}{stats.best_call_roi.toFixed(1)}%
                </strong> Best Call
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-700">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('calls')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'calls' 
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'stats' 
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Twitter/X Style Feed */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        {activeTab === 'calls' && (
          <div className="space-y-0 border-t border-gray-800">
            {calls.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No calls yet
              </div>
            ) : (
              calls.map((call) => {
                const timeAgo = new Date(call.created_at).toLocaleDateString()
                
                return (
                  <div 
                    key={call.id}
                    className="border-b border-gray-800 hover:bg-gray-900/40 transition-colors"
                  >
                    {/* User Info Header - clickable to call detail */}
                    <Link href={`/call/${call.id}`} className="block p-4 pb-0">
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.alias || 'User'} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">
                            {profile.alias?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">
                            {profile.alias || 'Anonymous'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Token Information with "shared @ X mcap" */}
                    <div className="px-4 pt-3">
                      <Link href={`/call/${call.id}`} className="block">
                        <div className="flex items-center gap-3 mb-2">
                          {call.token_logo ? (
                            <img 
                              src={call.token_logo} 
                              alt={call.token_name || ''} 
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-base font-bold">
                              {call.token_symbol?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {call.token_name || call.token_symbol || 'Unknown Token'}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {call.initial_mcap ? `shared @ ${formatMarketCap(call.initial_mcap)} mcap` : 'Token call'}
                            </p>
                          </div>
                        </div>

                        {/* Thesis */}
                        {call.thesis && (
                          <p className="text-sm text-gray-300 mb-3 mt-2">
                            {call.thesis}
                          </p>
                        )}
                      </Link>

                      {/* Embedded Chart */}
                      <div className="my-3">
                        <EmbeddedChart tokenAddress={call.token_address} />
                      </div>

                      {/* Platform Buy Buttons - direct links to platforms */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                        {platforms.map((platform) => {
                          const Logo = platform.Logo
                          const platformUrl = getPlatformUrl(platform.id, call)
                          return (
                            <button
                              key={platform.id}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (platformUrl) {
                                  window.open(platformUrl, '_blank', 'noopener,noreferrer')
                                }
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all shadow-lg hover:shadow-xl"
                            >
                              <Logo className="w-5 h-5" />
                              <span className="text-white font-bold text-sm">{platform.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-sm text-gray-400 mb-2">Total Calls</h3>
              <p className="text-3xl font-bold text-white">{stats.total_calls}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-sm text-gray-400 mb-2">Average ROI</h3>
              <p className={`text-3xl font-bold ${stats.avg_roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.avg_roi >= 0 ? '+' : ''}{stats.avg_roi.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-sm text-gray-400 mb-2">Best Call</h3>
              <p className={`text-3xl font-bold ${stats.best_call_roi >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {stats.best_call_roi >= 0 ? '+' : ''}{stats.best_call_roi.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
