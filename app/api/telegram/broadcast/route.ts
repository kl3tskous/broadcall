import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { 
      wallet_address, 
      call_id,
      signature,
      message
    } = await request.json()

    if (!wallet_address || !call_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Require authentication for broadcast
    if (!signature || !message) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the signature
    try {
      const { PublicKey } = await import('@solana/web3.js')
      const nacl = await import('tweetnacl')
      const bs58 = await import('bs58')
      
      const publicKey = new PublicKey(wallet_address)
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = bs58.default.decode(signature)

      const verified = nacl.default.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      )

      if (!verified || !message.includes(wallet_address)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      // Verify the call_id is bound to the signature (prevents call swap attacks)
      if (!message.includes(`Call: ${call_id}`)) {
        return NextResponse.json(
          { error: 'Signature does not match call' },
          { status: 401 }
        )
      }

      // Verify timestamp freshness (reject signatures older than 5 minutes)
      const timestampMatch = message.match(/Timestamp: (\d+)/)
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1])
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        if (now - timestamp > fiveMinutes) {
          return NextResponse.json(
            { error: 'Signature expired' },
            { status: 401 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid message format' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Fetch trusted data from database (prevents content tampering)
    const client = await pool.connect()
    let token_name, token_address, roi, current_price, market_cap, thesis, platform_links

    try {
      // Fetch call data from database
      const callResult = await client.query(
        'SELECT * FROM calls WHERE id = $1 AND creator_wallet = $2',
        [call_id, wallet_address]
      )

      if (callResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Call not found or unauthorized' },
          { status: 404 }
        )
      }

      const call = callResult.rows[0]
      token_name = call.token_name || 'Unknown Token'
      token_address = call.token_address
      thesis = call.thesis
      
      // Calculate ROI from database data
      const initial_price = parseFloat(call.initial_price || '0')
      current_price = initial_price // Will be updated with real-time data if needed
      market_cap = call.initial_mcap

      // TODO: Fetch real-time price for accurate ROI
      roi = 0

      // Fetch user's referral codes from database (trusted source)
      const userResult = await client.query(
        'SELECT * FROM user_settings WHERE wallet_address = $1',
        [wallet_address]
      )

      const userSettings = userResult.rows[0] || {}
      
      // Build platform links with user's referral codes
      platform_links = {
        gmgn: userSettings.gmgn_ref 
          ? `https://gmgn.ai/sol/token/${token_address}?ref=${userSettings.gmgn_ref}`
          : `https://gmgn.ai/sol/token/${token_address}`,
        axiom: userSettings.axiom_ref
          ? `https://axiom.trade/?token=${token_address}&ref=${userSettings.axiom_ref}`
          : `https://axiom.trade/?token=${token_address}`,
        photon: userSettings.photon_ref
          ? `https://photon-sol.tinyastro.io/en/lp/${token_address}?ref=${userSettings.photon_ref}`
          : `https://photon-sol.tinyastro.io/en/lp/${token_address}`,
        bullx: userSettings.bullx_ref
          ? `https://bullx.io/terminal?chainId=1399811149&address=${token_address}&r=${userSettings.bullx_ref}`
          : `https://bullx.io/terminal?chainId=1399811149&address=${token_address}`,
        trojan: userSettings.trojan_ref
          ? `https://trojan.bot/trade/${token_address}?ref=${userSettings.trojan_ref}`
          : `https://trojan.bot/trade/${token_address}`
      }
      // Now get all enabled channels for this user (reuse same connection)
      const channelsResult = await client.query(
        `SELECT channel_id, channel_name FROM telegram_channels 
         WHERE wallet_address = $1 AND enabled = true`,
        [wallet_address]
      )

      if (channelsResult.rows.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No enabled channels to broadcast to',
          broadcasts: []
        })
      }

      // Get user's alias for the message
      const profileResult = await client.query(
        `SELECT alias FROM profiles WHERE wallet_address = $1`,
        [wallet_address]
      )
      const alias = profileResult.rows[0]?.alias || 'A trader'

      // Format the broadcast message
      const roiText = roi ? (roi >= 0 ? `+${roi.toFixed(2)}%` : `${roi.toFixed(2)}%`) : 'Tracking...'
      const roiEmoji = roi && roi >= 0 ? '🚀' : '📉'
      
      let message = `${roiEmoji} NEW TOKEN CALL from ${alias}\n\n`
      message += `💎 ${token_name}\n`
      message += `📊 ROI: ${roiText}\n`
      
      if (current_price) {
        message += `💰 Price: $${current_price}\n`
      }
      if (market_cap) {
        message += `📈 Market Cap: $${market_cap.toLocaleString()}\n`
      }
      if (thesis) {
        message += `\n💭 Thesis: "${thesis}"\n`
      }

      message += `\n🔗 Contract: \`${token_address}\`\n`
      message += `\n🎯 Trade on your favorite platform:`

      // Send to all enabled channels
      const broadcasts = await Promise.all(
        channelsResult.rows.map(async (channel) => {
          try {
            // Create inline keyboard with platform buttons
            const buttons = []
            const row1 = []
            const row2 = []

            if (platform_links?.gmgn) {
              row1.push({ text: '📱 GMGN', url: platform_links.gmgn })
            }
            if (platform_links?.axiom) {
              row1.push({ text: '⚡ Axiom', url: platform_links.axiom })
            }
            if (platform_links?.photon) {
              row1.push({ text: '💫 Photon', url: platform_links.photon })
            }
            
            if (platform_links?.bullx) {
              row2.push({ text: '🐂 BullX', url: platform_links.bullx })
            }
            if (platform_links?.trojan) {
              row2.push({ text: '🏛️ Trojan', url: platform_links.trojan })
            }

            if (row1.length > 0) buttons.push(row1)
            if (row2.length > 0) buttons.push(row2)

            // Add DexScreener button
            buttons.push([
              { text: '📊 View Chart', url: `https://dexscreener.com/solana/${token_address}` }
            ])

            const response = await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: channel.channel_id,
                  text: message,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: buttons
                  }
                })
              }
            )

            const result = await response.json()
            
            if (result.ok) {
              return {
                channel_id: channel.channel_id,
                channel_name: channel.channel_name,
                success: true
              }
            } else {
              console.error(`Failed to send to ${channel.channel_name}:`, result)
              return {
                channel_id: channel.channel_id,
                channel_name: channel.channel_name,
                success: false,
                error: result.description
              }
            }
          } catch (error) {
            console.error(`Error broadcasting to ${channel.channel_name}:`, error)
            return {
              channel_id: channel.channel_id,
              channel_name: channel.channel_name,
              success: false,
              error: 'Failed to send message'
            }
          }
        })
      )

      const successCount = broadcasts.filter(b => b.success).length
      
      return NextResponse.json({
        success: true,
        message: `Broadcasted to ${successCount}/${broadcasts.length} channels`,
        broadcasts
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in broadcast:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
