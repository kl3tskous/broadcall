'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { CallForm } from '@/components/CallForm'
import OnboardingFlow from '@/components/OnboardingFlow'
import LandingPage from '@/components/LandingPage'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import { CallPageHeader } from '@/components/CallPageHeader'

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

  if (!publicKey) {
    return <LandingPage />
  }

  if (publicKey && showOnboarding) {
    return <OnboardingFlow walletAddress={publicKey.toString()} onComplete={handleOnboardingComplete} />
  }

  return (
    <main 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Glassmorphic Header */}
      <CallPageHeader />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <p className="text-gray-200 text-lg md:text-xl">
            Create flex-worthy token call pages and track your performance
          </p>
        </div>

        {publicKey ? (
          loading ? (
            <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center text-gray-300">
              <p>Loading...</p>
            </div>
          ) : (
            <CallForm walletAddress={publicKey.toString()} userSettings={userSettings} />
          )
        ) : (
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center text-gray-300">
            <p>Please connect your wallet to create a call</p>
          </div>
        )}
      </div>
    </main>
  )
}
