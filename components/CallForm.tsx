'use client'

import React, { useState } from 'react'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import Link from 'next/link'

interface CallFormProps {
  walletAddress: string
  userSettings: UserSettings | null
}

export function CallForm({ walletAddress, userSettings }: CallFormProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [thesis, setThesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneratedLink('')

    try {
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
          },
        ])
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/call/${data.id}`
      setGeneratedLink(link)
      setTokenAddress('')
      setThesis('')
    } catch (error: any) {
      console.error('Error creating call:', error)
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error)
      alert(`Failed to create call: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Create New Call</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-300 mb-2">
            Token Address *
          </label>
          <input
            id="tokenAddress"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token address"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="thesis" className="block text-sm font-medium text-gray-300 mb-2">
            Thesis (Optional)
          </label>
          <textarea
            id="thesis"
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Why is this a good call?"
            className="input-field min-h-[100px]"
            rows={4}
          />
        </div>

        {/* Referral Info */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-purple-400 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">
                Your saved referral codes will be automatically attached to this call.
              </p>
              <Link href="/settings" className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 mt-1">
                Manage codes in Settings →
              </Link>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Link'}
        </button>
      </form>

      {generatedLink && (
        <div className="mt-6 p-4 bg-dark-bg border border-accent-primary rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Your call link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="btn-primary whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
