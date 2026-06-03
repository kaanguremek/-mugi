'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Bookmark, BookmarkCheck, Star, BookOpen } from 'lucide-react'
import { cn, STATUS_LABELS } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getAllSeries } from '@/lib/series-store'
import type { Series } from '@/lib/types'


type Slide = Series & { description: string }

export default function HeroSlider() {
  const [slides,  setSlides]  = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)
  const [paused,  setPaused]  = useState(false)
  const { toggleBookmark, isBookmarked } = useAuth()

  useEffect(() => {
    getAllSeries().then(all => {
      const built: Slide[] = []

      all
        .filter(s => !s.id.startsWith('mock') && s.cover_url)
        .slice(0, 6)
        .forEach(s => built.push({ ...s, description: s.description ?? '' }))

      setSlides(built)
    })
  }, [])

  const go = (idx: number) => {
    setFading(true)
    setTimeout(() => { setCurrent(idx); setFading(false) }, 220)
  }

  useEffect(() => {
    if (paused || slides.length === 0) return
    const t = setInterval(() => go((current + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [current, paused, slides.length])

  if (slides.length === 0) return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0d0d14]" style={{ height: '280px' }} />
  )

  const s = slides[current]
  const bookmarked = isBookmarked(s.slug)

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-[#1e1e2e] bg-[#0d0d14]"
      style={{ height: '300px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#EF9F27]/4 via-transparent to-transparent pointer-events-none" />

      <div className={cn(
        'relative h-full flex items-stretch px-4 sm:px-6 gap-4 sm:gap-6 transition-opacity duration-220',
        fading ? 'opacity-0' : 'opacity-100'
      )}>

        {/* KAPAK — aspect-[3/4] ile LatestChapters ile aynı oran */}
        <div className="flex-shrink-0 self-stretch flex items-center py-5">
          <div className="h-full aspect-[3/4] max-h-[240px] rounded-xl overflow-hidden border border-[#EF9F27]/35 shadow-2xl shadow-black/60">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${s.cover_url})` }} />
          </div>
        </div>

        {/* ORTA — meta + butonlar (sabit genişlik, flex-1 değil) */}
        <div className="flex flex-col justify-center gap-2 py-4 min-w-0 w-[240px] sm:w-[260px]">
          <div className="flex gap-1 flex-wrap">
            {s.genre_names?.slice(0, 3).map(g => (
              <span key={g} className="text-[9px] sm:text-[10px] bg-[#EF9F27]/20 border border-[#EF9F27]/30 text-[#EF9F27] px-1.5 sm:px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>

          <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white leading-tight line-clamp-1">
            {s.title}
          </h2>

          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#9898b0] flex-wrap">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Star size={10} fill="currentColor" /> {s.rating > 0 ? s.rating : '—'}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <BookOpen size={10} /> Bölüm {s.latest_chapter ?? s.chapter_count ?? 0}
            </span>
            <span className={cn('font-medium', s.status === 'ongoing' ? 'text-[#22C55E]' : 'text-[#EF9F27]')}>
              {STATUS_LABELS[s.status] ?? s.status}
            </span>
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 mt-1">
            <Link href={`/seri/${s.slug}`}
              className="flex items-center justify-center gap-1.5 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap">
              <Play size={11} fill="currentColor" />
              <span className="hidden sm:inline">Okumaya Başla</span>
              <span className="sm:hidden">Oku</span>
            </Link>
            <button onClick={() => toggleBookmark(s.slug)}
              className={cn('flex items-center justify-center gap-1.5 text-xs px-3 sm:px-4 py-2 rounded-lg transition-all border whitespace-nowrap',
                bookmarked
                  ? 'bg-[#EF9F27]/15 border-[#EF9F27]/40 text-[#EF9F27]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#9898b0] hover:text-white'
              )}>
              {bookmarked ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
              <span className="hidden sm:inline">{bookmarked ? 'Listemde' : 'Listeme Ekle'}</span>
            </button>
          </div>
        </div>

        {/* KONU PANELİ — flex-1 ile kalan tüm alanı kaplar */}
        {s.description && (
          <div className="hidden lg:flex items-center gap-4 flex-1 min-w-0">
            <div className="w-px self-stretch my-8 bg-white/10 flex-shrink-0" />
            <div className="flex flex-col justify-center gap-2 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#EF9F27]/60">Konu</p>
              <p className="text-sm text-[#b0b0c8] leading-relaxed line-clamp-7">
                {s.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Oklar + dots */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2">
        <button onClick={() => go((current - 1 + slides.length) % slides.length)}
          className="w-6 h-6 bg-black/40 hover:bg-[#EF9F27] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
          <ChevronLeft size={13} />
        </button>
        <button onClick={() => go((current + 1) % slides.length)}
          className="w-6 h-6 bg-black/40 hover:bg-[#EF9F27] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
          <ChevronRight size={13} />
        </button>
        <div className="flex items-center gap-1.5 ml-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={cn('rounded-full transition-all duration-300',
                i === current ? 'w-4 h-1.5 bg-[#EF9F27]' : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
              )} />
          ))}
        </div>
      </div>
    </div>
  )
}
