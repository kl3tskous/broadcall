'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Header } from './Header'

export function ConditionalHeader() {
  const { publicKey } = useWallet()
  
  // Only show Header when wallet is connected
  if (!publicKey) {
    return null
  }
  
  return <Header />
}
