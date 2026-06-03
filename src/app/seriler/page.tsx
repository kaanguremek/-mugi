'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Star, Eye, BookOpen, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { GENRES } from '@/lib/mock-data'
import { getAllSeries } from '@/lib/series-store'
import { cn, formatNumber, STATUS_LABELS } from '@/lib/utils'
import type { Series, SeriesStatus } from '@/lib/types'

const SORT_OPTIONS = [
  { key: 'updated',   label: 'Son Güncelleme'    },
  { key: 'popular',   label: 'En Popüler'        },
  { key: 'rating',    label: 'En Yüksek Puan'    },
  { key: 'chapters',  label: 'En Fazla Bölüm'    },
  { key: 'bookmark',  label: 'En Fazla Bookmark' },
]

const STATUS_OPTIONS: { key: SeriesStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'Tümü'          },
  { key: 'ongoing',   label: 'Devam Ediyor'  },
  { key: 'completed', label: 'Tamamlandı'    },
  { key: 'hiatus',    label: 'Ara Verildi'   },
]


function SerilerInner() {
  const params = useSearchParams()

  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState(() => params.get('sort') ?? 'updated')
  const [status,   setStatus]   = useState<SeriesStatus | 'all'>(() => (params.get('status') as SeriesStatus | 'all') ?? 'all')
  const [genres,   setGenres]   = useState<string[]>(() => params.get('genre') ? [params.get('genre')!] : [])
  const [minChap,  setMinChap]  = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const toggleGenre = (g: string) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const [allSeries, setAllSeries] = useState<Series[]>([])
  useEffect(() => { getAllSeries().then(setAllSeries) }, [])

  const filtered = useMemo(() => {
    let list = [...allSeries]
    if (search)           list = list.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    if (status !== 'all') list = list.filter(s => s.status === status)
    if (genres.length)    list = list.filter(s => genres.every(g => s.genre_names?.includes(g)))
    if (minChap > 0)      list = list.filter(s => (s.chapter_count ?? 0) >= minChap)

    switch (sort) {
      case 'popular':  return list.sort((a,b) => b.view_count - a.view_count)
      case 'rating':   return list.sort((a,b) => b.rating - a.rating)
      case 'chapters':  return list.sort((a,b) => (b.chapter_count??0) - (a.chapter_count??0))
      case 'bookmark':  return list.sort((a,b) => b.bookmark_count - a.bookmark_count)
      default:         return list.sort((a,b) => b.updated_at.localeCompare(a.updated_at))
    }
  }, [search, sort, status, genres, minChap, allSeries])

  const activeFilterCount = (status !== 'all' ? 1 : 0) + genres.length + (minChap > 0 ? 1 : 0)

  return (
    <main className="pt-20 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {/* Başlık + sayaç */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-[#EF9F27] rounded-full" />
            <h1 className="text-2xl font-bold text-white">Seriler</h1>
            <span className="text-sm text-[#555570] bg-[#13131c] border border-[#1e1e2e] px-2.5 py-1 rounded-lg">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Filtre bar */}
        <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-4 mb-6 space-y-3">
          {/* Üst satır: arama + sıralama + filtre toggle */}
          <div className="flex gap-3 flex-wrap items-center">
            {/* Arama */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#1a1a24] border border-[#1e1e2e] rounded-xl px-3 py-2.5 focus-within:border-[#EF9F27]/50 transition-all">
              <Search size={14} className="text-[#555570] flex-shrink-0" />
              <input
                type="text" placeholder="Seri ara..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full placeholder-[#555570]" />
              {search && (
                <button onClick={() => setSearch('')} className="text-[#555570] hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sıralama */}
            <select
              value={sort} onChange={e => setSort(e.target.value)}
              className="bg-[#1a1a24] border border-[#1e1e2e] text-sm text-[#9898b0] rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-[#EF9F27]/40 transition-all">
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>

            {/* Filtre toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-xl border transition-all',
                showFilters || activeFilterCount > 0
                  ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                  : 'border-[#1e1e2e] bg-[#1a1a24] text-[#9898b0] hover:border-[#EF9F27]/40'
              )}>
              <SlidersHorizontal size={14} />
              Filtrele
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#EF9F27] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={13} className={cn('transition-transform', showFilters && 'rotate-180')} />
            </button>

            {/* Aktif filtre temizle */}
            {activeFilterCount > 0 && (
              <button onClick={() => { setStatus('all'); setGenres([]); setMinChap(0) }}
                className="text-xs text-[#555570] hover:text-red-400 transition-colors flex items-center gap-1">
                <X size={12} /> Temizle
              </button>
            )}
          </div>

          {/* Genişleyen filtreler */}
          {showFilters && (
            <div className="pt-3 border-t border-[#1e1e2e] space-y-3">
              <div className="flex gap-6 flex-wrap">
                {/* Durum */}
                <div>
                  <p className="text-[11px] font-semibold text-[#555570] uppercase tracking-wider mb-2">Durum</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map(o => (
                      <button key={o.key} onClick={() => setStatus(o.key)}
                        className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                          status === o.key
                            ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                            : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30 hover:text-[#9898b0]'
                        )}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min bölüm */}
                <div>
                  <p className="text-[11px] font-semibold text-[#555570] uppercase tracking-wider mb-2">Min. Bölüm</p>
                  <div className="flex gap-1.5">
                    {[0,50,100,200].map(n => (
                      <button key={n} onClick={() => setMinChap(n)}
                        className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                          minChap === n
                            ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                            : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30 hover:text-[#9898b0]'
                        )}>
                        {n === 0 ? 'Hepsi' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Türler */}
              <div>
                <p className="text-[11px] font-semibold text-[#555570] uppercase tracking-wider mb-2">Kategoriler</p>
                <div className="flex gap-1.5 flex-wrap">
                  {GENRES.map(g => (
                    <button key={g} onClick={() => toggleGenre(g)}
                      className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                        genres.includes(g)
                          ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                          : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30 hover:text-[#9898b0]'
                      )}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aktif tür filtreleri chips */}
        {genres.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {genres.map(g => (
              <button key={g} onClick={() => toggleGenre(g)}
                className="flex items-center gap-1 text-xs bg-[#EF9F27]/10 border border-[#EF9F27]/30 text-[#EF9F27] px-2.5 py-1 rounded-full hover:bg-[#EF9F27]/20 transition-all">
                {g} <X size={10} />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="text-[#333350] mx-auto mb-3" />
            <p className="text-[#555570] text-sm">Sonuç bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(series => (
              <Link key={series.id} href={`/seri/${series.slug}`}
                className="group flex flex-col bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/35 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">

                {/* Kapak */}
                <div className="relative aspect-[3/4] bg-[#1a1a24] overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${series.cover_url})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-70" />

                  {/* Puan */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-yellow-400 text-[11px] font-semibold px-1.5 py-0.5 rounded-lg">
                    <Star size={9} fill="currentColor" /> {series.rating}
                  </div>

                  {/* Bölüm */}
                  <div className="absolute bottom-2 left-2 text-[10px] text-[#9898b0] bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    {series.chapter_count} bölüm
                  </div>
                </div>

                {/* Bilgi */}
                <div className="p-2.5">
                  <h3 className="text-xs font-semibold text-[#e8e8f0] line-clamp-2 leading-snug mb-1.5 group-hover:text-[#EF9F27] transition-colors">
                    {series.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-[10px] font-medium',
                      series.status === 'ongoing' ? 'text-green-400' :
                      series.status === 'completed' ? 'text-[#EF9F27]' : 'text-yellow-400'
                    )}>
                      {STATUS_LABELS[series.status]}
                    </span>
                    <span className="text-[10px] text-[#555570] flex items-center gap-0.5">
                      <Eye size={8} /> {formatNumber(series.view_count)}
                    </span>
                  </div>
                  {series.genre_names && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {series.genre_names.slice(0,2).map(g => (
                        <span key={g} className="text-[9px] bg-[#1a1a24] text-[#555570] px-1.5 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SerilerPage() {
  return (
    <Suspense>
      <SerilerInner />
    </Suspense>
  )
}
