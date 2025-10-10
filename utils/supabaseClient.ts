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
}

export interface Platform {
  id: string
  name: string
  color: string
}
