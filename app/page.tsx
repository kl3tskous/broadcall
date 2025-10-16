'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { CallForm } from '@/components/CallForm'
import OnboardingFlow from '@/components/OnboardingFlow'
import { supabase, UserSettings } from '@/utils/supabaseClient'

export default function Home() {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(true)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)

  const fetchUserSettings = async () => {
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchUserSettings()
  }, [publicKey])

  // Refetch settings when page gains focus (user returns from settings)
  useEffect(() => {
    const handleFocus = () => {
      if (publicKey && !showOnboarding) {
        fetchUserSettings()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [publicKey, showOnboarding])

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
          <p className="text-gray-400 text-lg">
            Create flex-worthy token call pages and track your performance
          </p>
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
