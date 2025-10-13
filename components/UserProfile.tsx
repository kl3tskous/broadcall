'use client'

import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '@/utils/supabaseClient'
import { FileUploader } from './FileUploader'
import { normalizeUploadURL } from '@/lib/objectStorage'

interface UserProfileProps {
  walletAddress: string
}

export function UserProfile({ walletAddress }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [alias, setAlias] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [bio, setBio] = useState('')
  const [telegram, setTelegram] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (data) {
          setProfile(data)
          setAlias(data.alias || '')
          setAvatarUrl(data.avatar_url || '')
          setBannerUrl(data.banner_url || '')
          setTwitterHandle(data.twitter_handle || '')
          setBio(data.bio || '')
          setTelegram(data.telegram || '')
          setWebsite(data.website || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [walletAddress])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Save all profile data via API route (bypasses schema cache)
      const response = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet_address: walletAddress,
          alias: alias || null,
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          twitter_handle: twitterHandle || null,
          bio: bio || null,
          telegram: telegram || null,
          website: website || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setMessage('Profile saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error?.message || 'Failed to save profile'
      setMessage(`Error: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url)
  }

  const handleBannerUpload = (url: string) => {
    setBannerUrl(url)
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name / Alias
          </label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="e.g., SolTrader, CryptoKing, etc."
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">
            This will appear on your calls as "Called by @{alias || 'yourname'}"
          </p>
        </div>

        {/* Image Previews Section */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Image Previews</h3>
          <div className="flex gap-6">
            {/* Profile Picture Preview */}
            <div className="flex-shrink-0">
              <p className="text-xs text-gray-400 mb-2">Profile Picture</p>
              <div className="w-24 h-24 rounded-full border-2 border-orange-500/50 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2">No avatar</span>
                )}
              </div>
            </div>

            {/* Banner Preview */}
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-2">Banner (Flex Card Background)</p>
              <div className="w-full h-24 rounded-lg border-2 border-orange-500/50 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                {bannerUrl ? (
                  <img 
                    src={bannerUrl} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-500">No banner</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Paste image URL or upload file"
              className="input-field flex-1"
            />
            <FileUploader
              id="avatar-upload"
              onUploadComplete={handleAvatarUpload}
              accept="image/*"
              maxSizeMB={5}
              buttonText="Upload"
              buttonClassName="btn-primary whitespace-nowrap"
            />
          </div>
          <p className="text-xs text-gray-400">
            Paste a URL or upload from your device (max 5MB)
          </p>
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner Image (Flex Card Background)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="Paste image URL or upload file"
              className="input-field flex-1"
            />
            <FileUploader
              id="banner-upload"
              onUploadComplete={handleBannerUpload}
              accept="image/*"
              maxSizeMB={10}
              buttonText="Upload"
              buttonClassName="btn-primary whitespace-nowrap"
            />
          </div>
          <p className="text-xs text-gray-400">
            This banner will be used as the background on your token call flex cards (max 10MB)
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            placeholder="Tell people about yourself..."
            maxLength={160}
            rows={3}
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {bio.length}/160 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-300 mb-2">
              Twitter/X
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                id="twitterHandle"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
                placeholder="username"
                className="input-field pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-2">
              Telegram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                id="telegram"
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                placeholder="username"
                className="input-field pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            message.startsWith('Error') 
              ? 'bg-red-900/20 border border-red-500/50 text-red-400' 
              : 'bg-green-900/20 border border-green-500/50 text-green-400'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
