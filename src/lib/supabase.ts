import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side (kullanıcı işlemleri)
export const supabase = createClient(url, anon)

// Server-side admin (servis rolü — sadece API route'larında kullan)
export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tip yardımcıları
export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  equipped_frame: string | null
  equipped_accessory: string | null
  show_badge: boolean
  vip_points: number
  shop_balance: number
  last_daily_claim: string | null
  is_premium: boolean
  is_admin: boolean
  created_at: string
}

export type Series = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_url: string | null
  status: 'ongoing' | 'completed' | 'hiatus'
  genres: string[]
  author: string | null
  created_at: string
  updated_at: string
}

export type Chapter = {
  id: string
  series_id: string
  num: number
  title: string | null
  pages: string[]
  created_at: string
}
