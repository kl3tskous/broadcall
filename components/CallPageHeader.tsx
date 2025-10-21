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
    <header className="relative max-w-[1480px] mx-auto mt-8 md:mt-[60px] px-4">
      <div className="bg-white/[0.06] backdrop-blur-[10px] rounded-[30px] md:rounded-[50px] h-[70px] md:h-[100px] flex items-center justify-between px-4 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="w-[60px] h-[60px] md:w-[86px] md:h-[86px] relative">
            <Image
              src="/broadCall-logo.png"
              alt="BroadCall"
              width={86}
              height={86}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Navigation - only show when wallet connected */}
        {mounted && publicKey && (
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <Link href="/" className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link href={`/profile/${publicKey.toString()}`} className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Profile
            </Link>
            <Link href="/settings" className="text-white text-xl xl:text-2xl font-normal hover:opacity-80 transition-opacity">
              Settings
            </Link>
          </nav>
        )}

        {/* Connect Wallet Button */}
        {mounted && (
          publicKey ? (
            <Link
              href="/"
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[20px] md:rounded-[30px] px-4 md:px-8 py-2 md:py-4 hover:opacity-90 transition-opacity"
            >
              <span className="text-black text-sm md:text-xl font-bold">Create Call</span>
            </Link>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-[20px] md:rounded-[30px] px-4 md:px-8 py-2 md:py-4 hover:opacity-90 transition-opacity"
            >
              <span className="text-black text-sm md:text-xl font-bold">Connect Wallet</span>
            </button>
          )
        )}
      </div>
    </header>
  )
}
