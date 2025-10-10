'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Call } from '@/utils/supabaseClient'

const REFERRAL_CODE = '7rpqjHdf'

export default function CallPage() {
  const params = useParams()
  const id = params.id as string
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setCall(data)

        await supabase
          .from('calls')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id)
      } catch (error) {
        console.error('Error fetching call:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCall()
    }
  }, [id])

  const handleBuyClick = async () => {
    if (call) {
      await supabase
        .from('calls')
        .update({ clicks: (call.clicks || 0) + 1 })
        .eq('id', id)

      const buyUrl = `https://t.me/gmgnaibot?start=i_${REFERRAL_CODE}_sol_${call.token_address}`
      window.open(buyUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-2">Call Not Found</h2>
          <p className="text-gray-400">This call doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Token Call
          </h1>
          <div className="text-sm text-gray-500">
            Views: {call.views} | Clicks: {call.clicks}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Token Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Token Address
                </label>
                <div className="bg-dark-bg p-3 rounded-lg font-mono text-sm break-all">
                  {call.token_address}
                </div>
              </div>

              {call.thesis && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Thesis
                  </label>
                  <div className="bg-dark-bg p-3 rounded-lg text-sm">
                    {call.thesis}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Platform
                </label>
                <div className="bg-dark-bg p-3 rounded-lg text-sm">
                  {call.platform}
                </div>
              </div>

              <button
                onClick={handleBuyClick}
                className="btn-primary w-full mt-6"
              >
                Buy via GMGN
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Price Chart</h2>
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <iframe
                src={`https://www.gmgn.cc/kline/sol/${call.token_address}?theme=dark`}
                className="absolute inset-0 w-full h-full rounded-lg"
                title="GMGN Chart"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
