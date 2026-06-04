'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface ImugiUser {
  id: string
  username: string
  email: string
  avatar: string | null
  createdAt: string
  equippedFrame: string | null
  equippedAccessory: string | null
  showBadge: boolean
  bookmarks: string[]
  vipPoints: number
  shopBalance: number
  lastDailyClaim: string | null
  isPremium: boolean
  isAdmin: boolean
}

export interface Notification {
  id: string
  type: 'daily_reward' | 'announcement' | 'new_chapter'
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}

interface AuthCtx {
  user: ImugiUser | null
  ready: boolean
  notifications: Notification[]
  unreadCount: number
  login: (email: string, password: string) => Promise<string | null>
  register: (username: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  update: (data: Partial<Omit<ImugiUser, 'id' | 'email' | 'createdAt' | 'isAdmin'>>) => Promise<void>
  toggleBookmark: (slug: string) => void
  isBookmarked: (slug: string) => boolean
  claimDailyPoints: () => Promise<void>
  canClaimToday: boolean
  markAllRead: () => Promise<void>
}

const VIP_DAILY      = [5, 8, 12, 16, 21, 27, 34, 42, 51, 62]
const VIP_THRESHOLDS = [0, 50, 150, 350, 700, 1300, 2500, 4500, 7500, 12000]

export function getVipLevel(points: number): number {
  for (let i = VIP_THRESHOLDS.length - 1; i >= 0; i--)
    if (points >= VIP_THRESHOLDS[i]) return i + 1
  return 1
}

export function getDailyPoints(vipLevel: number, isPremium: boolean): number {
  const base = VIP_DAILY[Math.min(vipLevel - 1, 9)]
  return isPremium ? Math.round(base * 2 * 1.2) : base
}

function todayStr() { return new Date().toISOString().slice(0, 10) }

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,   setUser]   = useState<ImugiUser | null>(null)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [ready,  setReady]  = useState(false)

  const loadProfile = useCallback(async (authUser: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!profile) { setReady(true); return }

    const { data: bookmarkRows } = await supabase
      .from('bookmarks')
      .select('series(slug)')
      .eq('user_id', authUser.id)

    const bookmarks = (bookmarkRows ?? [])
      .map((b: Record<string, unknown>) => (b.series as { slug: string } | null)?.slug)
      .filter(Boolean) as string[]

    const { data: notifRows } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const notifList: Notification[] = (notifRows ?? []).map((n: Record<string, unknown>) => ({
      id: n.id as string,
      type: n.type as Notification['type'],
      title: n.title as string,
      body: (n.body as string) ?? '',
      read: n.read as boolean,
      createdAt: n.created_at as string,
      link: n.link as string | undefined,
    }))

    const imugiUser: ImugiUser = {
      id:                authUser.id,
      username:          profile.username,
      email:             authUser.email ?? '',
      avatar:            profile.avatar_url ?? null,
      createdAt:         profile.created_at,
      equippedFrame:     profile.equipped_frame ?? null,
      equippedAccessory: profile.equipped_accessory ?? null,
      showBadge:         profile.show_badge ?? true,
      bookmarks,
      vipPoints:         profile.vip_points ?? 0,
      shopBalance:       profile.shop_balance ?? 0,
      lastDailyClaim:    profile.last_daily_claim ?? null,
      isPremium:         profile.is_premium ?? false,
      isAdmin:           profile.is_admin ?? false,
    }

    setUser(imugiUser)

    // Günlük ödül bildirimi ekle (gün içinde zaten yoksa)
    const today = todayStr()
    if (imugiUser.lastDailyClaim !== today) {
      const alreadyHas = notifList.some(n =>
        n.type === 'daily_reward' && n.createdAt.startsWith(today)
      )
      if (!alreadyHas) {
        const vipLevel = getVipLevel(imugiUser.vipPoints)
        const pts = getDailyPoints(vipLevel, imugiUser.isPremium)
        const { data: inserted } = await supabase
          .from('notifications')
          .insert({
            user_id: authUser.id,
            type: 'daily_reward',
            title: '🎁 Günlük VIP Puanınız Hazır!',
            body: `Bugünkü ${pts} VIP puanınızı almak için tıklayın. Almadığınız sürece eklenmez.`,
          })
          .select()
          .single()
        if (inserted) {
          notifList.unshift({
            id: inserted.id,
            type: 'daily_reward',
            title: inserted.title,
            body: inserted.body ?? '',
            read: false,
            createdAt: inserted.created_at,
          })
        }
      }
    }

    setNotifs(notifList)
    setReady(true)
  }, [])

  useEffect(() => {
    let active = true

    // İlk yükleme: mevcut oturumu al (callback dışında olduğu için kilit sorunu yok)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setReady(true)
      }
    })

    // ÖNEMLİ: onAuthStateChange callback'i Supabase'in iç auth kilidini tutar.
    // Callback içinde doğrudan supabase.from(...) sorgusu çağırmak (await) DEADLOCK
    // yaratır ve sayfa donar. Bu yüzden loadProfile'ı setTimeout ile kilidin
    // dışına erteliyoruz. INITIAL_SESSION zaten yukarıdaki getSession ile işleniyor.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (session?.user) {
        setTimeout(() => { if (active) loadProfile(session.user) }, 0)
      } else {
        setUser(null)
        setNotifs([])
        setReady(true)
      }
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [loadProfile])

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.')), 15000)
      )
      const authPromise = supabase.auth.signInWithPassword({ email, password })
      const { error } = await Promise.race([authPromise, timeout]) as Awaited<typeof authPromise>
      if (error) {
        if (error.message.toLowerCase().includes('invalid')) return 'E-posta veya şifre yanlış.'
        if (error.message.toLowerCase().includes('email')) return 'E-posta adresinizi onaylayın.'
        return error.message
      }
      return null
    } catch (e) {
      return (e as Error).message
    }
  }

  const register = async (username: string, email: string, password: string): Promise<string | null> => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existing) return 'Bu kullanıcı adı alınmış.'

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.')), 15000)
      )
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      const { error } = await Promise.race([signUpPromise, timeout]) as Awaited<typeof signUpPromise>

      if (error) {
        if (error.message.toLowerCase().includes('already')) return 'Bu e-posta zaten kayıtlı.'
        return error.message
      }
      return null
    } catch (e) {
      return (e as Error).message
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNotifs([])
  }

  const update = async (data: Partial<Omit<ImugiUser, 'id' | 'email' | 'createdAt' | 'isAdmin'>>) => {
    if (!user) return

    // Önce UI'ı güncelle (optimistic)
    setUser(prev => prev ? { ...prev, ...data } : null)

    const profileData: Record<string, unknown> = {}
    if ('username'          in data) profileData.username           = data.username
    if ('avatar'            in data) profileData.avatar_url         = data.avatar
    if ('equippedFrame'     in data) profileData.equipped_frame     = data.equippedFrame
    if ('equippedAccessory' in data) profileData.equipped_accessory = data.equippedAccessory
    if ('showBadge'         in data) profileData.show_badge         = data.showBadge
    if ('vipPoints'         in data) profileData.vip_points         = data.vipPoints
    if ('shopBalance'       in data) profileData.shop_balance       = data.shopBalance
    if ('lastDailyClaim'    in data) profileData.last_daily_claim   = data.lastDailyClaim
    if ('isPremium'         in data) profileData.is_premium         = data.isPremium

    if (Object.keys(profileData).length > 0) {
      const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id)
      if (error) console.error('Profile update error:', error.message)
    }
  }

  const toggleBookmark = (slug: string) => {
    if (!user) { window.location.href = '/login'; return }

    const isBooked = user.bookmarks.includes(slug)

    // Optimistik güncelleme
    setUser(prev => prev ? {
      ...prev,
      bookmarks: isBooked
        ? prev.bookmarks.filter(s => s !== slug)
        : [...prev.bookmarks, slug],
    } : null)

    supabase
      .from('series')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data: series }) => {
        if (!series) {
          // Geri al
          setUser(prev => prev ? {
            ...prev,
            bookmarks: isBooked
              ? [...prev.bookmarks, slug]
              : prev.bookmarks.filter(s => s !== slug),
          } : null)
          return
        }
        if (isBooked) {
          supabase.from('bookmarks').delete()
            .eq('user_id', user.id).eq('series_id', series.id)
        } else {
          supabase.from('bookmarks').insert({ user_id: user.id, series_id: series.id })
        }
      })
  }

  const isBookmarked = (slug: string) => (user?.bookmarks ?? []).includes(slug)
  const canClaimToday = !!user && user.lastDailyClaim !== todayStr()

  const claimDailyPoints = async () => {
    if (!user || !canClaimToday) return
    const today = todayStr()
    const vipLevel = getVipLevel(user.vipPoints)
    const pts = getDailyPoints(vipLevel, user.isPremium)

    await update({
      vipPoints:      user.vipPoints + pts,
      shopBalance:    user.shopBalance + pts,
      lastDailyClaim: today,
    })

    setNotifs(prev => {
      const updated = prev.map(n =>
        n.type === 'daily_reward' && n.createdAt.startsWith(today)
          ? { ...n, read: true, body: `+${pts} VIP puanı hesabınıza eklendi! ✅` }
          : n
      )
      const daily = updated.find(n => n.type === 'daily_reward' && n.createdAt.startsWith(today))
      if (daily) {
        supabase.from('notifications')
          .update({ read: true, body: daily.body })
          .eq('id', daily.id)
      }
      return updated
    })
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <Ctx.Provider value={{
      user, ready, notifications: notifs, unreadCount,
      login, register, logout, update,
      toggleBookmark, isBookmarked,
      claimDailyPoints, canClaimToday,
      markAllRead,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}
