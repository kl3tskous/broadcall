'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  twitter_username: string
  twitter_name: string
  profile_image_url: string
  access_granted: boolean
  joined_waitlist: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (!data.authenticated) {
          router.push('/')
          return
        }

        setUser(data.user)

        if (!data.user.access_granted) {
          router.push('/auth/waitlist-confirmed')
          return
        }

        const settingsResponse = await fetch('/api/settings/get')
        const settingsData = await settingsResponse.json()
        
        if (settingsResponse.ok && settingsData.settings && !settingsData.settings.onboarded) {
          router.push('/onboarding')
          return
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className="min-h-screen relative" 
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/broadCall-logo.png"
                  alt="BroadCall"
                  width={180}
                  height={180}
                  className="h-9 w-auto"
                  priority
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/dashboard"
                  className="text-sm text-white font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.profile_image_url && (
                    <Image
                      src={user.profile_image_url}
                      alt={user.twitter_name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-white text-sm hidden md:block">
                    @{user.twitter_username}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome, {user.twitter_name}! 🎉
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              You've been granted access to BroadCall. Start creating your first token call!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Call Card */}
              <Link
                href="/create-call"
                className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 hover:bg-gradient-to-br hover:from-orange-500/30 hover:to-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create Call</h2>
                </div>
                <p className="text-gray-300">
                  Share a new token call with your followers and start earning from your alpha.
                </p>
              </Link>

              {/* Settings Card */}
              <Link
                href="/settings"
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                </div>
                <p className="text-gray-300">
                  Manage your profile, referral codes, and Telegram integration.
                </p>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Twitter Account</p>
                  <p className="text-white font-semibold">@{user.twitter_username}</p>
                </div>
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Access Status</p>
                  <p className="text-green-400 font-semibold">✅ Granted</p>
                </div>
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Platform</p>
                  <p className="text-white font-semibold">BroadCall Beta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
