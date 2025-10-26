import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, token_address, thesis, signature, message } = body

    if (!wallet_address || !token_address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify wallet signature
    try {
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = bs58.decode(signature)
      const publicKeyBytes = bs58.decode(wallet_address)
      
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      )

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      // Check timestamp (5 minute expiry)
      const timestampMatch = message.match(/Timestamp: (\d+)/)
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1])
        const now = Date.now()
        if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
          return NextResponse.json(
            { error: 'Message expired' },
            { status: 401 }
          )
        }
      }
    } catch (error) {
      console.error('Signature verification error:', error)
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    // Fetch token data from DexScreener
    let tokenData
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token_address}`)
      const data = await response.json()
      
      if (!data.pairs || data.pairs.length === 0) {
        return NextResponse.json(
          { error: 'Token not found on DexScreener' },
          { status: 404 }
        )
      }

      // Get the pair with highest liquidity
      const pair = data.pairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0]

      tokenData = {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        logo: pair.info?.imageUrl || '',
        price: parseFloat(pair.priceUsd || '0'),
        marketCap: parseInt(pair.fdv || '0'),
        dexscreenerUrl: `https://dexscreener.com/solana/${token_address}`,
      }
    } catch (error) {
      console.error('DexScreener fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch token data' },
        { status: 500 }
      )
    }

    // Store call in database
    const result = await pool.query(
      `INSERT INTO calls (
        wallet_address, 
        token_address, 
        token_name, 
        token_symbol, 
        token_logo, 
        price_at_call, 
        market_cap_at_call, 
        thesis, 
        dexscreener_url,
        current_price,
        current_market_cap,
        ath_price,
        ath_market_cap,
        ath_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id, created_at`,
      [
        wallet_address,
        token_address,
        tokenData.name,
        tokenData.symbol,
        tokenData.logo,
        tokenData.price,
        tokenData.marketCap,
        thesis || '',
        tokenData.dexscreenerUrl,
        tokenData.price,
        tokenData.marketCap,
        tokenData.price,
        tokenData.marketCap,
      ]
    )

    const callId = result.rows[0].id
    const createdAt = result.rows[0].created_at

    // Trigger broadcast to Telegram channels
    try {
      console.log('Triggering broadcast for call:', callId)
      const broadcastResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/telegram/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address,
          call_id: callId,
          signature,
          message,
        }),
      })

      const broadcastResult = await broadcastResponse.json()
      if (!broadcastResponse.ok) {
        console.error('Broadcast failed:', broadcastResult)
      } else {
        console.log('Broadcast successful:', broadcastResult)
      }
    } catch (error) {
      console.error('Broadcast trigger error:', error)
      // Don't fail the call creation if broadcast fails
    }

    return NextResponse.json({
      success: true,
      call: {
        id: callId,
        token_address,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_logo: tokenData.logo,
        price_at_call: tokenData.price,
        market_cap_at_call: tokenData.marketCap,
        thesis,
        dexscreener_url: tokenData.dexscreenerUrl,
        created_at: createdAt,
      },
    })
  } catch (error) {
    console.error('Create call error:', error)
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    )
  }
}
