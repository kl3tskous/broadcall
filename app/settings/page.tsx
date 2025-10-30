'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/components/UserProfile'
import { GmgnLogo, AxiomLogo, PhotonLogo, BullxLogo, TrojanLogo } from '@/components/PlatformLogos'
import { CallPageHeader } from '@/components/CallPageHeader'

interface User {
  id: string
  twitter_username: string
  twitter_name: string
  twitter_id: string
  profile_image_url: string
  banner_image_url: string | null
  custom_profile_image: string | null
  custom_banner_image: string | null
  bio: string | null
  telegram_id: string | null
  telegram_username: string | null
  access_granted: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
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
  const [tradesInName, setTradesInName] = useState('')
  const [tradesInImage, setTradesInImage] = useState('')
  const [uploadingTradesImage, setUploadingTradesImage] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()

        if (!authData.authenticated) {
          router.push('/')
          return
        }

        // User is authenticated, check access
        if (!authData.user.access_granted) {
          router.push('/dashboard')
          return
        }

        setUser(authData.user)

        // Fetch user settings
        const settingsResponse = await fetch('/api/settings/get')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.success && settingsData.settings) {
            setRefCodes({
              gmgn_ref: settingsData.settings.gmgn_ref || '',
              axiom_ref: settingsData.settings.axiom_ref || '',
              photon_ref: settingsData.settings.photon_ref || '',
              bullx_ref: settingsData.settings.bullx_ref || '',
              trojan_ref: settingsData.settings.trojan_ref || ''
            })
            setTradesInName(settingsData.settings.trades_in_name || '')
            setTradesInImage(settingsData.settings.trades_in_image || '')
          }
        }

        // Fetch channels if Telegram is connected
        if (authData.user.telegram_id) {
          fetchChannels()
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const fetchChannels = async () => {
    setLoadingChannels(true)
    try {
      const response = await fetch('/api/telegram/channels')
      
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
    try {
      const newEnabledState = !currentlyEnabled
      
      const response = await fetch('/api/telegram/channels/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          enabled: newEnabledState
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
    setSaving(true)
    try {
      const response = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...refCodes,
          trades_in_name: tradesInName,
          trades_in_image: tradesInImage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      alert('Settings saved successfully!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      alert(error?.message || 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingProfileImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      if (user) {
        setUser({ ...user, custom_profile_image: data.url })
      }
      alert('Profile picture uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading profile image:', error)
      alert(error?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingProfileImage(false)
    }
  }

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingBannerImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/banner-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      if (user) {
        setUser({ ...user, custom_banner_image: data.url })
      }
      alert('Banner uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading banner:', error)
      alert(error?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingBannerImage(false)
    }
  }

  const handleTradesImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingTradesImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/trades-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setTradesInImage(data.url)
      alert('Group image uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert(error?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingTradesImage(false)
    }
  }

  const handleConnectTelegram = async () => {
    setConnectingTelegram(true)
    try {
      const response = await fetch('/api/telegram/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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
    if (!user?.telegram_id) return

    if (!confirm('Are you sure you want to disconnect your Telegram account?')) {
      return
    }

    setDisconnectingTelegram(true)
    try {
      const response = await fetch('/api/telegram/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.telegram_id })
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Telegram')
      }

      setUser({ ...user, telegram_id: null, telegram_username: null })
      setChannels([])
      alert('Telegram disconnected successfully!')
    } catch (error) {
      console.error('Error disconnecting Telegram:', error)
      alert('Failed to disconnect Telegram. Please try again.')
    } finally {
      setDisconnectingTelegram(false)
    }
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
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="text-xl text-gray-300 relative z-10">Loading settings...</div>
      </div>
    )
  }

  if (!user) {
    return null
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

        {/* User Profile Section */}
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Profile</h2>
          <div className="flex items-center gap-4">
            {user.profile_image_url && (
              <img
                src={user.profile_image_url}
                alt={user.twitter_name}
                className="w-16 h-16 rounded-full border-2 border-orange-600"
              />
            )}
            <div>
              <p className="text-white font-bold text-lg">{user.twitter_name}</p>
              <p className="text-gray-400">@{user.twitter_username}</p>
            </div>
          </div>
        </div>

        {/* Profile & Banner Images Section */}
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Profile & Banner Images
          </h2>
          <p className="text-gray-300 mb-6 text-sm">
            Your X (Twitter) images are automatically synced. Upload custom images to override them on your token call pages.
          </p>

          {/* Profile Picture */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-white">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={user.custom_profile_image || user.profile_image_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-2 border-orange-600 object-cover"
                />
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingProfileImage}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white hover:bg-white/[0.12] transition-colors"
                  >
                    {uploadingProfileImage ? 'Uploading...' : user.custom_profile_image ? 'Change Custom Image' : 'Upload Custom Image'}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    {user.custom_profile_image ? 
                      `Using custom image • ` : 
                      `Using X profile picture • `
                    }
                    Recommended: Square, max 5MB
                  </p>
                  {user.custom_profile_image && (
                    <button
                      onClick={async () => {
                        if (confirm('Remove custom profile picture and use X profile picture?')) {
                          const { data, error } = await fetch('/api/upload/profile-image', {
                            method: 'DELETE'
                          })
                          if (!error) {
                            setUser({ ...user, custom_profile_image: null })
                            alert('Custom profile picture removed')
                          }
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 mt-2"
                    >
                      Remove custom image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium mb-3 text-white">
                Banner Image
              </label>
              <div className="space-y-4">
                {(user.custom_banner_image || user.banner_image_url) && (
                  <img
                    src={user.custom_banner_image || user.banner_image_url || ''}
                    alt="Banner"
                    className="w-full h-32 md:h-40 rounded-2xl border-2 border-orange-600 object-cover"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    disabled={uploadingBannerImage}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white hover:bg-white/[0.12] transition-colors"
                  >
                    {uploadingBannerImage ? 'Uploading...' : user.custom_banner_image ? 'Change Custom Banner' : 'Upload Custom Banner'}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    {user.custom_banner_image ? 
                      `Using custom banner • ` : 
                      user.banner_image_url ? 
                        `Using X banner • ` : 
                        `No banner set • `
                    }
                    Recommended: 1500x500px, max 5MB
                  </p>
                  {user.custom_banner_image && (
                    <button
                      onClick={async () => {
                        if (confirm('Remove custom banner and use X banner?')) {
                          const { data, error } = await fetch('/api/upload/banner-image', {
                            method: 'DELETE'
                          })
                          if (!error) {
                            setUser({ ...user, custom_banner_image: null })
                            alert('Custom banner removed')
                          }
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 mt-2 block"
                    >
                      Remove custom banner
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Connection Section */}
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.353-.168.557-.5.743-.82.762-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.751-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.325.016.093.036.305.02.471z"/>
            </svg>
            Telegram Connection
          </h2>
          <p className="text-gray-300 mb-6 text-sm">
            Connect your Telegram account to push token calls directly to your channel
          </p>

          {user.telegram_id ? (
            <div className="space-y-4">
              <div className="bg-white/[0.08] backdrop-blur-[10px] p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Connected Account</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-white">@{user.telegram_username}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {user.telegram_id}</p>
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
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.353-.168.557-.5.743-.82.762-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.230.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.751-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.325.016.093.036.305.02.471z"/>
              </svg>
              <span className="text-black text-base font-bold">
                {connectingTelegram ? 'Generating Link...' : 'Connect Telegram'}
              </span>
            </button>
          )}
        </div>

        {/* Telegram Channels Section - Only show if Telegram is connected */}
        {user.telegram_id && (
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
        </div>

        {/* Trades In Section */}
        <div className="bg-white/[0.12] backdrop-blur-[20px] border border-white/20 rounded-[34px] p-6 md:p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.38)] mt-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Trades In</h2>
          <p className="text-gray-300 mb-6 text-sm">
            Display your trading group or channel info on your call pages
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Group/Channel Name
              </label>
              <input
                type="text"
                value={tradesInName}
                onChange={(e) => setTradesInName(e.target.value)}
                placeholder="@your_channel"
                className="w-full px-4 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Example: @ccf_fnf - This will be displayed on your call pages
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Group/Channel Logo
              </label>
              <div className="flex items-center gap-4">
                {tradesInImage && (
                  <img
                    src={tradesInImage}
                    alt="Group logo"
                    className="w-16 h-16 rounded-full border-2 border-orange-600 object-cover"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTradesImageUpload}
                    disabled={uploadingTradesImage}
                    className="hidden"
                    id="trades-image-upload"
                  />
                  <label
                    htmlFor="trades-image-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-white/[0.08] backdrop-blur-[10px] border border-white/10 rounded-2xl text-white hover:bg-white/[0.12] transition-colors"
                  >
                    {uploadingTradesImage ? 'Uploading...' : tradesInImage ? 'Change Image' : 'Upload Image'}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Recommended: Square image, max 5MB
                  </p>
                </div>
              </div>
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
      </div>
    </main>
  )
}
