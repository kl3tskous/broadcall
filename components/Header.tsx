'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  twitter_username: string
  twitter_name: string
  profile_image_url: string
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (data.authenticated) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }
    
    checkAuth()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/broadCall-logo.png"
              alt="BroadCall"
              width={180}
              height={180}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Center navigation items */}
          <nav className="hidden md:flex items-center gap-8">
            {mounted && user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/create-call"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Create Call
                </Link>
                <Link
                  href="/settings"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* User info on the right */}
          <div className="flex items-center gap-4">
            {mounted && user && (
              <Link
                href="/settings"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.profile_image_url && (
                  <Image
                    src={user.profile_image_url}
                    alt={user.twitter_name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-white text-sm hidden md:block">
                  @{user.twitter_username}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
