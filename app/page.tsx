'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { CallForm } from '@/components/CallForm'

export default function Home() {
  const { publicKey } = useWallet()

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Coin Call Platform
          </h1>
          <p className="text-gray-400 text-lg">
            Share your Solana calls and track engagement
          </p>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col items-center space-y-4">
            <WalletMultiButton />
            {publicKey && (
              <div className="text-sm text-gray-400">
                Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            )}
          </div>
        </div>

        {publicKey ? (
          <CallForm walletAddress={publicKey.toString()} />
        ) : (
          <div className="card text-center text-gray-400">
            <p>Please connect your wallet to create a call</p>
          </div>
        )}
      </div>
    </main>
  )
}
