'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UserPlus } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to onboarding if logged in
  useEffect(() => {
    if (status === 'loading') return
    
    if (session && session.user) {
      if (session.user.joined_waitlist) {
        router.push('/onboarding/success')
      } else {
        router.push('/onboarding')
      }
    }
  }, [session, status, router])

  const handleTwitterLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('twitter', { callbackUrl: '/onboarding' })
    } catch (error) {
      console.error('Twitter login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="relative max-w-[1480px] mx-auto mt-8 md:mt-[60px] px-4">
        <div className="bg-white/[0.06] backdrop-blur-[10px] rounded-[30px] md:rounded-[50px] h-[70px] md:h-[100px] flex items-center justify-between px-4 md:px-12">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-[60px] h-[60px] md:w-[86px] md:h-[86px] relative">
              <Image
                src="/broadCall-logo.png"
                alt="BroadCall"
                width={86}
                height={86}
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <Link href="#home" className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link href="#features" className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Features
            </Link>
            <Link href="#career" className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Career
            </Link>
          </nav>

          {/* Discord Icon & Login Button */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Discord Icon */}
            <a
              href="https://discord.gg/2Hmcex3S"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Join Discord"
            >
              <Image
                src="/discord-logo.svg"
                alt="Discord"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </a>

            {/* Login with X Button */}
            <button
              onClick={handleTwitterLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[20px] md:rounded-[30px] px-4 md:px-8 py-2 md:py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="text-black text-sm md:text-xl font-bold">
                {isLoading ? 'Loading...' : 'Login with X'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative max-w-[1019px] mx-auto mt-6 md:mt-8 lg:mt-12 px-4">
        {/* Main Headline */}
        <h1 className="text-center font-extrabold text-4xl md:text-6xl lg:text-[80px] leading-tight md:leading-tight lg:leading-[97px] bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] bg-clip-text text-transparent mb-3 md:mb-4">
          Turn Calls Into Income.
        </h1>

        {/* Subtitle */}
        <p className="text-center text-white/80 font-semibold text-base md:text-xl lg:text-[28px] leading-relaxed md:leading-relaxed lg:leading-[39px] mb-6 md:mb-8 max-w-3xl mx-auto">
          Share your alpha. When your followers ape in, you get paid. Built for KOLs, made for crypto traders.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
          {/* View KOLs Button */}
          <Link
            href="/explore"
            className="w-full sm:w-[216px] h-[56px] md:h-[66px] bg-[rgba(126,126,126,0.29)] border border-white/20 backdrop-blur-[10px] rounded-xl flex items-center justify-center hover:bg-[rgba(126,126,126,0.4)] transition-all"
          >
            <span className="text-white text-lg md:text-[22px] font-bold">View KOLs</span>
          </Link>

          {/* Get Started Button */}
          <button
            onClick={handleTwitterLogin}
            disabled={isLoading}
            className="w-full sm:w-[234px] h-[56px] md:h-[66px] bg-[rgba(126,126,126,0.29)] border border-white/20 backdrop-blur-[10px] rounded-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-[rgba(126,126,126,0.4)] transition-all group disabled:opacity-50"
          >
            <UserPlus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} style={{ 
              stroke: 'url(#userPlusGradient)' 
            }} />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="userPlusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5605" />
                  <stop offset="50%" stopColor="#FF7704" />
                  <stop offset="100%" stopColor="#FFA103" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-lg md:text-[22px] font-bold bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] bg-clip-text text-transparent">
              {isLoading ? 'Loading...' : 'Get Started'}
            </span>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-[1200px] mx-auto px-4 mt-16 md:mt-24 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/[0.08] backdrop-blur-[10px] border border-white/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-white font-bold text-xl mb-2">Share Your Calls</h3>
            <p className="text-white/70">
              Create professional token call pages with your referral codes and share them with your followers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/[0.08] backdrop-blur-[10px] border border-white/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-white font-bold text-xl mb-2">Auto-Broadcast</h3>
            <p className="text-white/70">
              Automatically broadcast your calls to your Telegram channels with buy buttons and charts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/[0.08] backdrop-blur-[10px] border border-white/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-white font-bold text-xl mb-2">Earn From Trades</h3>
            <p className="text-white/70">
              Get paid when your followers trade using your referral codes across multiple platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
