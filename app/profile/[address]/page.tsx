'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Profile } from '@/utils/supabaseClient'
import Link from 'next/link'

interface CallStats {
  total_calls: number
  avg_roi: number
  best_call_roi: number
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const address = params.address as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [calls, setCalls] = useState<any[]>([])
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
                const roi = (call.initial_price && call.initial_price > 0) ? 
                  formatROI(call.initial_price, call.current_price, call.ath_price) : 'N/A'
                const roiValue = (call.initial_price && call.initial_price > 0 && (call.ath_price || call.current_price)) ?
                  (((call.ath_price || call.current_price || 0) - call.initial_price) / call.initial_price) * 100 : null
                const timeAgo = new Date(call.created_at).toLocaleDateString()
                
                return (
                  <Link 
                    key={call.id}
                    href={`/call/${call.id}`}
                    className="block border-b border-gray-800 hover:bg-gray-900/40 transition-colors"
                  >
                    {/* User Profile Section with Banner Background */}
                    <div className="relative h-32 overflow-hidden">
                      {/* User's Banner as Background */}
                      {profile.banner_url ? (
                        <img 
                          src={profile.banner_url} 
                          alt="Profile banner" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-900/50 to-red-900/50" />
                      )}
                      
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
                      
                      {/* User Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                        {/* Avatar */}
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.alias || 'User'} 
                            className="w-12 h-12 rounded-full border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg font-bold border-2 border-white/30">
                            {profile.alias?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        
                        {/* User Name & Handle */}
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">
                            {profile.alias || 'Anonymous'}
                          </p>
                          <p className="text-white/70 text-xs">
                            @{profile.alias || address.slice(0, 8)}
                          </p>
                        </div>

                        {/* Date */}
                        <p className="text-white/60 text-xs">
                          {timeAgo}
                        </p>
                      </div>
                    </div>

                    {/* User Bio (if present) */}
                    {profile.bio && (
                      <div className="px-4 pt-3 pb-2 bg-gray-900/40 border-b border-gray-800/50">
                        <p className="text-sm text-gray-300">{profile.bio}</p>
                      </div>
                    )}

                    {/* Token Information Below Banner */}
                    <div className="p-4">
                      {/* Token Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {call.token_logo ? (
                            <img 
                              src={call.token_logo} 
                              alt={call.token_name || ''} 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">
                              {call.token_symbol?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              ${call.token_symbol || 'TOKEN'}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {call.token_name || 'Unknown Token'}
                            </p>
                          </div>
                        </div>
                        
                        {/* ROI Badge */}
                        {roi !== 'N/A' && roiValue !== null && (
                          <div className={`text-xl font-bold ${
                            roiValue >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {roi}
                          </div>
                        )}
                      </div>

                      {/* Thesis */}
                      {call.thesis && (
                        <p className="text-sm text-gray-300 mb-3 italic">
                          &ldquo;{call.thesis}&rdquo;
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex gap-4 text-xs text-gray-400">
                        {call.initial_mcap && (
                          <span>Entry: {formatMarketCap(call.initial_mcap)}</span>
                        )}
                        {call.current_price && (
                          <span>Current: ${call.current_price.toFixed(6)}</span>
                        )}
                        {call.ath_price && call.initial_price && call.initial_price > 0 && (
                          <span className="text-yellow-400">
                            ATH: {formatROI(call.initial_price, null, call.ath_price)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex mt-4 pt-3 border-t border-gray-700/50 space-x-6 text-gray-400 text-sm">
                        <button className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                          <span>👍</span>
                          <span>Buy</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            const shareUrl = `${window.location.origin}/call/${call.id}`
                            const shareText = `Check out ${profile.alias || 'this'}'s ${call.token_symbol} call ${roi !== 'N/A' ? `(${roi} ROI)` : ''} on Coin Call!`
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
                          }}
                          className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                        >
                          <span>🔁</span>
                          <span>Share</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                          <span>💬</span>
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  </Link>
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
