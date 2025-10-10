'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { platforms } from './PlatformLogos'

interface CallFormProps {
  walletAddress: string
}

export function CallForm({ walletAddress }: CallFormProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [thesis, setThesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  
  // Referral codes for each platform
  const [gmgnRef, setGmgnRef] = useState('')
  const [axiomRef, setAxiomRef] = useState('')
  const [photonRef, setPhotonRef] = useState('')
  const [bullxRef, setBullxRef] = useState('')
  const [trojanRef, setTrojanRef] = useState('')

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
            gmgn_ref: gmgnRef || null,
            axiom_ref: axiomRef || null,
            photon_ref: photonRef || null,
            bullx_ref: bullxRef || null,
            trojan_ref: trojanRef || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/call/${data.id}`
      setGeneratedLink(link)
      setTokenAddress('')
      setThesis('')
      setGmgnRef('')
      setAxiomRef('')
      setPhotonRef('')
      setBullxRef('')
      setTrojanRef('')
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

        {/* Referral Codes Section */}
        <div className="border border-gray-700 rounded-lg p-4 bg-dark-bg/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Your Referral Codes
            </span>
            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GMGN */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {platforms.find(p => p.id === 'gmgn')?.Logo && 
                  React.createElement(platforms.find(p => p.id === 'gmgn')!.Logo, { className: 'w-4 h-4' })}
                GMGN
              </label>
              <input
                type="text"
                value={gmgnRef}
                onChange={(e) => setGmgnRef(e.target.value)}
                placeholder="Your GMGN ref code"
                className="input-field text-sm"
              />
            </div>

            {/* Axiom */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {platforms.find(p => p.id === 'axiom')?.Logo && 
                  React.createElement(platforms.find(p => p.id === 'axiom')!.Logo, { className: 'w-4 h-4' })}
                Axiom
              </label>
              <input
                type="text"
                value={axiomRef}
                onChange={(e) => setAxiomRef(e.target.value)}
                placeholder="Your Axiom ref code"
                className="input-field text-sm"
              />
            </div>

            {/* Photon */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {platforms.find(p => p.id === 'photon')?.Logo && 
                  React.createElement(platforms.find(p => p.id === 'photon')!.Logo, { className: 'w-4 h-4' })}
                Photon
              </label>
              <input
                type="text"
                value={photonRef}
                onChange={(e) => setPhotonRef(e.target.value)}
                placeholder="Your Photon ref code"
                className="input-field text-sm"
              />
            </div>

            {/* BullX */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {platforms.find(p => p.id === 'bullx')?.Logo && 
                  React.createElement(platforms.find(p => p.id === 'bullx')!.Logo, { className: 'w-4 h-4' })}
                BullX
              </label>
              <input
                type="text"
                value={bullxRef}
                onChange={(e) => setBullxRef(e.target.value)}
                placeholder="Your BullX ref code"
                className="input-field text-sm"
              />
            </div>

            {/* Trojan */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {platforms.find(p => p.id === 'trojan')?.Logo && 
                  React.createElement(platforms.find(p => p.id === 'trojan')!.Logo, { className: 'w-4 h-4' })}
                Trojan
              </label>
              <input
                type="text"
                value={trojanRef}
                onChange={(e) => setTrojanRef(e.target.value)}
                placeholder="Your Trojan ref code"
                className="input-field text-sm"
              />
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
