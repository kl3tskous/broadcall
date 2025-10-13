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
                  <div 
                    key={call.id}
                    className="flex p-4 border-b border-gray-800 hover:bg-gray-900/40 transition-colors"
                  >
                    {/* User Avatar on Left */}
                    <Link href={`/profile/${call.creator_wallet}`} className="flex-shrink-0">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.alias || 'User'} 
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg font-bold">
                          {profile.alias?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </Link>

                    {/* Post Content on Right */}
                    <div className="flex-1 ml-3">
                      {/* Header: Token Name & Meta */}
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/call/${call.id}`}>
                            <h3 className="text-lg font-bold text-white hover:underline">
                              ${call.token_symbol || 'TOKEN'}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-400">
                            Called by @{profile.alias || address.slice(0, 8)} · {timeAgo}
                          </p>
                        </div>
                        {roi !== 'N/A' && roiValue !== null && (
                          <span className={`text-lg font-semibold ${
                            roiValue >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {roi}
                          </span>
                        )}
                      </div>

                      {/* Thesis */}
                      {call.thesis && (
                        <p className="mt-2 text-gray-300 text-sm">
                          {call.thesis}
                        </p>
                      )}

                      {/* Performance Banner Thumbnail */}
                      <Link href={`/call/${call.id}`} className="block mt-3">
                        <div className="rounded-lg overflow-hidden relative">
                          {/* Ape Banner Background */}
                          <div className="w-full h-40 bg-gradient-to-br from-orange-500 to-red-600 relative">
                            <img 
                              src="/banner-ape-chill.webp" 
                              alt="Token banner" 
                              className="w-full h-full object-cover"
                            />
                            {/* Gradient overlay for text */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                            
                            {/* Stats Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-sm text-white">
                              <div className="flex justify-between items-center">
                                <div>
                                  Entry: {call.initial_mcap ? formatMarketCap(call.initial_mcap) : 'N/A'}
                                </div>
                                {(call.current_price || call.ath_price) && (
                                  <div>
                                    Current: {call.current_price ? `$${call.current_price.toFixed(6)}` : 'N/A'}
                                  </div>
                                )}
                                {call.ath_price && call.initial_price && call.initial_price > 0 && (
                                  <div className="text-yellow-400">
                                    ATH: {formatROI(call.initial_price, null, call.ath_price)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex mt-3 space-x-6 text-gray-400">
                        <Link 
                          href={`/call/${call.id}`}
                          className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                        >
                          <span className="text-lg">👍</span>
                          <span className="text-sm">Buy</span>
                        </Link>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            const shareUrl = `${window.location.origin}/call/${call.id}`
                            const shareText = `Check out my ${call.token_symbol} call ${roi !== 'N/A' ? `(${roi} ROI)` : ''} on Coin Call!`
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
                          }}
                          className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                        >
                          <span className="text-lg">🔁</span>
                          <span className="text-sm">Share</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                          <span className="text-lg">💬</span>
                          <span className="text-sm">Comment</span>
                        </button>
                        <button className="ml-auto hover:text-orange-400 transition-colors">
                          <span className="text-lg">⋯</span>
                        </button>
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
