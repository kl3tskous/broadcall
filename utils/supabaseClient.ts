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
  created_at: string
}
