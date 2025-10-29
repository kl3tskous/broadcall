import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!;
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
    
    if (!TELEGRAM_WEBHOOK_SECRET || secretToken !== TELEGRAM_WEBHOOK_SECRET) {
      console.error('Invalid or missing Telegram webhook secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const update = await request.json();
    
    console.log('Received Telegram webhook update:', JSON.stringify(update, null, 2));
    
    const message = update.message;
    const chatMember = update.my_chat_member;
    
    if (message) {
      const from = message.from;
      const telegramId = from.id;
      const telegramUsername = from.username || from.first_name;
      const text = message.text || '';
      const chatId = message.chat.id;
      
      if (text.startsWith('/start')) {
        const args = text.split(' ').slice(1);
        
        if (args.length === 0) {
          await sendTelegramMessage(chatId, 
            `👋 Welcome to BroadCall, ${from.first_name}!\n\n` +
            "To connect your Telegram account to BroadCall:\n" +
            "1. Go to your BroadCall Settings page\n" +
            "2. Click 'Connect Telegram'\n" +
            "3. Follow the link to start the connection\n\n" +
            "Once connected, you'll be able to push your token calls directly to Telegram!"
          );
        } else {
          const param = args[0];
          
          if (param.length >= 32 && param.length <= 44) {
            await sendTelegramMessage(chatId, "🔄 Verifying your wallet and adding you to the waitlist...");
            
            const response = await fetch(`${BACKEND_URL}/api/waitlist/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wallet_address: param,
                telegram_user_id: String(telegramId),
                telegram_username: telegramUsername
              })
            });
            
            if (response.ok) {
              await sendTelegramMessage(chatId,
                `🎉 Congratulations, @${telegramUsername}!\n\n` +
                "✅ You're now on the BroadCall waitlist!\n\n" +
                "We'll notify you right here on Telegram as soon as BroadCall launches.\n\n" +
                "Get ready to turn your token calls into income! 🚀"
              );
            } else if (response.status === 400) {
              const error = await response.json();
              await sendTelegramMessage(chatId,
                `❌ ${error.error || 'Invalid wallet address'}\n\n` +
                "Please make sure you're using the correct Solana wallet address from the BroadCall website."
              );
            } else if (response.status === 404) {
              await sendTelegramMessage(chatId,
                "❌ This wallet address is not recognized.\n\n" +
                "Please:\n" +
                "1. Go to BroadCall website\n" +
                "2. Connect your wallet\n" +
                "3. Click 'Join Waitlist'\n" +
                "4. Follow the instructions to link your Telegram"
              );
            } else {
              await sendTelegramMessage(chatId, "❌ Something went wrong. Please try again later or contact support.");
            }
          } else {
            const token = param;
            await sendTelegramMessage(chatId, "🔄 Verifying your connection token...");
            
            const response = await fetch(`${BACKEND_URL}/api/telegram/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token,
                telegram_id: telegramId,
                telegram_username: telegramUsername
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              await sendTelegramMessage(chatId,
                `🎉 Success! You're now on the BroadCall waitlist!\n\n` +
                `✅ Telegram Connected: @${telegramUsername}\n` +
                `✅ Twitter Account: @${data.twitter_username || 'Unknown'}\n\n` +
                "We'll notify you right here on Telegram when BroadCall launches.\n\n" +
                "Get ready to turn your token calls into income! 🚀"
              );
            } else if (response.status === 400) {
              const error = await response.json();
              await sendTelegramMessage(chatId,
                `❌ Connection failed: ${error.error || 'Invalid or expired token'}\n\n` +
                "Please try again from the BroadCall website."
              );
            } else {
              await sendTelegramMessage(chatId, "❌ Something went wrong. Please try again later or contact support.");
            }
          }
        }
      } else if (text === '/status') {
        const response = await fetch(`${BACKEND_URL}/api/telegram/status?telegram_id=${telegramId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            await sendTelegramMessage(chatId,
              "✅ Your Telegram is connected to BroadCall!\n\n" +
              `👤 Telegram: @${data.telegram_username || 'Unknown'}\n` +
              `💼 BroadCall: ${data.alias || 'Anonymous'}\n` +
              `🔗 Wallet: ${(data.wallet_address || 'N/A').slice(0, 8)}...\n\n` +
              "Use /disconnect to unlink your account."
            );
          } else {
            await sendTelegramMessage(chatId,
              "❌ Your Telegram is not connected to any BroadCall account.\n\n" +
              "Go to BroadCall Settings to connect your account!"
            );
          }
        } else {
          await sendTelegramMessage(chatId, "❌ Could not check connection status. Please try again later.");
        }
      } else if (text === '/disconnect') {
        await sendTelegramMessage(chatId, "🔄 Disconnecting your Telegram account...");
        
        const response = await fetch(`${BACKEND_URL}/api/telegram/disconnect`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: telegramId })
        });
        
        if (response.ok) {
          await sendTelegramMessage(chatId,
            "✅ Your Telegram account has been disconnected from BroadCall.\n\n" +
            "You can reconnect anytime from your BroadCall Settings page."
          );
        } else if (response.status === 404) {
          await sendTelegramMessage(chatId,
            "❌ No BroadCall account is connected to this Telegram.\n\n" +
            "Nothing to disconnect!"
          );
        } else {
          await sendTelegramMessage(chatId, "❌ Something went wrong. Please try again later.");
        }
      } else if (text.startsWith('/waitlist')) {
        const args = text.split(' ').slice(1);
        
        if (args.length === 0) {
          await sendTelegramMessage(chatId,
            "⚠️ Please provide your wallet address.\n\n" +
            "Usage: /waitlist YOUR_WALLET_ADDRESS\n\n" +
            "Example:\n" +
            "/waitlist 5SYktAH1t3ygsxKMQg3rN7T8p8UhXQP88fNKQue7mSBT"
          );
        } else {
          const walletAddress = args[0];
          await sendTelegramMessage(chatId, "🔄 Verifying your wallet and adding you to the waitlist...");
          
          const response = await fetch(`${BACKEND_URL}/api/waitlist/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet_address: walletAddress,
              telegram_user_id: String(telegramId),
              telegram_username: telegramUsername
            })
          });
          
          if (response.ok) {
            await sendTelegramMessage(chatId,
              `🎉 Congratulations, @${telegramUsername}!\n\n` +
              "✅ You're now on the BroadCall waitlist!\n\n" +
              "We'll notify you right here on Telegram as soon as BroadCall launches.\n\n" +
              "Get ready to turn your token calls into income! 🚀"
            );
          } else if (response.status === 400) {
            const error = await response.json();
            await sendTelegramMessage(chatId,
              `❌ ${error.error || 'Invalid wallet address'}\n\n` +
              "Please make sure you're using the correct Solana wallet address from the BroadCall website."
            );
          } else if (response.status === 404) {
            await sendTelegramMessage(chatId,
              "❌ This wallet address is not recognized.\n\n" +
              "Please:\n" +
              "1. Go to BroadCall website\n" +
              "2. Connect your wallet\n" +
              "3. Click 'Join Waitlist'\n" +
              "4. Follow the instructions to link your Telegram"
            );
          } else {
            await sendTelegramMessage(chatId, "❌ Something went wrong. Please try again later or contact support.");
          }
        }
      } else if (text === '/help') {
        await sendTelegramMessage(chatId,
          "🤖 BroadCall Telegram Bot\n\n" +
          "Available commands:\n" +
          "/start - Connect your Telegram to BroadCall\n" +
          "/status - Check your connection status\n" +
          "/disconnect - Unlink your Telegram account\n" +
          "/help - Show this help message\n\n" +
          "📢 Channel Broadcasting:\n" +
          "Add me as an admin to your channel to broadcast your token calls automatically!\n\n" +
          "Visit BroadCall Settings to get your connection link!"
        );
      }
    } else if (chatMember) {
      const chat = chatMember.chat;
      const newStatus = chatMember.new_chat_member.status;
      const oldStatus = chatMember.old_chat_member.status;
      const user = chatMember.from;
      
      if (chat.type === 'channel' || chat.type === 'supergroup') {
        if (newStatus === 'administrator' && (oldStatus === 'left' || oldStatus === 'member')) {
          console.log(`Bot added as admin to channel: ${chat.title} (ID: ${chat.id}) by user ${user.id}`);
          
          const response = await fetch(`${BACKEND_URL}/api/telegram/add-channel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_id: user.id,
              channel_id: chat.id,
              channel_name: chat.title,
              channel_username: chat.username
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            await sendTelegramMessage(chat.id,
              "✅ BroadCall broadcasting enabled!\n\n" +
              `This channel is now connected to ${data.alias || 'a BroadCall'} profile.\n\n` +
              "Token calls will be automatically posted here when created. " +
              "Manage broadcasting settings in your BroadCall dashboard."
            );
          } else if (response.status === 404) {
            await sendTelegramMessage(chat.id,
              "❌ Could not connect this channel.\n\n" +
              `The user who added me (@${user.username || user.first_name}) doesn't have a connected BroadCall account.\n\n` +
              "Please:\n" +
              "1. Go to BroadCall Settings\n" +
              "2. Connect your Telegram account first\n" +
              "3. Then add me to your channel again"
            );
            await leaveTelegramChat(chat.id);
          } else if (response.status === 409) {
            await sendTelegramMessage(chat.id,
              "ℹ️ This channel is already connected to BroadCall.\n\n" +
              "Broadcasting is active! Manage settings in your BroadCall dashboard."
            );
          } else {
            await sendTelegramMessage(chat.id, "❌ Error connecting channel. Please try again later or contact support.");
            await leaveTelegramChat(chat.id);
          }
        }
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function leaveTelegramChat(chatId: number) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/leaveChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });
  } catch (error) {
    console.error('Error leaving Telegram chat:', error);
  }
}
