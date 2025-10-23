'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { supabase, UserSettings, Profile } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/components/UserProfile'
import { GmgnLogo, AxiomLogo, PhotonLogo, BullxLogo, TrojanLogo } from '@/components/PlatformLogos'
import { CallPageHeader } from '@/components/CallPageHeader'

export default function SettingsPage() {
  const { publicKey, signMessage } = useWallet()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [connectingTelegram, setConnectingTelegram] = useState(false)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [loadingChannels, setLoadingChannels] = useState(false)
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

        // Fetch profile using API endpoint (bypasses Supabase PostgREST cache)
        const profileResponse = await fetch(`/api/profile/get?wallet_address=${publicKey.toString()}`)
        const profileResult = await profileResponse.json()
        
        if (profileResult.success && profileResult.data) {
          setProfile(profileResult.data)
          
          // Fetch channels if Telegram is connected
          if (profileResult.data.telegram_id) {
            fetchChannels()
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [publicKey])

  const fetchChannels = async () => {
    if (!publicKey || !signMessage) return
    
    setLoadingChannels(true)
    try {
      // Sign a message to authenticate
      const message = `BroadCall Channel Access\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const bs58 = await import('bs58')
      const signature = bs58.default.encode(signatureBytes)

      // Encode message as base64 for HTTP header (headers can't contain newlines)
      const messageBase64 = btoa(message)

      const response = await fetch(`/api/telegram/channels?wallet_address=${publicKey.toString()}`, {
        headers: {
          'x-wallet-signature': signature,
          'x-wallet-message': messageBase64
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChannels(data.channels || [])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    } finally {
      setLoadingChannels(false)
    }
  }

  const handleToggleChannel = async (channelId: number, currentlyEnabled: boolean) => {
    if (!publicKey || !signMessage) return
    
    try {
      // Sign a message to authenticate (includes the action to prevent replay attacks)
      const newEnabledState = !currentlyEnabled
      const message = `BroadCall Channel Toggle\nWallet: ${publicKey.toString()}\nChannel: ${channelId}\nEnable: ${newEnabledState}\nTimestamp: ${Date.now()}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const bs58 = await import('bs58')
      const signature = bs58.default.encode(signatureBytes)

      const response = await fetch('/api/telegram/channels/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          wallet_address: publicKey.toString(),
          enabled: newEnabledState,
          signature,
          message
        })
      })

      if (response.ok) {
        // Update local state
        setChannels(channels.map(ch => 
          ch.channel_id === channelId ? { ...ch, enabled: !currentlyEnabled } : ch
        ))
      } else {
        alert('Failed to update channel. Please try again.')
      }
    } catch (error) {
      console.error('Error toggling channel:', error)
      alert('Failed to update channel. Please try again.')
    }
  }

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

  const handleConnectTelegram = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first.')
      return
    }

    setConnectingTelegram(true)
    try {
      const response = await fetch('/api/telegram/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet_address: publicKey.toString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate connection token')
      }

      const { token } = await response.json()
      
      const botUsername = 'Broadcall_Bot'
      const telegramLink = `https://t.me/${botUsername}?start=${token}`
      
      window.open(telegramLink, '_blank')
      
      alert('Opening Telegram... Follow the bot instructions to complete the connection!')
    } catch (error: any) {
      console.error('Error connecting Telegram:', error)
      alert(error.message || 'Failed to generate Telegram connection link. Please try again.')
    } finally {
      setConnectingTelegram(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    if (!profile?.telegram_id) return

    if (!confirm('Are you sure you want to disconnect your Telegram account?')) {
      return
    }

    setDisconnectingTelegram(true)
    try {
      const response = await fetch('/api/telegram/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: profile.telegram_id })
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Telegram')
      }

      setProfile({ ...profile, telegram_id: null, telegram_username: null })
      alert('Telegram disconnected successfully!')
    } catch (error) {
      console.error('Error disconnecting Telegram:', error)
      alert('Failed to disconnect Telegram. Please try again.')
    } finally {
      setDisconnectingTelegram(false)
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

        {/* Telegram Connection Section */}
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.353-.168.557-.5.743-.82.762-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.751-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.325.016.093.036.305.02.471z"/>
            </svg>
            Telegram Connection
          </h2>
          <p className="text-gray-300 mb-6 text-sm">
            Connect your Telegram account to push token calls directly to your channel (coming soon!)
          </p>

          {profile?.telegram_id ? (
            <div className="space-y-4">
              <div className="bg-white/[0.08] backdrop-blur-[10px] p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Connected Account</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-white">@{profile.telegram_username}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {profile.telegram_id}</p>
              </div>
              <button
                onClick={handleDisconnectTelegram}
                disabled={disconnectingTelegram}
                className="w-full bg-white/[0.08] backdrop-blur-[10px] border border-red-500/30 text-red-400 rounded-2xl px-6 py-3 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectTelegram}
              disabled={connectingTelegram}
              className="w-full bg-gradient-to-r from-[#FF5605] via-[#FF7704] to-[#FFA103] rounded-2xl px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.353-.168.557-.5.743-.82.762-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.751-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.325.016.093.036.305.02.471z"/>
              </svg>
              <span className="text-black text-base font-bold">
                {connectingTelegram ? 'Generating Link...' : 'Connect Telegram'}
              </span>
            </button>
          )}
        </div>

        {/* Telegram Channels Section - Only show if Telegram is connected */}
        {profile?.telegram_id && (
          <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Telegram Channels
            </h2>
            <p className="text-gray-300 mb-6 text-sm">
              Add @Broadcall_Bot as an admin to your Telegram channels. Your token calls will be automatically broadcast to all enabled channels.
            </p>

            {loadingChannels ? (
              <div className="text-center py-8 text-gray-400">Loading channels...</div>
            ) : channels.length === 0 ? (
              <div className="bg-white/[0.08] backdrop-blur-[10px] p-6 rounded-2xl border border-white/10 text-center">
                <p className="text-gray-400 mb-2">No channels connected yet</p>
                <p className="text-sm text-gray-500">
                  Add @Broadcall_Bot as an admin to your Telegram channel to start broadcasting
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="bg-white/[0.08] backdrop-blur-[10px] p-4 rounded-2xl border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{channel.channel_name}</p>
                      {channel.channel_username && (
                        <p className="text-sm text-gray-400">@{channel.channel_username}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(channel.added_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleChannel(channel.channel_id, channel.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        channel.enabled ? 'bg-gradient-to-r from-orange-400 to-red-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          channel.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
