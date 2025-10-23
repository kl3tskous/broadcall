import os
import logging
import httpx
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command with optional connection token"""
    user = update.effective_user
    
    if not context.args:
        await update.message.reply_text(
            f"👋 Welcome to BroadCall, {user.first_name}!\n\n"
            "To connect your Telegram account to BroadCall:\n"
            "1. Go to your BroadCall Settings page\n"
            "2. Click 'Connect Telegram'\n"
            "3. Follow the link to start the connection\n\n"
            "Once connected, you'll be able to push your token calls directly to Telegram!"
        )
        return
    
    token = context.args[0]
    telegram_id = user.id
    telegram_username = user.username or user.first_name
    
    await update.message.reply_text("🔄 Verifying your connection token...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/telegram/verify",
                json={
                    "token": token,
                    "telegram_id": telegram_id,
                    "telegram_username": telegram_username
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                await update.message.reply_text(
                    f"✅ Success! Your Telegram account is now connected to BroadCall.\n\n"
                    f"👤 Connected as: @{telegram_username}\n"
                    f"💼 BroadCall Profile: {data.get('alias', 'Anonymous')}\n\n"
                    "You can now:\n"
                    "• Use /status to check your connection\n"
                    "• Use /disconnect to unlink your account\n"
                    "• Push token calls to Telegram (coming soon!)"
                )
            elif response.status_code == 400:
                error_data = response.json()
                await update.message.reply_text(
                    f"❌ Connection failed: {error_data.get('error', 'Invalid or expired token')}\n\n"
                    "Please generate a new connection link from BroadCall Settings."
                )
            else:
                await update.message.reply_text(
                    "❌ Something went wrong. Please try again later or contact support."
                )
    except Exception as e:
        logger.error(f"Error during verification: {e}")
        await update.message.reply_text(
            "❌ Could not connect to BroadCall servers. Please try again later."
        )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Check Telegram connection status"""
    user = update.effective_user
    telegram_id = user.id
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{BACKEND_URL}/api/telegram/status",
                params={"telegram_id": telegram_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('connected'):
                    await update.message.reply_text(
                        f"✅ Your Telegram is connected to BroadCall!\n\n"
                        f"👤 Telegram: @{data.get('telegram_username', 'Unknown')}\n"
                        f"💼 BroadCall: {data.get('alias', 'Anonymous')}\n"
                        f"🔗 Wallet: {data.get('wallet_address', 'N/A')[:8]}...\n\n"
                        "Use /disconnect to unlink your account."
                    )
                else:
                    await update.message.reply_text(
                        "❌ Your Telegram is not connected to any BroadCall account.\n\n"
                        "Go to BroadCall Settings to connect your account!"
                    )
            else:
                await update.message.reply_text(
                    "❌ Could not check connection status. Please try again later."
                )
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        await update.message.reply_text(
            "❌ Could not connect to BroadCall servers. Please try again later."
        )

async def disconnect(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Disconnect Telegram from BroadCall account"""
    user = update.effective_user
    telegram_id = user.id
    
    await update.message.reply_text("🔄 Disconnecting your Telegram account...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(
                f"{BACKEND_URL}/api/telegram/disconnect",
                json={"telegram_id": telegram_id}
            )
            
            if response.status_code == 200:
                await update.message.reply_text(
                    "✅ Your Telegram account has been disconnected from BroadCall.\n\n"
                    "You can reconnect anytime from your BroadCall Settings page."
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "❌ No BroadCall account is connected to this Telegram.\n\n"
                    "Nothing to disconnect!"
                )
            else:
                await update.message.reply_text(
                    "❌ Something went wrong. Please try again later."
                )
    except Exception as e:
        logger.error(f"Error during disconnect: {e}")
        await update.message.reply_text(
            "❌ Could not connect to BroadCall servers. Please try again later."
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show help message"""
    await update.message.reply_text(
        "🤖 BroadCall Telegram Bot\n\n"
        "Available commands:\n"
        "/start - Connect your Telegram to BroadCall\n"
        "/status - Check your connection status\n"
        "/disconnect - Unlink your Telegram account\n"
        "/help - Show this help message\n\n"
        "Visit BroadCall Settings to get your connection link!"
    )

def main() -> None:
    """Start the bot"""
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN environment variable not set!")
        return
    
    logger.info("Starting BroadCall Telegram Bot...")
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("status", status))
    application.add_handler(CommandHandler("disconnect", disconnect))
    application.add_handler(CommandHandler("help", help_command))
    
    logger.info("Bot is running! Press Ctrl+C to stop.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
