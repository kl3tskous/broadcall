'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserPlus } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient Blur Orbs */}
      <div className="absolute w-[767px] h-[767px] left-1/2 -translate-x-1/2 top-[907px] opacity-70">
        <div className="w-full h-full bg-gradient-to-r from-[#FF5605]/70 via-[#FF7704]/70 to-[#FFA103]/70 blur-[300px]" />
      </div>
      <div className="absolute w-[901px] h-[720px] left-1/4 -translate-x-1/2 -top-[548px] opacity-50">
        <div className="w-full h-full bg-[rgba(20,241,149,0.5)] blur-[300px]" />
      </div>
      <div className="absolute w-[269px] h-[269px] right-1/4 top-[1128px]">
        <div className="w-full h-full bg-gradient-to-b from-[#6D31BA] to-transparent blur-[300px]" />
      </div>

      {/* Header */}
      <header className="relative max-w-[1480px] mx-auto mt-8 md:mt-[60px] px-4">
        <div className="bg-white/[0.06] backdrop-blur-[10px] rounded-[30px] md:rounded-[50px] h-[70px] md:h-[100px] flex items-center justify-between px-4 md:px-12">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-[60px] h-[60px] md:w-[86px] md:h-[86px] relative">
              <Image
                src="/callor-logo.png"
                alt="Callor"
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

          {/* Launch App Button */}
          <Link
            href="/"
            className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[20px] md:rounded-[30px] px-4 md:px-8 py-2 md:py-4 hover:opacity-90 transition-opacity"
          >
            <span className="text-black text-sm md:text-xl font-bold">Launch App</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative max-w-[1019px] mx-auto mt-16 md:mt-32 lg:mt-[251px] px-4">
        {/* Main Headline */}
        <h1 className="text-center font-extrabold text-4xl md:text-6xl lg:text-[80px] leading-tight md:leading-tight lg:leading-[97px] bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] bg-clip-text text-transparent mb-4 md:mb-6">
          Turn Calls Into Income.
        </h1>

        {/* Subtitle */}
        <p className="text-center text-white/80 font-semibold text-base md:text-xl lg:text-[28px] leading-relaxed md:leading-relaxed lg:leading-[39px] mb-8 md:mb-12 max-w-3xl mx-auto">
          Share your alpha. When your followers ape in, you get paid. Built for KOLs, made for crypto traders.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-16 md:mb-24">
          {/* View KOLs Button */}
          <Link
            href="/explore"
            className="w-full sm:w-[216px] h-[56px] md:h-[66px] bg-[rgba(126,126,126,0.29)] border border-white/20 backdrop-blur-[10px] rounded-xl flex items-center justify-center hover:bg-[rgba(126,126,126,0.4)] transition-all"
          >
            <span className="text-white text-lg md:text-[22px] font-bold">View KOLs</span>
          </Link>

          {/* Create Profile Button */}
          <Link
            href="/"
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
          </Link>
        </div>
      </div>

      {/* Platform Logos Grid */}
      <div className="relative max-w-[1060px] mx-auto mt-12 md:mt-20 lg:mt-[126px] px-4 pb-16 md:pb-24">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-2xl md:max-w-none mx-auto justify-items-center">
          {/* Platform Logo Cards */}
          <div className="w-full aspect-square max-w-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <Image src="/platforms/gmgn.png" alt="GMGN" width={72} height={72} className="object-contain w-12 h-12 md:w-16 md:h-16" />
          </div>
          <div className="w-full aspect-square max-w-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <Image src="/platforms/axiom.png" alt="Axiom" width={134} height={134} className="object-contain w-20 h-20 md:w-28 md:h-28" />
          </div>
          <div className="w-full aspect-square max-w-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <Image src="/platforms/photon.png" alt="Photon" width={140} height={140} className="object-contain w-20 h-20 md:w-32 md:h-32" />
          </div>
          <div className="w-full aspect-square max-w-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <Image src="/platforms/bullx.png" alt="BullX" width={85} height={85} className="object-contain w-14 h-14 md:w-20 md:h-20" />
          </div>
          <div className="w-full aspect-square max-w-[160px] bg-white/[0.12] backdrop-blur-[20px] rounded-[24px] md:rounded-[34px] flex items-center justify-center shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
            <Image src="/platforms/trojan.png" alt="Trojan" width={85} height={81} className="object-contain w-14 h-14 md:w-20 md:h-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
