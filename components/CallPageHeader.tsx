'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export function CallPageHeader() {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="relative max-w-[1480px] mx-auto mt-4 md:mt-6 px-4">
      <div className="bg-white/[0.06] backdrop-blur-[10px] rounded-[30px] md:rounded-[50px] h-[60px] md:h-[80px] flex items-center justify-between px-4 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] relative">
            <Image
              src="/broadCall-logo.png"
              alt="BroadCall"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Navigation - only show when wallet connected */}
        {mounted && publicKey && (
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-white text-lg xl:text-xl font-normal hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link href={`/profile/${publicKey.toString()}`} className="text-white text-lg xl:text-xl font-normal hover:opacity-80 transition-opacity">
              Profile
            </Link>
            <Link href="/settings" className="text-white text-lg xl:text-xl font-normal hover:opacity-80 transition-opacity">
              Settings
            </Link>
          </nav>
        )}

        {/* Connect Wallet Button */}
        {mounted && (
          publicKey ? (
            <Link
              href="/create-call"
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[16px] md:rounded-[24px] px-3 md:px-6 py-2 md:py-3 hover:opacity-90 transition-opacity"
            >
              <span className="text-black text-sm md:text-lg font-bold">Create Call</span>
            </Link>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[16px] md:rounded-[24px] px-3 md:px-6 py-2 md:py-3 hover:opacity-90 transition-opacity"
            >
              <span className="text-black text-sm md:text-lg font-bold">Connect Wallet</span>
            </button>
          )
        )}
      </div>
    </header>
  )
}
