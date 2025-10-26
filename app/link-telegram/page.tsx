'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Send } from 'lucide-react'
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

  // Create deep link with wallet address encoded in start parameter
  const telegramDeepLink = `https://t.me/Broadcall_Bot?start=${publicKey.toString()}`

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
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 md:p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              One Click to Join! 🚀
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Click the button below to open Telegram and complete your waitlist signup
            </p>

            {/* Big Telegram Button */}
            <a
              href={telegramDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#0088cc] text-white font-bold text-xl py-5 px-10 rounded-[20px] hover:bg-[#0077b3] transition-all shadow-lg hover:shadow-xl mb-8 group"
            >
              <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              Open Telegram
            </a>

            {/* Instructions */}
            <div className="bg-white/[0.08] rounded-[24px] p-6 border border-white/10 mb-6">
              <h3 className="text-white font-semibold text-lg mb-3">
                What happens next?
              </h3>
              <ol className="text-gray-300 text-left space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">1.</span>
                  <span>Telegram will open with @Broadcall_Bot</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">2.</span>
                  <span>Click the <strong className="text-white">START</strong> button in the chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">3.</span>
                  <span>You&apos;ll instantly be verified and added to the waitlist!</span>
                </li>
              </ol>
            </div>

            {/* Status Indicator */}
            {checking && (
              <div className="bg-black/30 rounded-[16px] p-4 border border-white/10">
                <div className="flex items-center justify-center gap-3 text-orange-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
                  <span className="text-sm font-medium">Waiting for verification...</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  This page will update automatically once you complete the steps in Telegram
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
