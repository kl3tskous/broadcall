'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Send, Check } from 'lucide-react'
import Image from 'next/image'

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [telegramConnected, setTelegramConnected] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }

    // Check if user already has Telegram connected
    if (session.user.telegram_id) {
      setTelegramConnected(true)
    }

    // Check if already on waitlist
    if (session.user.joined_waitlist) {
      router.push('/onboarding/success')
    }
  }, [session, status, router])

  const handleSkipTelegram = async () => {
    try {
      // Mark as joined waitlist without Telegram
      const response = await fetch('/api/onboarding/join-waitlist', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/onboarding/success')
      }
    } catch (error) {
      console.error('Error joining waitlist:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-2xl w-full">
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 md:p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
          {/* User Profile */}
          <div className="text-center mb-8">
            {session.user.profile_image_url && (
              <img
                src={session.user.profile_image_url}
                alt={session.user.twitter_name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20"
              />
            )}
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {session.user.twitter_name}! 👋
            </h1>
            <p className="text-white/60">@{session.user.twitter_username}</p>
          </div>

          {telegramConnected ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Telegram Connected!
              </h2>
              <p className="text-gray-300 mb-6">
                You're all set. Click below to join the waitlist.
              </p>
              <button
                onClick={handleSkipTelegram}
                className="w-full bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] text-black font-bold text-lg py-4 rounded-xl hover:opacity-90 transition-all"
              >
                Join Waitlist
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Telegram
              </h2>
              <p className="text-gray-300 mb-8">
                Get notified when BroadCall launches! Connect your Telegram to join the waitlist.
              </p>

              {/* Telegram Connect Button */}
              <a
                href={`https://t.me/Broadcall_Bot?start=connect_${session.user.twitter_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-lg py-4 rounded-xl transition-all mb-4"
              >
                <Send className="w-6 h-6" />
                Connect Telegram
              </a>

              {/* Skip Option */}
              <button
                onClick={handleSkipTelegram}
                className="text-white/60 hover:text-white transition-all underline"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
