'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

interface CallFormProps {
  walletAddress: string
}

export function CallForm({ walletAddress }: CallFormProps) {
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
          },
        ])
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/call/${data.id}`
      setGeneratedLink(link)
      setTokenAddress('')
      setThesis('')
    } catch (error) {
      console.error('Error creating call:', error)
      alert('Failed to create call. Please check your Supabase configuration.')
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
