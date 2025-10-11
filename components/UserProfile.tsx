'use client'

import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '@/utils/supabaseClient'

interface UserProfileProps {
  walletAddress: string
}

export function UserProfile({ walletAddress }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [alias, setAlias] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
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
          setTwitterHandle(data.twitter_handle || '')
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
      const profileData = {
        wallet_address: walletAddress,
        alias: alias || null,
        avatar_url: avatarUrl || null,
        twitter_handle: twitterHandle || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'wallet_address'
        })

      if (error) throw error

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
            This will appear on your calls as "First shared by @{alias || 'yourname'}"
          </p>
        </div>

        <div>
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-2">
            Avatar URL (Optional)
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">
            Direct link to your avatar image
          </p>
          {avatarUrl && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              <img 
                src={avatarUrl} 
                alt="Avatar preview" 
                className="w-16 h-16 rounded-full border-2 border-orange-500/50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-300 mb-2">
            Twitter/X Handle (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              id="twitterHandle"
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
              placeholder="yourusername"
              className="input-field pl-8"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your X/Twitter handle without the @ symbol
          </p>
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
