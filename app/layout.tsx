import './globals.css'
import type { Metadata } from 'next'
import { WalletProvider } from '@/components/WalletProvider'
import { ConditionalHeader } from '@/components/ConditionalHeader'

export const metadata: Metadata = {
  title: 'BroadCall - Solana Influencer Platform',
  description: 'Flex-worthy token call pages for Solana influencers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ConditionalHeader />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
