'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCallPage() {
  const { publicKey, signMessage } = useWallet()
  const router = useRouter()
  
  const [tokenAddress, setTokenAddress] = useState('')
  const [thesis, setThesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!publicKey) {
        setCheckingAccess(false)
        return
      }

      try {
        const response = await fetch(`/api/access/check?wallet=${publicKey.toString()}`)
        const data = await response.json()
        setHasAccess(data.hasAccess)
        
        if (!data.hasAccess) {
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      } catch (error) {
        console.error('Error checking access:', error)
        setHasAccess(false)
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [publicKey, router])

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet')
      return
    }

    if (!tokenAddress.trim()) {
      setError('Please enter a token address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Create authentication signature
      const message = `BroadCall Create Call\nWallet: ${publicKey.toString()}\nToken: ${tokenAddress}\nTimestamp: ${Date.now()}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const bs58 = await import('bs58')
      const signature = bs58.default.encode(signatureBytes)

      // Create the call
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          token_address: tokenAddress.trim(),
          thesis: thesis.trim(),
          signature,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTokenAddress('')
        setThesis('')
        
        // Redirect to the token call page after 2 seconds
        setTimeout(() => {
          router.push(`/call/${data.call.id}`)
        }, 2000)
      } else {
        setError(data.error || 'Failed to create call')
      }
    } catch (err) {
      console.error('Create call error:', err)
      setError('An error occurred while creating the call')
    } finally {
      setLoading(false)
    }
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="min-h-screen backdrop-blur-sm bg-black/50">
          {/* Header */}
          <header className="border-b border-white/10 backdrop-blur-md bg-black/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                BroadCall
              </h1>
              <WalletMultiButton />
            </div>
          </header>

          {/* Connect Wallet Prompt */}
          <div className="flex items-center justify-center pt-32">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Please connect your wallet to create a token call
              </p>
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="min-h-screen backdrop-blur-sm bg-black/50">
          <header className="border-b border-white/10 backdrop-blur-md bg-black/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                BroadCall
              </h1>
              <WalletMultiButton />
            </div>
          </header>
          <div className="flex items-center justify-center pt-32">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <p className="text-white text-center">Checking access...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="min-h-screen backdrop-blur-sm bg-black/50">
          <header className="border-b border-white/10 backdrop-blur-md bg-black/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                BroadCall
              </h1>
              <WalletMultiButton />
            </div>
          </header>
          <div className="flex items-center justify-center pt-32">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                🔒 Access Not Granted
              </h2>
              <p className="text-gray-400 text-center mb-6">
                You're on the waitlist! Access will be granted soon.
              </p>
              <p className="text-gray-500 text-center text-sm">
                Redirecting to homepage...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              BroadCall
            </h1>
            <WalletMultiButton />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2">
              📢 Create New Call
            </h2>
            <p className="text-gray-400 mb-8">
              Share your next token call with your community
            </p>

            {success && (
              <div className="mb-6 p-4 backdrop-blur-md bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold">
                  ✅ Call created successfully! Broadcasting to your channels...
                </p>
                <p className="text-green-400/70 text-sm mt-1">
                  Redirecting to your call page...
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 backdrop-blur-md bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateCall} className="space-y-6">
              {/* Token Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter Solana token address"
                  className="w-full px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll automatically fetch token details from DexScreener
                </p>
              </div>

              {/* Thesis */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Thesis (Optional)
                </label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Share why you're bullish on this token..."
                  rows={4}
                  className="w-full px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed in your Telegram broadcast
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !tokenAddress.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating call...
                  </span>
                ) : (
                  '📢 Create Call & Broadcast'
                )}
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Your call will be automatically broadcast to all your enabled Telegram channels
              </p>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 What happens next?
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">1.</span>
                <span>We fetch real-time token data from DexScreener</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">2.</span>
                <span>Your call is saved with current price and market cap</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">3.</span>
                <span>Automatic broadcast to all your enabled Telegram channels</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">4.</span>
                <span>Followers can buy using your referral links from 5 platforms</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">5.</span>
                <span>Track ROI, views, and engagement on your profile</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
