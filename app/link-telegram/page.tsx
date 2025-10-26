'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { CallPageHeader } from '@/components/CallPageHeader'

export default function LinkTelegramPage() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [isLinked, setIsLinked] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!connected) {
      router.push('/')
      return
    }
  }, [connected, router])

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      if (!publicKey) return
      
      setChecking(true)
      try {
        const response = await fetch(`/api/waitlist/check?wallet=${publicKey.toString()}`)
        const data = await response.json()
        
        if (data.onWaitlist && data.data?.status === 'completed') {
          setIsLinked(true)
        }
      } catch (error) {
        console.error('Error checking waitlist:', error)
      } finally {
        setChecking(false)
      }
    }

    checkWaitlistStatus()
    
    // Poll every 3 seconds to check if user completed verification
    const interval = setInterval(checkWaitlistStatus, 3000)
    return () => clearInterval(interval)
  }, [publicKey])

  if (!connected || !publicKey) {
    return null
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
      <CallPageHeader />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {isLinked ? (
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 md:p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-black" strokeWidth={3} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              You&apos;re on the Waitlist! 🎉
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              We&apos;ll notify you via Telegram as soon as BroadCall launches.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] text-black font-bold text-lg py-3 px-8 rounded-[16px] hover:opacity-90 transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 md:p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Link Your Telegram
            </h1>
            <p className="text-gray-300 text-lg mb-8 text-center">
              Complete your waitlist signup by verifying your wallet with our Telegram bot
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-white/[0.08] rounded-[24px] p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      Open Telegram Bot
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Click the button below to open @Broadcall_Bot in Telegram
                    </p>
                    <a
                      href="https://t.me/Broadcall_Bot?start=waitlist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#0088cc] text-white font-semibold py-3 px-6 rounded-[16px] hover:bg-[#0077b3] transition-colors"
                    >
                      Open @Broadcall_Bot
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/[0.08] rounded-[24px] p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      Send Your Wallet Address
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Send this message to the bot to verify your wallet:
                    </p>
                    <div className="bg-black/30 rounded-[12px] p-4 border border-white/10">
                      <code className="text-orange-400 text-sm break-all">
                        /waitlist {publicKey.toString()}
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`/waitlist ${publicKey.toString()}`)
                        alert('Copied to clipboard!')
                      }}
                      className="mt-3 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/[0.08] rounded-[24px] p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {checking ? 'Waiting for Verification...' : 'Get Confirmed'}
                    </h3>
                    <p className="text-gray-300">
                      {checking 
                        ? 'Once verified, you\'ll be added to the waitlist and this page will update automatically.'
                        : 'The bot will confirm your signup and notify you when BroadCall launches!'
                      }
                    </p>
                    {checking && (
                      <div className="mt-4 flex items-center gap-2 text-orange-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
                        <span className="text-sm">Checking verification status...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
