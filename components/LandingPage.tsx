'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UserPlus, Bell, Send, Check } from 'lucide-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

export default function LandingPage() {
  const { setVisible } = useWalletModal()
  const { publicKey, connected } = useWallet()
  const [isJoining, setIsJoining] = useState(false)
  const [showTelegramStep, setShowTelegramStep] = useState(false)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [checking, setChecking] = useState(false)

  // Check if wallet is already on waitlist (completed)
  useEffect(() => {
    const checkWaitlist = async () => {
      if (!publicKey) return
      
      try {
        const response = await fetch(`/api/waitlist/check?wallet=${publicKey.toString()}`)
        const data = await response.json()
        setIsOnWaitlist(data.onWaitlist) // Only true if status is 'completed'
        
        // If they're on the waitlist and we were showing telegram step, hide it
        if (data.onWaitlist && showTelegramStep) {
          setShowTelegramStep(false)
        }
      } catch (error) {
        console.error('Error checking waitlist:', error)
      }
    }
    
    checkWaitlist()
  }, [publicKey, showTelegramStep])

  // Poll for verification when showing telegram step
  useEffect(() => {
    if (!showTelegramStep || !publicKey) return
    
    setChecking(true)
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/waitlist/check?wallet=${publicKey.toString()}`)
        const data = await response.json()
        
        if (data.onWaitlist && data.data?.status === 'completed') {
          setIsOnWaitlist(true)
          setShowTelegramStep(false)
          setChecking(false)
        }
      } catch (error) {
        console.error('Error checking status:', error)
      }
    }
    
    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [showTelegramStep, publicKey])

  const handleJoinWaitlist = async () => {
    if (!connected || !publicKey) {
      setVisible(true)
      return
    }

    setIsJoining(true)
    
    try {
      // Create pending waitlist entry
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toString()
        })
      })

      const data = await response.json()

      if (response.ok || response.status === 409) {
        // Success or already exists - show telegram step inline
        setShowTelegramStep(true)
      } else {
        alert(data.error || 'Failed to start waitlist signup')
      }
    } catch (error) {
      console.error('Error starting waitlist signup:', error)
      alert('Failed to start waitlist signup. Please try again.')
    } finally {
      setIsJoining(false)
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

          {/* Discord Icon & Launch App Button */}
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

            {/* Launch App Button */}
            <button
              onClick={() => setVisible(true)}
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[20px] md:rounded-[30px] px-4 md:px-8 py-2 md:py-4 hover:opacity-90 transition-opacity"
            >
              <span className="text-black text-sm md:text-xl font-bold">Launch App</span>
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

          {/* Create Profile Button */}
          <button
            onClick={() => setVisible(true)}
            className="w-full sm:w-[234px] h-[56px] md:h-[66px] bg-[rgba(126,126,126,0.29)] border border-white/20 backdrop-blur-[10px] rounded-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-[rgba(126,126,126,0.4)] transition-all group"
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
              Create Profile
            </span>
          </button>
        </div>
      </div>

      {/* Join Waitlist Section */}
      <div className="relative max-w-[800px] mx-auto px-4 mb-12 md:mb-16">
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
          {isOnWaitlist ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#FF5605] to-[#FFA103] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">You&apos;re on the Waitlist! 🎉</h2>
              <p className="text-gray-300 mb-4">
                We&apos;ll notify you via Telegram as soon as BroadCall launches.
              </p>
            </div>
          ) : showTelegramStep ? (
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                One Click to Join! 🚀
              </h1>
              <p className="text-gray-300 text-base md:text-lg mb-8">
                Click the button below to open Telegram and complete your waitlist signup
              </p>

              {/* Big Telegram Button */}
              <a
                href={`https://t.me/Broadcall_Bot?start=${publicKey?.toString() || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#0088cc] text-white font-bold text-xl py-4 md:py-5 px-8 md:px-10 rounded-[20px] hover:bg-[#0077b3] transition-all shadow-lg hover:shadow-xl mb-8 group"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                Open Telegram
              </a>

              {/* Instructions */}
              <div className="bg-white/[0.08] rounded-[20px] p-4 md:p-6 border border-white/10 mb-6">
                <h3 className="text-white font-semibold text-base md:text-lg mb-3">
                  What happens next?
                </h3>
                <ol className="text-gray-300 text-sm md:text-base text-left space-y-2">
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
                    This will update automatically once you complete the steps in Telegram
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Join the Waitlist</h2>
              <p className="text-gray-300 mb-6">
                Connect your wallet to get early access when we launch
              </p>
              <button
                onClick={handleJoinWaitlist}
                disabled={isJoining}
                className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] text-black font-bold text-lg py-3 px-8 md:px-12 rounded-[16px] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isJoining ? 'Joining...' : connected ? 'Join Waitlist' : 'Connect Wallet'}
              </button>
              {!connected && (
                <p className="text-gray-400 text-sm mt-3">
                  No wallet? No problem. We&apos;ll guide you through setup.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Platform Logos Infinite Scroll */}
      <div className="relative max-w-[1060px] mx-auto overflow-hidden pb-12 md:pb-16"
           style={{
             WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
             maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
           }}>
        <div className="flex animate-scroll">
          {/* First set of logos */}
          <div className="flex gap-4 md:gap-6 shrink-0">
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/gmgn.png" alt="GMGN" width={72} height={72} className="object-contain w-12 h-12 md:w-16 md:h-16" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/axiom.png" alt="Axiom" width={134} height={134} className="object-contain w-20 h-20 md:w-28 md:h-28" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/photon.png" alt="Photon" width={140} height={140} className="object-contain w-20 h-20 md:w-32 md:h-32" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/bullx.png" alt="BullX" width={85} height={85} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/trojan.png" alt="Trojan" width={85} height={81} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
          </div>
          
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-4 md:gap-6 shrink-0 ml-4 md:ml-6">
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/gmgn.png" alt="GMGN" width={72} height={72} className="object-contain w-12 h-12 md:w-16 md:h-16" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/axiom.png" alt="Axiom" width={134} height={134} className="object-contain w-20 h-20 md:w-28 md:h-28" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/photon.png" alt="Photon" width={140} height={140} className="object-contain w-20 h-20 md:w-32 md:h-32" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/bullx.png" alt="BullX" width={85} height={85} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/trojan.png" alt="Trojan" width={85} height={81} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
          </div>

          {/* Third set for extra smoothness */}
          <div className="flex gap-4 md:gap-6 shrink-0 ml-4 md:ml-6">
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/gmgn.png" alt="GMGN" width={72} height={72} className="object-contain w-12 h-12 md:w-16 md:h-16" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/axiom.png" alt="Axiom" width={134} height={134} className="object-contain w-20 h-20 md:w-28 md:h-28" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/photon.png" alt="Photon" width={140} height={140} className="object-contain w-20 h-20 md:w-32 md:h-32" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/bullx.png" alt="BullX" width={85} height={85} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
            <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
              <Image src="/platforms/trojan.png" alt="Trojan" width={85} height={81} className="object-contain w-14 h-14 md:w-20 md:h-20" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
