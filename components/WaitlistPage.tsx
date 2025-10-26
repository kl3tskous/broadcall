'use client'

import { useState } from 'react'
import { GmgnLogo, AxiomLogo, PhotonLogo, BullxLogo, TrojanLogo, DexScreenerLogo } from './PlatformLogos'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [telegram, setTelegram] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          telegram_handle: telegram
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main 
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Logo/Title */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              BroadCall
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-medium">
              The Ultimate Token Call Platform for Solana Influencers
            </p>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 mt-12">
            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[24px] p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Performance</h3>
              <p className="text-gray-300 text-sm">Auto-updating ROI, ATH, and multiplier stats for every call</p>
            </div>

            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[24px] p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Monetize Your Calls</h3>
              <p className="text-gray-300 text-sm">Attach referral codes from 6 major trading platforms</p>
            </div>

            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[24px] p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">Broadcast to Telegram</h3>
              <p className="text-gray-300 text-sm">Automatically share calls to your channels with buy buttons</p>
            </div>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="w-full max-w-md">
          {!submitted ? (
            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Join the Waitlist</h2>
              <p className="text-gray-300 text-center mb-6">Be the first to know when we launch!</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-white/[0.08] border border-white/20 rounded-[16px] text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@telegram (optional)"
                    className="w-full px-4 py-3 bg-white/[0.08] border border-white/20 rounded-[16px] text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-[16px] p-3 text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-[16px] hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h2>
              <p className="text-gray-300">We&apos;ll notify you as soon as BroadCall launches.</p>
            </div>
          )}
        </div>

        {/* Supported Platforms */}
        <div className="mt-16 max-w-4xl mx-auto">
          <p className="text-gray-400 text-center mb-6 text-sm">Integrated with leading trading platforms:</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <div className="w-24 h-8 flex items-center justify-center">
              <GmgnLogo className="w-full h-full" />
            </div>
            <div className="w-24 h-8 flex items-center justify-center">
              <AxiomLogo className="w-full h-full" />
            </div>
            <div className="w-24 h-8 flex items-center justify-center">
              <PhotonLogo className="w-full h-full" />
            </div>
            <div className="w-24 h-8 flex items-center justify-center">
              <BullxLogo className="w-full h-full" />
            </div>
            <div className="w-24 h-8 flex items-center justify-center">
              <TrojanLogo className="w-full h-full" />
            </div>
            <div className="w-24 h-8 flex items-center justify-center">
              <DexScreenerLogo className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center text-gray-400 text-sm">
        <p>© 2025 BroadCall. All rights reserved.</p>
      </div>
    </main>
  )
}
