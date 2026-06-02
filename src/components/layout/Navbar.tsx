'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Search, Menu, X, ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const SITEMIZ_LINKS = [
  { href: '/iletisim',     label: 'İletişim' },
  { href: '/magaza',       label: 'Mağaza' },
  { href: '/puan-sistemi', label: 'Puan Sistemi' },
  { href: '/manhwa',       label: 'Manhwa Nedir?' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdown, setDropdown]     = useState(false)
  const [loggedIn]                  = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e]"
      style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EF9F27]/70 shadow-lg shadow-[#EF9F27]/25 flex-shrink-0">
              <Image src="/logo.png" alt="HaeTae" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9F27] to-[#F5BA45]">
              HaeTae
            </span>
          </Link>

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

          <div className="flex items-center gap-2">
            <div className={cn(
              'hidden md:flex items-center gap-2 border rounded-xl px-3 py-2 transition-all duration-300 bg-[#13131c] border-[#1e1e2e]',
              searchOpen ? 'border-[#EF9F27] w-48' : 'w-28'
            )}>
              <Search size={13} className="text-[#555570]" />
              <input type="text" placeholder="Ara..."
                onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)}
                className="bg-transparent text-sm outline-none w-full text-white placeholder-[#555570]" />
            </div>

            {loggedIn ? (
              <Link href="/profil"
                className="hidden md:flex w-9 h-9 rounded-full border border-[#2a2a3e] bg-[#1a1a24] text-[#9898b0] items-center justify-center transition-all hover:border-[#EF9F27]">
                <User size={17} />
              </Link>
            ) : (
              <Link href="/auth/login"
                className="hidden md:block text-sm font-medium bg-[#EF9F27] hover:bg-[#BA7517] text-white px-4 py-2 rounded-lg transition-all">
                Giriş Yap
              </Link>
            )}

            <button className="md:hidden p-2 text-[#9898b0]"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e1e2e] px-4 py-4 space-y-1 bg-[#111118]">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3 bg-[#13131c] border-[#1e1e2e]">
            <Search size={13} className="text-[#888]" />
            <input placeholder="Seri ara..." className="bg-transparent text-sm outline-none w-full placeholder-[#888] text-white" />
          </div>
          {[{href:'/',label:'Ana Sayfa'},{href:'/seriler',label:'Seriler'},{href:'/bookmarks',label:'Listem'}, ...SITEMIZ_LINKS].map(l => (
            <Link key={l.href} href={l.href}
              className="block px-3 py-2.5 text-sm rounded-lg text-[#9898b0] hover:text-white hover:bg-[#1a1a24]"
              onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/auth/login"
            className="block text-center text-sm py-2.5 bg-[#EF9F27] hover:bg-[#BA7517] rounded-lg text-white font-medium mt-2"
            onClick={() => setMobileOpen(false)}>
            Giriş Yap
          </Link>
        </div>
      )}
    </header>
  )
}
