'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { CallForm } from '@/components/CallForm'
import OnboardingFlow from '@/components/OnboardingFlow'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(true)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!publicKey) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (!data || !data.onboarded) {
          setShowOnboarding(true)
        } else {
          setUserSettings(data)
        }
      } catch (error) {
        console.error('Error checking onboarding:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [publicKey])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    window.location.reload()
  }

  if (publicKey && showOnboarding) {
    return <OnboardingFlow walletAddress={publicKey.toString()} onComplete={handleOnboardingComplete} />
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Coin Call Platform
          </h1>
          <p className="text-gray-400 text-lg">
            Share your Solana calls and track engagement
          </p>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col items-center space-y-4">
            <WalletMultiButton />
            {publicKey && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </div>
                <Link
                  href="/settings"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ⚙️ Settings
                </Link>
              </div>
            )}
          </div>
        </div>

        {publicKey ? (
          loading ? (
            <div className="card text-center text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <CallForm walletAddress={publicKey.toString()} userSettings={userSettings} />
          )
        ) : (
          <div className="card text-center text-gray-400">
            <p>Please connect your wallet to create a call</p>
          </div>
        )}
      </div>
    </main>
  )
}
