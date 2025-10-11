'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { supabase, UserSettings } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

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
        .upsert({
          wallet_address: publicKey.toString(),
          ...refCodes,
          onboarded: true
        })

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access settings
          </p>
          {mounted && <WalletMultiButton className="btn-primary mx-auto" />}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400">Manage your referral codes and preferences</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Referral Codes</h2>
          <p className="text-gray-400 mb-6 text-sm">
            These codes will be automatically attached to all your token calls. Update them anytime.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-purple-400">●</span> GMGN Referral Code
              </label>
              <input
                type="text"
                value={refCodes.gmgn_ref}
                onChange={(e) => setRefCodes({ ...refCodes, gmgn_ref: e.target.value })}
                placeholder="Your GMGN ref code (e.g., 7rpqjHdf)"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for GMGN Telegram bot referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-pink-400">●</span> Axiom Referral Code
              </label>
              <input
                type="text"
                value={refCodes.axiom_ref}
                onChange={(e) => setRefCodes({ ...refCodes, axiom_ref: e.target.value })}
                placeholder="Your Axiom ref code"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for Axiom.trade referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-purple-400">●</span> Photon Referral Code
              </label>
              <input
                type="text"
                value={refCodes.photon_ref}
                onChange={(e) => setRefCodes({ ...refCodes, photon_ref: e.target.value })}
                placeholder="Your Photon ref code"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for Photon Sol referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-pink-400">●</span> BullX Referral Code
              </label>
              <input
                type="text"
                value={refCodes.bullx_ref}
                onChange={(e) => setRefCodes({ ...refCodes, bullx_ref: e.target.value })}
                placeholder="Your BullX ref code"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for BullX terminal referrals
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-purple-400">●</span> Trojan Referral Code
              </label>
              <input
                type="text"
                value={refCodes.trojan_ref}
                onChange={(e) => setRefCodes({ ...refCodes, trojan_ref: e.target.value })}
                placeholder="Your Trojan ref code"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for Trojan bot referrals
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-4">Connected Wallet</h2>
          <div className="bg-dark-bg p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
            <p className="font-mono text-sm break-all">{publicKey.toString()}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
