import './globals.css'
import type { Metadata } from 'next'
import { WalletProvider } from '@/components/WalletProvider'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Callor - Solana Influencer Platform',
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
          <Header />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
