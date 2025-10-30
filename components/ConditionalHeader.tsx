'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function ConditionalHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Hide header on landing page (not authenticated), auth pages, and call pages
  if (loading || !isAuthenticated || pathname?.startsWith('/call/') || pathname?.startsWith('/auth/')) {
    return null
  }
  
  return <Header />
}
