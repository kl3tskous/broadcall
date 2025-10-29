'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Check } from 'lucide-react'

export default function OnboardingSuccessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
    }
  }, [session, status, router])

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
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 md:p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-black" strokeWidth={3} />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            You're on the Waitlist! 🎉
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Thanks for joining, {session.user.twitter_name}! We'll notify you {session.user.telegram_username ? 'via Telegram ' : ''}when BroadCall launches.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-3">What's Next?</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Get early access when we launch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Create token call pages with your referral codes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Broadcast calls automatically to your Telegram channels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Earn from your followers' trades</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] text-black font-bold text-lg py-4 rounded-xl hover:opacity-90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
