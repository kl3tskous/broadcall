'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginButtonProps {
  botName: string
  onAuth: (user: TelegramUser) => void
  buttonSize?: 'large' | 'medium' | 'small'
  cornerRadius?: number
  showAvatar?: boolean
  requestWriteAccess?: boolean
  className?: string
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void
    }
  }
}

export default function TelegramLoginButton({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius,
  showAvatar = true,
  requestWriteAccess = true,
  className = ''
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackName = useRef(`onTelegramAuth_${Math.random().toString(36).substring(7)}`)

  useEffect(() => {
    if (!containerRef.current) return

    (window as any)[callbackName.current] = (user: TelegramUser) => {
      onAuth(user)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-onauth', `${callbackName.current}(user)`)
    script.setAttribute('data-request-access', requestWriteAccess ? 'write' : '')
    
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString())
    }
    
    if (!showAvatar) {
      script.setAttribute('data-userpic', 'false')
    }

    script.async = true

    containerRef.current.appendChild(script)

    return () => {
      delete (window as any)[callbackName.current]
    }
  }, [botName, buttonSize, cornerRadius, showAvatar, requestWriteAccess, onAuth])

  return <div ref={containerRef} className={className} />
}
