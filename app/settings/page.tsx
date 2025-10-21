'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/components/UserProfile'
import { GmgnLogo, AxiomLogo, PhotonLogo, BullxLogo, TrojanLogo } from '@/components/PlatformLogos'
import { CallPageHeader } from '@/components/CallPageHeader'

export default function SettingsPage() {
  const { publicKey } = useWallet()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [mounted, setMounted] = useState(false)
  const [refCodes, setRefCodes] = useState({
    gmgn_ref: '',
    axiom_ref: '',
    photon_ref: '',
    bullx_ref: '',
    trojan_ref: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      if (!publicKey) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setSettings(data)
          setRefCodes({
            gmgn_ref: data.gmgn_ref || '',
            axiom_ref: data.axiom_ref || '',
            photon_ref: data.photon_ref || '',
            bullx_ref: data.bullx_ref || '',
            trojan_ref: data.trojan_ref || ''
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [publicKey])

  const handleSave = async () => {
    if (!publicKey) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            wallet_address: publicKey.toString(),
            ...refCodes,
            onboarded: true
          },
          { onConflict: 'wallet_address' }
        )

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!publicKey) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] text-center max-w-md w-full relative z-10">
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to access settings
          </p>
          {mounted && <WalletMultiButton className="btn-primary mx-auto" />}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-xl text-gray-300 relative z-10">Loading settings...</div>
      </div>
    )
  }

  return (
    <main 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Glassmorphic Header */}
      <CallPageHeader />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-300">Manage your referral codes and preferences</p>
          </div>
        </div>

        <UserProfile walletAddress={publicKey.toString()} />

        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Your Referral Codes</h2>
          <p className="text-gray-300 mb-6 text-sm">
            These codes will be automatically attached to all your token calls. Update them anytime.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-white">
                <GmgnLogo className="w-5 h-5" />
                <span>GMGN Referral Code</span>
              </label>
              <input
                type="text"
                value={refCodes.gmgn_ref}
                onChange={(e) => setRefCodes({ ...refCodes, gmgn_ref: e.target.value })}
                placeholder="Your GMGN ref code (e.g., 7rpqjHdf)"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for GMGN Telegram bot referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-white">
                <AxiomLogo className="w-5 h-5" />
                <span>Axiom Referral Code</span>
              </label>
              <input
                type="text"
                value={refCodes.axiom_ref}
                onChange={(e) => setRefCodes({ ...refCodes, axiom_ref: e.target.value })}
                placeholder="Your Axiom ref code"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for Axiom.trade referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-white">
                <PhotonLogo className="w-5 h-5" />
                <span>Photon Referral Code</span>
              </label>
              <input
                type="text"
                value={refCodes.photon_ref}
                onChange={(e) => setRefCodes({ ...refCodes, photon_ref: e.target.value })}
                placeholder="Your Photon ref code"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for Photon Sol referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-white">
                <BullxLogo className="w-5 h-5" />
                <span>BullX Referral Code</span>
              </label>
              <input
                type="text"
                value={refCodes.bullx_ref}
                onChange={(e) => setRefCodes({ ...refCodes, bullx_ref: e.target.value })}
                placeholder="Your BullX ref code"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for BullX terminal referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-white">
                <TrojanLogo className="w-5 h-5" />
                <span>Trojan Referral Code</span>
              </label>
              <input
                type="text"
                value={refCodes.trojan_ref}
                onChange={(e) => setRefCodes({ ...refCodes, trojan_ref: e.target.value })}
                placeholder="Your Trojan ref code"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for Trojan bot referrals
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-2xl px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="text-black text-base md:text-lg font-bold">
                {saving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Connected Wallet</h2>
          <div className="bg-white/[0.08] backdrop-blur-[10px] p-4 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
            <p className="font-mono text-sm text-white break-all">{publicKey.toString()}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
