'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import { fetchTokenMetadata, fetchTokenLogo } from '@/utils/dexscreener'
import Link from 'next/link'

interface CallFormProps {
  walletAddress: string
  userSettings: UserSettings | null
}

export function CallForm({ walletAddress, userSettings }: CallFormProps) {
  const { signMessage } = useWallet()
  const [tokenAddress, setTokenAddress] = useState('')
  const [thesis, setThesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [fetchingMetadata, setFetchingMetadata] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFetchingMetadata(true)
    setGeneratedLink('')

    try {
      const tokenMetadata = await fetchTokenMetadata(tokenAddress)
      const tokenLogo = await fetchTokenLogo(tokenAddress)
      
      setFetchingMetadata(false)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('alias')
        .eq('wallet_address', walletAddress)
        .single()

      const { data, error } = await supabase
        .from('calls')
        .insert([
          {
            creator_wallet: walletAddress,
            token_address: tokenAddress,
            platform: 'GMGN',
            thesis: thesis || null,
            gmgn_ref: userSettings?.gmgn_ref || null,
            axiom_ref: userSettings?.axiom_ref || null,
            photon_ref: userSettings?.photon_ref || null,
            bullx_ref: userSettings?.bullx_ref || null,
            trojan_ref: userSettings?.trojan_ref || null,
            token_name: tokenMetadata?.name || null,
            token_symbol: tokenMetadata?.symbol || null,
            token_logo: tokenLogo || null,
            initial_price: tokenMetadata?.price || null,
            initial_mcap: tokenMetadata?.marketCap || null,
            first_shared_at: new Date().toISOString(),
            user_alias: profileData?.alias || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/call/${data.id}`
      setGeneratedLink(link)
      
      // Broadcast to Telegram channels (non-blocking)
      try {
        // Sign a message to authenticate the broadcast (only call_id needed - server fetches trusted data)
        let signature = ''
        let authMessage = ''
        if (signMessage) {
          authMessage = `BroadCall Broadcast\nWallet: ${walletAddress}\nCall: ${data.id}\nTimestamp: ${Date.now()}`
          const messageBytes = new TextEncoder().encode(authMessage)
          const signatureBytes = await signMessage(messageBytes)
          const bs58 = await import('bs58')
          signature = bs58.default.encode(signatureBytes)
        }

        const broadcastResponse = await fetch('/api/telegram/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: walletAddress,
            call_id: data.id,
            signature,
            message: authMessage
          })
        })
        
        if (broadcastResponse.ok) {
          const broadcastData = await broadcastResponse.json()
          console.log('Broadcast result:', broadcastData)
          if (broadcastData.broadcasts && broadcastData.broadcasts.length > 0) {
            const successCount = broadcastData.broadcasts.filter((b: any) => b.success).length
            if (successCount > 0) {
              console.log(`✅ Call broadcasted to ${successCount} Telegram channels`)
            }
          }
        }
      } catch (broadcastError) {
        // Broadcast errors don't block call creation
        console.error('Telegram broadcast failed:', broadcastError)
      }
      
      setTokenAddress('')
      setThesis('')
    } catch (error: any) {
      console.error('Error creating call:', error)
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error)
      alert(`Failed to create call: ${errorMessage}`)
    } finally {
      setLoading(false)
      setFetchingMetadata(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)]">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Create New Call</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-white mb-2">
            Token Address *
          </label>
          <input
            id="tokenAddress"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token address"
            className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="thesis" className="block text-sm font-medium text-white mb-2">
            Thesis (Optional)
          </label>
          <textarea
            id="thesis"
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Why is this a good call?"
            className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors resize-none min-h-[100px]"
            rows={4}
          />
        </div>

        {/* Referral Info */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-orange-400 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-200">
                Your saved referral codes will be automatically attached to this call.
              </p>
              <Link href="/settings" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 mt-1">
                Manage codes in Settings →
              </Link>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-2xl px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 w-full"
        >
          <span className="text-black text-base md:text-lg font-bold">
            {fetchingMetadata ? 'Fetching token data...' : loading ? 'Creating call...' : 'Generate Link'}
          </span>
        </button>
      </form>

      {generatedLink && (
        <div className="mt-6 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-gray-300 mb-2">Your call link:</p>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-2xl px-6 py-3 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="text-black font-bold">Copy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
