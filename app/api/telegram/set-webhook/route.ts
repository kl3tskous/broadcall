import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';

const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    if (!TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'TELEGRAM_WEBHOOK_SECRET environment variable is not set' 
      }, { status: 500 });
    }
    
    const webhookUrl = `${BACKEND_URL}/api/telegram/webhook`;
    
    console.log(`Setting Telegram webhook to: ${webhookUrl}`);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'my_chat_member'],
        secret_token: TELEGRAM_WEBHOOK_SECRET
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook set successfully',
        webhook_url: webhookUrl 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.description 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error setting webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
