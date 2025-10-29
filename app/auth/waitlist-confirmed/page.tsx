'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function WaitlistConfirmedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.authenticated) {
        router.push('/')
        return
      }

      // If not on waitlist yet, redirect to connect telegram
      if (!data.user.joined_waitlist) {
        router.push('/auth/connect-telegram')
        return
      }

      setUser(data.user)
      setLoading(false)
    } catch (err) {
      console.error('Auth check error:', err)
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-3xl w-full text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="inline-block p-6 bg-green-500/20 rounded-full mb-6 animate-bounce">
              <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            You're In!
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Welcome to the BroadCall Waitlist
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            You've successfully joined the waitlist with both your X (Twitter) and Telegram accounts.
            We'll notify you on Telegram when you get access to the platform.
          </p>

          {/* Connected Accounts Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Connected Accounts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter Card */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{user?.twitter_name}</span>
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">@{user?.twitter_username}</p>
                  </div>
                </div>
              </div>

              {/* Telegram Card */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.672c-.139.623-.506.775-1.023.483l-2.826-2.081-1.362 1.311c-.151.151-.277.277-.568.277l.203-2.883 5.256-4.747c.229-.203-.05-.316-.354-.113l-6.499 4.091-2.798-.874c-.609-.192-.621-.609.127-.903l10.933-4.213c.509-.184.953.122.787.903z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">Telegram</span>
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">
                      {user?.telegram_username ? `@${user.telegram_username}` : 'Connected'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Access Status */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-orange-500/30">
            <h3 className="text-xl font-bold mb-4">Access Status</h3>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/20 rounded-full border border-orange-500/50">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-orange-300">
                {user?.access_granted ? 'Access Granted!' : 'Awaiting Access'}
              </span>
            </div>
            {!user?.access_granted && (
              <p className="text-gray-400 mt-4">
                We'll notify you on Telegram when your access is granted
              </p>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.access_granted ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/"
                className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-full font-bold text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Back to Home
              </Link>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-16 text-left max-w-xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Get Notified</h4>
                  <p className="text-sm text-gray-400">
                    We'll send you a message on Telegram when access is granted
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">Connect Wallet</h4>
                  <p className="text-sm text-gray-400">
                    Once you have access, connect your Solana wallet to start creating calls
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Share Your Calls</h4>
                  <p className="text-sm text-gray-400">
                    Create token calls and broadcast them to your Telegram channels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
