'use client'

interface EmbeddedChartProps {
  tokenAddress: string
  theme?: 'light' | 'dark'
}

export default function EmbeddedChart({ tokenAddress, theme = 'dark' }: EmbeddedChartProps) {
  const chartUrl = `https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=${theme}&trades=0&info=0`
  
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden bg-gray-900">
      <iframe
        src={chartUrl}
        className="w-full h-full border-0"
        title="DexScreener Chart"
      />
    </div>
  )
}
