'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function Header() {
  const { publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/broadCall-logo.png"
              alt="BroadCall"
              width={180}
              height={180}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Center navigation items */}
          <nav className="hidden md:flex items-center gap-8">
            {mounted && publicKey && (
              <>
                <Link
                  href="/"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Create Call
                </Link>
                <Link
                  href={`/profile/${publicKey.toString()}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* Wallet button on the right */}
          <div className="flex items-center gap-4">
            {mounted && (
              <div className="wallet-adapter-outlined">
                <WalletMultiButton />
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .wallet-adapter-outlined .wallet-adapter-button {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          height: 40px !important;
          padding: 0 20px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: white !important;
          transition: all 0.2s ease !important;
          min-height: unset !important;
        }
        .wallet-adapter-outlined .wallet-adapter-button:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .wallet-adapter-outlined .wallet-adapter-button-trigger {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          height: 40px !important;
          padding: 0 20px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: white !important;
        }
      `}</style>
    </header>
  )
}
