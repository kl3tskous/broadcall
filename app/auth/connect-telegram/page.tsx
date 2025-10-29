'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ConnectTelegramPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.authenticated) {
        // Not logged in - redirect to home
        router.push('/')
        return
      }

      setUser(data.user)

      // If already connected to Telegram, redirect to dashboard
      if (data.user.telegram_id) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    } catch (err) {
      console.error('Auth check error:', err)
      setError('Failed to verify authentication')
      setLoading(false)
    }
  }

  async function handleTelegramConnect() {
    try {
      // Generate connection token
      const response = await fetch('/api/telegram/generate-token', {
        method: 'POST',
        credentials: 'include', // IMPORTANT: Include cookies for session auth
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.status === 401) {
        // Session expired - redirect to login
        alert('Your session expired. Please log in again.')
        router.push('/')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate connection token')
      }

      const data = await response.json()
      const botUrl = data.bot_url

      // Open Telegram bot with token
      window.open(botUrl, '_blank')
      
      // Show waiting message
      const container = document.getElementById('telegram-login-container')
      if (container) {
        container.innerHTML = `
          <div class="text-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <div class="flex items-center justify-center gap-2 mb-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <p class="text-blue-400 font-medium">Waiting for Telegram connection...</p>
            </div>
            <p class="text-sm text-gray-400">Complete the verification in Telegram, then return here.</p>
          </div>
        `
      }

      // Start polling for connection status
      pollConnectionStatus()

    } catch (error) {
      console.error('Error connecting Telegram:', error)
      alert('Failed to connect Telegram. Please try again.')
    }
  }

  function pollConnectionStatus() {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (data.authenticated && data.user.telegram_id) {
          // Connected! Redirect to waitlist confirmation or dashboard
          clearInterval(interval)
          router.push('/waitlist/confirmed')
        }
      } catch (error) {
        console.error('Error polling connection status:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-xl">{error}</div>
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
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Welcome to BroadCall!
            </h1>
            <p className="text-xl text-gray-300">
              You're almost there, {user?.twitter_name || user?.twitter_username}
            </p>
          </div>

          {/* Twitter Profile Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center gap-6 mb-6">
              {user?.profile_image_url && (
                <Image
                  src={user.profile_image_url}
                  alt={user.twitter_name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{user?.twitter_name}</h2>
                <p className="text-gray-400">@{user?.twitter_username}</p>
              </div>
            </div>

            {user?.bio && (
              <p className="text-gray-300 mb-6">{user.bio}</p>
            )}

            <div className="flex items-center gap-2 text-green-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Twitter Connected</span>
            </div>
          </div>

          {/* Connect Telegram Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-blue-500/20 rounded-full mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.672c-.139.623-.506.775-1.023.483l-2.826-2.081-1.362 1.311c-.151.151-.277.277-.568.277l.203-2.883 5.256-4.747c.229-.203-.05-.316-.354-.113l-6.499 4.091-2.798-.874c-.609-.192-.621-.609.127-.903l10.933-4.213c.509-.184.953.122.787.903z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Connect Your Telegram</h2>
              <p className="text-gray-400 mb-6">
                Link your Telegram account to complete your BroadCall waitlist registration
              </p>
            </div>

            {/* Telegram Connect Button */}
            <div id="telegram-login-container" className="flex justify-center mb-6">
              <button
                onClick={handleTelegramConnect}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.672c-.139.623-.506.775-1.023.483l-2.826-2.081-1.362 1.311c-.151.151-.277.277-.568.277l.203-2.883 5.256-4.747c.229-.203-.05-.316-.354-.113l-6.499 4.091-2.798-.874c-.609-.192-.621-.609.127-.903l10.933-4.213c.509-.184.953.122.787.903z"/>
                </svg>
                <span className="text-lg">Connect Telegram</span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mb-6">
              Click the button above to open Telegram and complete your connection
            </p>

            <div className="text-center text-sm text-gray-500">
              By connecting Telegram, you agree to join the BroadCall waitlist
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="font-bold mb-2">Early Access</h3>
              <p className="text-sm text-gray-400">Get priority access to BroadCall</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl mb-2">📢</div>
              <h3 className="font-bold mb-2">Auto-Broadcast</h3>
              <p className="text-sm text-gray-400">Share calls to Telegram channels</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-bold mb-2">Track ROI</h3>
              <p className="text-sm text-gray-400">Monitor your call performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
