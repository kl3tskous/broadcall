# How to Test the Token Call Broadcasting System

## Prerequisites
✅ Telegram account linked (telegram_id: 6046882827, @Jobbatrades)
✅ Channel "hi" connected and enabled
✅ Server running on port 5000
✅ Telegram bot running (@Broadcall_Bot)

## Test Flow

### Step 1: Create a Token Call
1. Navigate to `/create-call` in your browser
2. Connect your Phantom wallet
3. Enter a valid Solana token address (example: `So11111111111111111111111111111111111111112` for wrapped SOL)
4. Optionally add a thesis (e.g., "This is a test call for my community!")
5. Click "📢 Create Call & Broadcast"
6. Sign the transaction when prompted

### Step 2: Verify Database Storage
The call should be stored in the `calls` table with:
- Token name, symbol, logo from DexScreener
- Current price and market cap
- Your thesis
- ROI starting at 0% (will update as price changes)

### Step 3: Check Telegram Broadcast
Go to your Telegram channel "hi" and verify the message appears with:

**Expected Message Format:**
```
🚀 NEW TOKEN CALL

💎 [Token Name]

📊 Current ROI: +0.00%
💰 Price: $0.00000123
📈 Market Cap: $1.23M

💭 Jobba's Thesis:
"This is a test call for my community!"

📝 Contract: `So11111...`

🎯 Buy Now:
```

**With Inline Buttons:**
- Row 1: 📱 GMGN | ⚡ Axiom | 💫 Photon
- Row 2: 🐂 BullX | 🏛️ Trojan
- Row 3: 📊 View Chart (DexScreener)

### Step 4: Test Buy Buttons
Click each button to verify:
1. Links open correctly
2. Your referral codes are included in the URLs
3. The correct token address is passed

## Debugging
If broadcast fails, check:
1. Server logs: `grep -i "broadcast" /tmp/logs/Server_*.log`
2. Channel is enabled in settings
3. Bot has permission to post in the channel
4. Signature verification passes

## Example Token Addresses to Test
- Wrapped SOL: `So11111111111111111111111111111111111111112`
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Bonk: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
