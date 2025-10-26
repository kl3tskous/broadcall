import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Call {
  id: string
  creator_wallet: string
  token_address: string
  platform: string
  thesis: string | null
  views: number
  clicks: number
  gmgn_ref: string | null
  axiom_ref: string | null
  photon_ref: string | null
  bullx_ref: string | null
  trojan_ref: string | null
  created_at: string
  token_name: string | null
  token_symbol: string | null
  token_logo: string | null
  initial_price: number | null
  initial_mcap: number | null
  current_price: number | null
  current_mcap: number | null
  ath_price: number | null
  ath_mcap: number | null
  first_shared_at: string | null
  user_alias: string | null
}

export interface Platform {
  id: string
  name: string
  color: string
}

export interface UserSettings {
  id: string
  wallet_address: string
  gmgn_ref: string | null
  axiom_ref: string | null
  photon_ref: string | null
  bullx_ref: string | null
  trojan_ref: string | null
  trades_in_name: string | null
  trades_in_image: string | null
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  wallet_address: string
  alias: string | null
  avatar_url: string | null
  banner_url: string | null
  twitter_handle: string | null
  bio: string | null
  telegram: string | null
  website: string | null
  telegram_id: number | null
  telegram_username: string | null
  created_at: string
  updated_at: string
}

export interface TelegramConnectionToken {
  id: string
  wallet_address: string
  token: string
  created_at: string
  expires_at: string
  used: boolean
}
