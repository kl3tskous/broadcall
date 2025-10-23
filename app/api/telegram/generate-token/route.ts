import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'
import crypto from 'crypto'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, signature, message } = await request.json()

    if (!wallet_address || !signature || !message) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and message are required' },
        { status: 400 }
      )
    }

    const messageParts = message.split('\n')
    if (messageParts.length !== 2 || messageParts[0] !== 'BroadCall Telegram Connection') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 401 }
      )
    }

    const timestampPart = messageParts[1]
    if (!timestampPart.startsWith('Timestamp: ')) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 401 }
      )
    }

    const timestampStr = timestampPart.substring('Timestamp: '.length)
    const timestamp = parseInt(timestampStr, 10)
    
    if (!Number.isFinite(timestamp) || timestamp.toString() !== timestampStr) {
      return NextResponse.json(
        { error: 'Invalid timestamp format' },
        { status: 401 }
      )
    }

    const now = Date.now()
    const timeDiff = Math.abs(now - timestamp)
    
    if (timeDiff > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Signature expired. Please try again.' },
        { status: 401 }
      )
    }

    try {
      const publicKey = new PublicKey(wallet_address)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = bs58.decode(signature)

      const verified = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      )

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError)
      return NextResponse.json(
        { error: 'Invalid wallet address or signature' },
        { status: 401 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    
    const { error } = await supabase
      .from('telegram_connection_tokens')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        token,
      })

    if (error) {
      console.error('Error creating token:', error)
      return NextResponse.json(
        { error: 'Failed to generate token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error in generate-token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
