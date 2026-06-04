'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getUserBadge } from '@/lib/badges'
import { getAllSeries } from '@/lib/series-store'

const SITEMIZ_LINKS = [
  { href: '/iletisim',     label: 'İletişim' },
  { href: '/magaza',       label: 'Mağaza' },
  { href: '/puan-sistemi', label: 'Puan Sistemi' },
  { href: '/manhwa',       label: 'Manhwa Nedir?' },
]

export default function Navbar() {
  const { user, logout, notifications, unreadCount, claimDailyPoints, canClaimToday, markAllRead } = useAuth()
  const router = useRouter()

  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [dropdown,    setDropdown]    = useState(false)
  const [profileDrop, setProfileDrop] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)

  const dropRef     = useRef<HTMLDivElement>(null)
  const profileRef  = useRef<HTMLDivElement>(null)
  const searchRef   = useRef<HTMLDivElement>(null)
  const notifRef    = useRef<HTMLDivElement>(null)

  const [allSeries, setAllSeries] = useState<import('@/lib/types').Series[]>([])
  useEffect(() => { getAllSeries().then(setAllSeries) }, [])

  const searchResults = searchQuery.trim().length >= 1
    ? allSeries.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : []
  const showSearchDrop = searchFocus && searchQuery.trim().length >= 1

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current    && !dropRef.current.contains(e.target as Node))    setDropdown(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileDrop(false)
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchFocus(false)
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const badge = user ? getUserBadge(user.createdAt) : null

  const handleLogout = async () => {
    await logout()
    setProfileDrop(false)
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e]"
      style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EF9F27]/70 shadow-lg shadow-[#EF9F27]/25 flex-shrink-0">
              <Image src="/logo.png" alt="İmugi" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9F27] to-[#F5BA45]">
              İmugi
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link href="/" className="px-3 py-2 text-sm rounded-lg transition-all text-[#9898b0] hover:text-white hover:bg-[#1a1a24]">Ana Sayfa</Link>
            <Link href="/seriler" className="px-3 py-2 text-sm rounded-lg transition-all text-[#9898b0] hover:text-white hover:bg-[#1a1a24]">Seriler</Link>
            <Link href="/bookmarks" className="px-3 py-2 text-sm rounded-lg transition-all text-[#9898b0] hover:text-white hover:bg-[#1a1a24]">Listem</Link>

            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all text-[#9898b0] hover:text-white hover:bg-[#1a1a24]">
                Sitemiz <ChevronDown size={13} className={cn('transition-transform duration-200', dropdown && 'rotate-180')} />
              </button>
              {dropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl border border-[#1e1e2e] shadow-2xl py-1.5 z-50 bg-[#13131c]">
                  {SITEMIZ_LINKS.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setDropdown(false)}
                      className="block px-4 py-2 text-sm transition-colors text-[#9898b0] hover:text-white hover:bg-[#1a1a24]">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Sağ alan */}
          <div className="flex items-center gap-2">

            {/* Bildirim zarf butonu */}
            <div className="relative hidden md:block" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead() }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-[#1e1e2e] bg-[#13131c] hover:border-[#EF9F27]/40 transition-all text-[#9898b0] hover:text-white">
                <i className="fi fi-rr-envelope text-base leading-none" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Bildirim Dropdown */}
              {notifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#13131c] border border-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Bildirimler</span>
                    {notifications.length > 0 && (
                      <span className="text-[10px] text-[#555570]">{notifications.length} bildirim</span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[#555570]">Bildirim yok</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id}
                          className={cn('px-4 py-3 border-b border-[#1e1e2e] last:border-0 transition-colors',
                            n.read ? 'opacity-60' : 'bg-[#EF9F27]/5'
                          )}>
                          <p className="text-sm font-semibold text-white mb-0.5">{n.title}</p>
                          <p className="text-xs text-[#9898b0] leading-relaxed mb-2">{n.body}</p>

                          {/* Günlük ödül — al butonu */}
                          {n.type === 'daily_reward' && canClaimToday && (
                            <button
                              onClick={() => { claimDailyPoints(); }}
                              className="flex items-center gap-1.5 text-xs bg-[#EF9F27] hover:bg-[#BA7517] text-white font-semibold px-3 py-1.5 rounded-lg transition-all">
                              <i className="fi fi-rr-gift text-xs leading-none" /> Puanları Al
                            </button>
                          )}
                          {n.type === 'daily_reward' && !canClaimToday && (
                            <span className="text-[10px] text-green-400">✅ Bugün alındı</span>
                          )}

                          <p className="text-[10px] text-[#555570] mt-1.5">
                            {new Date(n.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Arama */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className={cn(
                'flex items-center gap-2 border rounded-xl px-3 py-2 transition-all duration-300 bg-[#13131c] border-[#1e1e2e]',
                searchFocus ? 'border-[#EF9F27] w-64' : 'w-36'
              )}>
                <Search size={13} className="text-[#555570]" />
                <input
                  type="text"
                  placeholder="Seri ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  className="bg-transparent text-sm outline-none w-full text-white placeholder-[#555570]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#555570] hover:text-white flex-shrink-0">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Arama Dropdown */}
              {showSearchDrop && (
                <div className="absolute top-full right-0 mt-1.5 w-80 bg-[#13131c] border border-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[#555570]">Sonuç bulunamadı</div>
                  ) : (
                    <>
                      <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#555570] uppercase tracking-wider">
                        Seriler ({searchResults.length})
                      </div>
                      {searchResults.map(s => (
                        <Link key={s.id} href={`/seri/${s.slug}`}
                          onClick={() => { setSearchQuery(''); setSearchFocus(false) }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a24] transition-colors group">
                          <div className="w-8 h-11 rounded-lg overflow-hidden bg-[#1a1a24] flex-shrink-0">
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${s.cover_url}")` }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-[#EF9F27] transition-colors line-clamp-1">
                              {s.title}
                            </p>
                            <p className="text-[11px] text-[#555570] mt-0.5">
                              {s.type.charAt(0).toUpperCase() + s.type.slice(1)} · {s.genre_names?.[0]}
                            </p>
                          </div>
                          <span className="text-[11px] text-yellow-400 flex-shrink-0 flex items-center gap-0.5">
                            ★ {s.rating}
                          </span>
                        </Link>
                      ))}
                      <Link href={`/seriler?q=${searchQuery}`}
                        onClick={() => { setSearchFocus(false) }}
                        className="block px-4 py-3 text-xs text-center text-[#EF9F27] hover:bg-[#1a1a24] transition-colors border-t border-[#1e1e2e]">
                        Tüm sonuçları gör →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {user ? (
              /* Profil dropdown */
              <div className="relative hidden md:block" ref={profileRef}>
                <button onClick={() => setProfileDrop(!profileDrop)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-[#1e1e2e] bg-[#13131c] hover:border-[#EF9F27]/40 transition-all">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2a3e] flex items-center justify-center flex-shrink-0">
                    {user.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <i className="fi fi-rr-user text-[#9898b0] text-sm leading-none mt-1" />
                    }
                  </div>
                  {/* Badge + kullanıcı adı */}
                  <div className="flex items-center gap-1">
                    {user.showBadge && badge && (
                      <img src={badge.icon} alt={badge.label} className="w-4 h-4 object-contain flex-shrink-0" title={badge.label} />
                    )}
                    {user.isPremium && (
                      <span className="text-[#EF9F27] text-sm font-bold flex-shrink-0">✦</span>
                    )}
                    {user.isPremium ? (
                      <span className="text-sm font-bold max-w-[90px] truncate"
                        style={{ background: 'linear-gradient(90deg,#EF9F27,#F5BA45,#BA7517)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {user.username}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-white max-w-[90px] truncate">{user.username}</span>
                    )}
                  </div>
                  <ChevronDown size={12} className={cn('text-[#555570] transition-transform', profileDrop && 'rotate-180')} />
                </button>

                {profileDrop && (
                  <div className="absolute top-full right-0 mt-1.5 w-44 rounded-xl border border-[#1e1e2e] shadow-2xl py-1.5 z-50 bg-[#13131c]">
                    <Link href="/profil" onClick={() => setProfileDrop(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#9898b0] hover:text-white hover:bg-[#1a1a24] transition-colors">
                      <Settings size={14} /> Profil Ayarları
                    </Link>
                    <div className="border-t border-[#1e1e2e] my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#1a1a24] transition-colors">
                      <LogOut size={14} /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden md:block text-sm font-medium bg-[#EF9F27] hover:bg-[#BA7517] text-white px-4 py-2 rounded-lg transition-all">
                Giriş Yap
              </Link>
            )}

            {/* Mobil — arama + bildirim + menü */}
            <div className="flex items-center gap-1 md:hidden">
              <button onClick={() => { setMobileOpen(false); setNotifOpen(false); setMobileSearch(o => !o) }}
                className="p-2 text-[#9898b0] hover:text-white transition-colors">
                {mobileSearch ? <X size={20} /> : <i className="fi fi-rr-search text-base leading-none" />}
              </button>
              {user && (
                <button onClick={() => { setMobileOpen(false); setNotifOpen(!notifOpen) }}
                  className="relative p-2 text-[#9898b0] hover:text-white transition-colors">
                  <i className="fi fi-rr-envelope text-base leading-none" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button className="p-2 text-[#9898b0]" onClick={() => { setMobileSearch(false); setMobileOpen(!mobileOpen) }}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil arama paneli */}
      {mobileSearch && (
        <div className="md:hidden border-t border-[#1e1e2e] px-4 py-3 bg-[#111118]">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-[#13131c] border-[#EF9F27]/40">
            <Search size={15} className="text-[#555570] flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Seri ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full text-white placeholder-[#555570]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#555570] hover:text-white flex-shrink-0">
                <X size={14} />
              </button>
            )}
          </div>

          {searchQuery.trim().length >= 1 && (
            <div className="mt-2 rounded-xl border border-[#1e1e2e] bg-[#13131c] overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[#555570]">Sonuç bulunamadı</div>
              ) : (
                <>
                  {searchResults.map(s => (
                    <Link key={s.id} href={`/seri/${s.slug}`}
                      onClick={() => { setSearchQuery(''); setMobileSearch(false) }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a24] transition-colors group">
                      <div className="w-8 h-11 rounded-lg overflow-hidden bg-[#1a1a24] flex-shrink-0">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${s.cover_url}")` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-[#EF9F27] transition-colors line-clamp-1">{s.title}</p>
                        <p className="text-[11px] text-[#555570] mt-0.5">{s.genre_names?.[0]}</p>
                      </div>
                      <span className="text-[11px] text-yellow-400 flex-shrink-0">★ {s.rating}</span>
                    </Link>
                  ))}
                  <Link href={`/seriler?q=${searchQuery}`}
                    onClick={() => { setSearchQuery(''); setMobileSearch(false) }}
                    className="block px-4 py-3 text-xs text-center text-[#EF9F27] hover:bg-[#1a1a24] transition-colors border-t border-[#1e1e2e]">
                    Tüm sonuçları gör →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e1e2e] px-4 py-4 space-y-1 bg-[#111118]">
          {[{ href:'/', label:'Ana Sayfa' }, { href:'/seriler', label:'Seriler' }, { href:'/bookmarks', label:'Listem' }, ...SITEMIZ_LINKS].map(l => (
            <Link key={l.href} href={l.href}
              className="block px-3 py-2.5 text-sm rounded-lg text-[#9898b0] hover:text-white hover:bg-[#1a1a24]"
              onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/profil" className="block px-3 py-2.5 text-sm rounded-lg text-[#9898b0] hover:text-white hover:bg-[#1a1a24]"
                onClick={() => setMobileOpen(false)}>Profil Ayarları</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                className="w-full text-left block text-sm py-2.5 px-3 rounded-lg text-red-400 hover:bg-[#1a1a24] mt-1">
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link href="/login"
              className="block text-center text-sm py-2.5 bg-[#EF9F27] hover:bg-[#BA7517] rounded-lg text-white font-medium mt-2"
              onClick={() => setMobileOpen(false)}>
              Giriş Yap
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
