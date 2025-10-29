'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

      if (!data.user.telegram_id) {
        // Not connected to Telegram yet, redirect back
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
        <div className="max-w-2xl w-full text-center">
          {/* Success Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            You're On The List!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Welcome to the BroadCall waitlist, {user?.twitter_name || user?.twitter_username}!
          </p>

          {/* Connected Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {/* Twitter Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="font-bold">Twitter Connected</span>
              </div>
              <p className="text-gray-400">@{user?.twitter_username}</p>
            </div>

            {/* Telegram Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.672c-.139.623-.506.775-1.023.483l-2.826-2.081-1.362 1.311c-.151.151-.277.277-.568.277l.203-2.883 5.256-4.747c.229-.203-.05-.316-.354-.113l-6.499 4.091-2.798-.874c-.609-.192-.621-.609.127-.903l10.933-4.213c.509-.184.953.122.787.903z"/>
                </svg>
                <span className="font-bold">Telegram Connected</span>
              </div>
              <p className="text-gray-400">{user?.telegram_username || 'Connected'}</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold mb-4">What Happens Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold mb-1">We'll Review Your Application</h3>
                  <p className="text-gray-400 text-sm">Our team reviews all waitlist applications to ensure quality.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold mb-1">Get Notified on Telegram</h3>
                  <p className="text-gray-400 text-sm">We'll message you directly on Telegram when you're approved!</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold mb-1">Start Broadcasting Calls</h3>
                  <p className="text-gray-400 text-sm">Create token calls and earn from your referrals!</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
