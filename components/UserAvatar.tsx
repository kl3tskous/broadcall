'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  twitter_username: string
  twitter_name: string
  profile_image_url?: string
  joined_waitlist: boolean
  access_granted: boolean
}

export default function UserAvatar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        {user.profile_image_url ? (
          <Image
            src={user.profile_image_url}
            alt={user.twitter_name}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-orange-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center font-bold">
            {user.twitter_name[0]?.toUpperCase()}
          </div>
        )}
        <span className="hidden md:block font-semibold">
          {user.twitter_name}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                {user.profile_image_url && (
                  <Image
                    src={user.profile_image_url}
                    alt={user.twitter_name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-bold text-white">{user.twitter_name}</p>
                  <p className="text-sm text-gray-400">@{user.twitter_username}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              {user.access_granted ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-xs border border-green-500/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-400 font-semibold">Access Granted</span>
                </div>
              ) : user.joined_waitlist ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full text-xs border border-orange-500/50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-400 font-semibold">On Waitlist</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-xs border border-blue-500/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-blue-400 font-semibold">Setup Required</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {user.access_granted && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      router.push('/dashboard')
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      router.push('/settings')
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    Settings
                  </button>
                  <div className="h-px bg-white/10 my-2" />
                </>
              )}
              
              {user.joined_waitlist && !user.access_granted && (
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/auth/waitlist-confirmed')
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                >
                  Waitlist Status
                </button>
              )}

              {!user.joined_waitlist && (
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/auth/connect-telegram')
                  }}
                  className="w-full px-4 py-2 text-left text-orange-400 hover:bg-white/10 transition-colors font-semibold"
                >
                  Complete Setup
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
