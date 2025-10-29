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

  useEffect(() => {
    // Load Telegram Login Widget after component mounts
    if (user && !user.telegram_id) {
      loadTelegramWidget()
    }
  }, [user])

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

  function loadTelegramWidget() {
    // Remove existing script if any
    const existingScript = document.getElementById('telegram-widget-script')
    if (existingScript) {
      existingScript.remove()
    }

    // Create and load the Telegram widget script
    const script = document.createElement('script')
    script.id = 'telegram-widget-script'
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'Broadcall_Bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '10')
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram/callback`)
    script.setAttribute('data-request-access', 'write')

    const container = document.getElementById('telegram-login-container')
    if (container) {
      container.innerHTML = '' // Clear container
      container.appendChild(script)
    }
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
              {/* Telegram Login Widget will be inserted here */}
            </div>

            {/* Manual Telegram Link (Fallback for mobile) */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-3">Or click here to connect via Telegram:</p>
              <a
                href={`https://t.me/Broadcall_Bot?start=connect`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.672c-.139.623-.506.775-1.023.483l-2.826-2.081-1.362 1.311c-.151.151-.277.277-.568.277l.203-2.883 5.256-4.747c.229-.203-.05-.316-.354-.113l-6.499 4.091-2.798-.874c-.609-.192-.621-.609.127-.903l10.933-4.213c.509-.184.953.122.787.903z"/>
                </svg>
                Connect Telegram
              </a>
            </div>

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
