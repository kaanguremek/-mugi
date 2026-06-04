'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, BookmarkX, Star, BookOpen, History } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getAllSeries } from '@/lib/series-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Series } from '@/lib/types'

type Tab = 'listem' | 'gecmis'

interface ReadHistoryItem {
  slug: string
  chapter: number
  title: string
  cover: string
  readAt: string
}

export default function BookmarksPage() {
  const { user, ready, toggleBookmark } = useAuth()
  const router = useRouter()
  const [tab,       setTab]       = useState<Tab>('listem')
  const [search,    setSearch]    = useState('')
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [history,   setHistory]   = useState<ReadHistoryItem[]>([])
  const [histLoading, setHistLoading] = useState(false)

  useEffect(() => {
    if (ready && !user) router.push('/login')
  }, [user, ready, router])

  useEffect(() => {
    getAllSeries().then(setAllSeries)
  }, [])

  useEffect(() => {
    if (!user) return
    setHistLoading(true)
    supabase
      .from('read_history')
      .select('chapter_num, read_at, series(id, slug, title, cover_url)')
      .eq('user_id', user.id)
      .order('read_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const items: ReadHistoryItem[] = (data ?? []).map((h: Record<string, unknown>) => {
          const s = h.series as Record<string, unknown> | null
          return {
            slug:    (s?.slug as string) ?? '',
            chapter: Number(h.chapter_num),
            title:   (s?.title as string) ?? '',
            cover:   (s?.cover_url as string) ?? '',
            readAt:  h.read_at as string,
          }
        })
        setHistory(items)
        setHistLoading(false)
      })
  }, [user?.id])

  const clearHistory = async () => {
    if (!user) return
    await supabase.from('read_history').delete().eq('user_id', user.id)
    setHistory([])
  }

  const bookmarkedSlugs = useMemo(() => [...(user?.bookmarks ?? [])].reverse(), [user?.bookmarks])

  const series = useMemo(() => {
    return bookmarkedSlugs
      .map(slug => allSeries.find(s => s.slug === slug))
      .filter(Boolean) as Series[]
  }, [bookmarkedSlugs, allSeries])

  const filtered = useMemo(() => {
    if (!search.trim()) return series
    return series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
  }, [series, search])

  if (!ready || !user) return null

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
          <h1 className="text-2xl font-bold text-white">Listem</h1>
          <span className="text-sm text-[#555570] bg-[#13131c] border border-[#1e1e2e] px-2.5 py-1 rounded-lg">
            {series.length}
          </span>
        </div>

        <div className="flex gap-2 mb-5">
          {([
            { key: 'listem',  label: 'Listelerim',     icon: BookOpen  },
            { key: 'gecmis',  label: 'Okuma Geçmişi',  icon: History   },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                tab === key
                  ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                  : 'border-[#1e1e2e] bg-[#13131c] text-[#9898b0] hover:border-[#EF9F27]/30'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* LİSTEM */}
        {tab === 'listem' && (
          <>
            <div className="flex items-center gap-2 bg-[#13131c] border border-[#1e1e2e] focus-within:border-[#EF9F27]/50 rounded-xl px-3 py-2.5 mb-5 transition-all">
              <Search size={14} className="text-[#555570] flex-shrink-0" />
              <input type="text" placeholder="Listende ara..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full placeholder-[#555570]" />
              {search && (
                <button onClick={() => setSearch('')} className="text-[#555570] hover:text-white transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {series.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#13131c] border border-[#1e1e2e] flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-[#333350]" />
                </div>
                <p className="text-[#555570] text-sm mb-2">Listeniz boş</p>
                <p className="text-[#333350] text-xs">Seri sayfalarındaki "Listeme Ekle" butonunu kullanarak ekleyebilirsin.</p>
                <Link href="/seriler" className="inline-block mt-4 text-xs text-[#EF9F27] hover:text-[#F5BA45] transition-colors">
                  Serilere Gözat →
                </Link>
              </div>
            )}

            {series.length > 0 && filtered.length === 0 && (
              <div className="text-center py-12 text-[#555570] text-sm">
                &quot;{search}&quot; ile eşleşen seri bulunamadı.
              </div>
            )}

            <div className="space-y-2">
              {filtered.map(s => (
                <div key={s.id}
                  className="flex items-center gap-4 bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/25 rounded-2xl p-3 transition-all group">
                  <Link href={`/seri/${s.slug}`} className="flex-shrink-0">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-[#1a1a24]">
                      <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url("${s.cover_url}")` }} />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/seri/${s.slug}`}>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#EF9F27] transition-colors line-clamp-2 leading-snug mb-1">
                        {s.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-[#555570] mb-1.5">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star size={10} fill="currentColor" /> {s.rating > 0 ? s.rating.toFixed(1) : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={10} /> {s.chapter_count ?? 0} bölüm
                      </span>
                      <span className={cn('font-medium', s.status === 'ongoing' ? 'text-green-400' : 'text-[#EF9F27]')}>
                        {s.status === 'ongoing' ? 'Devam Ediyor' : 'Tamamlandı'}
                      </span>
                    </div>
                    <div className="hidden sm:flex gap-1 flex-wrap">
                      {s.genre_names?.slice(0, 3).map(g => (
                        <span key={g} className="text-[10px] bg-[#1a1a24] text-[#555570] px-1.5 py-0.5 rounded">{g}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => toggleBookmark(s.slug)}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#1a1a24] hover:bg-red-500/15 border border-[#1e1e2e] hover:border-red-500/40 text-[#555570] hover:text-red-400 text-xs px-3 py-2 rounded-xl transition-all">
                    <BookmarkX size={12} />
                    <span className="hidden sm:inline">Çıkar</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* OKUMA GEÇMİŞİ */}
        {tab === 'gecmis' && (
          <>
            {histLoading ? (
              <p className="text-center text-sm text-[#555570] py-12">Yükleniyor...</p>
            ) : history.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#13131c] border border-[#1e1e2e] flex items-center justify-center mx-auto mb-4">
                  <History size={28} className="text-[#333350]" />
                </div>
                <p className="text-[#555570] text-sm">Henüz bölüm okumadınız.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <Link key={i} href={`/seri/${h.slug}/bolum/${h.chapter}`}
                    className="flex items-center gap-4 bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/25 rounded-2xl p-3 transition-all group">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-[#1a1a24] flex-shrink-0">
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${h.cover}")` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#EF9F27] transition-colors line-clamp-1">{h.title}</p>
                      <p className="text-xs text-[#EF9F27] mt-0.5">Bölüm {h.chapter}</p>
                      <p className="text-[10px] text-[#555570] mt-1">
                        {new Date(h.readAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs text-[#EF9F27]/60 flex-shrink-0">Devam Et →</span>
                  </Link>
                ))}
                <button onClick={clearHistory}
                  className="w-full mt-2 text-xs text-red-400/60 hover:text-red-400 transition-colors py-2">
                  Geçmişi Temizle
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
