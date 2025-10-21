'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function ConditionalHeader() {
  const { publicKey } = useWallet()
  const pathname = usePathname()
  
  // Hide header on landing page (no wallet) and call pages (they have their own glassmorphic header)
  if (!publicKey || pathname?.startsWith('/call/')) {
    return null
  }
  
  return <Header />
}
