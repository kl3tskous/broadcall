'use client'

import React, { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

interface OnboardingFlowProps {
  walletAddress: string
  onComplete: () => void
}

export default function OnboardingFlow({ walletAddress, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [refCodes, setRefCodes] = useState({
    gmgn_ref: '',
    axiom_ref: '',
    photon_ref: '',
    bullx_ref: '',
    trojan_ref: ''
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          wallet_address: walletAddress,
          ...refCodes,
          onboarded: true
        })

      if (error) throw error

      onComplete()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          wallet_address: walletAddress,
          onboarded: true
        })

      if (error) throw error

      onComplete()
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      alert('Failed to complete setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-2xl w-full">
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Welcome to Coin Call Platform! 🚀
            </h1>
            <p className="text-gray-300 mb-6 text-lg">
              Share your Solana token calls and earn through referrals
            </p>

            <div className="bg-dark-bg p-6 rounded-lg mb-8 text-left space-y-4">
              <h2 className="text-xl font-bold mb-4">How It Works:</h2>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Set Up Your Referral Codes</h3>
                  <p className="text-gray-400 text-sm">
                    Add your referral codes from trading platforms (GMGN, Axiom, Photon, BullX, Trojan)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Token Calls</h3>
                  <p className="text-gray-400 text-sm">
                    Share Solana token addresses with your thesis and get a shareable link
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Share & Earn</h3>
                  <p className="text-gray-400 text-sm">
                    When people click your links and trade, you earn referral rewards automatically
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Performance</h3>
                  <p className="text-gray-400 text-sm">
                    Monitor views and clicks on your calls to see engagement
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Get Started →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Set Up Your Referral Codes</h2>
            <p className="text-gray-400 mb-6">
              Add your referral codes from each platform. These will be automatically attached to all your token calls.
              You can always update these later in settings.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-purple-400">●</span> GMGN Referral Code
                </label>
                <input
                  type="text"
                  value={refCodes.gmgn_ref}
                  onChange={(e) => setRefCodes({ ...refCodes, gmgn_ref: e.target.value })}
                  placeholder="Your GMGN ref code (e.g., 7rpqjHdf)"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-pink-400">●</span> Axiom Referral Code
                </label>
                <input
                  type="text"
                  value={refCodes.axiom_ref}
                  onChange={(e) => setRefCodes({ ...refCodes, axiom_ref: e.target.value })}
                  placeholder="Your Axiom ref code"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-purple-400">●</span> Photon Referral Code
                </label>
                <input
                  type="text"
                  value={refCodes.photon_ref}
                  onChange={(e) => setRefCodes({ ...refCodes, photon_ref: e.target.value })}
                  placeholder="Your Photon ref code"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-pink-400">●</span> BullX Referral Code
                </label>
                <input
                  type="text"
                  value={refCodes.bullx_ref}
                  onChange={(e) => setRefCodes({ ...refCodes, bullx_ref: e.target.value })}
                  placeholder="Your BullX ref code"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-purple-400">●</span> Trojan Referral Code
                </label>
                <input
                  type="text"
                  value={refCodes.trojan_ref}
                  onChange={(e) => setRefCodes({ ...refCodes, trojan_ref: e.target.value })}
                  placeholder="Your Trojan ref code"
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              💡 Don't have referral codes? You can add them later in settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
