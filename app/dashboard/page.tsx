'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            {user.profilePhotoUrl && (
              <img
                src={user.profilePhotoUrl}
                alt={user.firstName}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <p className="text-xl text-white font-semibold">
                {user.firstName} {user.lastName}
              </p>
              {user.username && (
                <p className="text-white/60">@{user.username}</p>
              )}
              <p className="text-white/40 text-sm">
                Telegram ID: {user.telegramId}
              </p>
            </div>
          </div>

          {!user.walletAddress && !connected && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Connect Your Solana Wallet
              </h3>
              <p className="text-white/60 mb-4">
                Link your Solana wallet to create token calls and manage referrals
              </p>
              <button
                onClick={() => setVisible(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {(user.walletAddress || connected) && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Solana Wallet
              </h3>
              <p className="text-white/60 font-mono text-sm">
                {user.walletAddress || publicKey?.toString()}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/create-call')}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-left transition-all"
            >
              <span className="text-xl font-semibold">📢 Create Call</span>
              <p className="text-white/60 text-sm mt-1">Share your next token pick</p>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-left transition-all"
            >
              <span className="text-xl font-semibold">⚙️ Settings</span>
              <p className="text-white/60 text-sm mt-1">Manage referral codes and profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
