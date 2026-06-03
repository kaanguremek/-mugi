'use client'
import { use, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, List, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getAdminChapters } from '@/lib/series-store'
import type { AdminChapter } from '@/lib/series-store'

export default function BolumClient({ params }: { params: Promise<{ slug: string; num: string }> }) {
  const { slug: paramSlug, num: paramNum } = use(params)
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : []
  const slug  = (paramSlug === '_' && pathParts[1]) ? pathParts[1] : paramSlug
  const num   = (paramNum  === '0' && pathParts[3]) ? pathParts[3] : paramNum
  const chNum = parseFloat(num)

  const [chapters,     setChapters]     = useState<AdminChapter[]>([])
  const [chapter,      setChapter]      = useState<AdminChapter | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [showChapters, setShowChapters] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAdminChapters(slug).then(async chs => {
      const sorted = chs.sort((a, b) => a.num - b.num)
      setChapters(sorted)
      const found = sorted.find(c => c.num === chNum) ?? null
      setChapter(found)
      setLoading(false)

      if (found) {
        // Okuma geçmişine kaydet (Supabase + localStorage fallback)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: seriesRow } = await supabase
              .from('series')
              .select('id')
              .eq('slug', slug)
              .maybeSingle()

            if (seriesRow) {
              await supabase.from('read_history').upsert({
                user_id: user.id,
                series_id: seriesRow.id,
                chapter_num: chNum,
                read_at: new Date().toISOString(),
              }, { onConflict: 'user_id,series_id,chapter_num' })
            }
          }
        } catch {}
      }
    })
  }, [slug, chNum])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node))
        setShowChapters(false)
    }
    if (showChapters) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showChapters])

  const idx    = chapters.findIndex(c => c.num === chNum)
  const prevCh = idx > 0 ? chapters[idx - 1] : null
  const nextCh = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null

  const navBar = (
    <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-[#1e1e2e]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href={`/seri/${slug}`}
          className="flex items-center gap-1.5 text-xs text-[#9898b0] hover:text-white transition-colors flex-shrink-0">
          <Home size={14} />
          <span className="hidden sm:inline">Seri</span>
        </Link>
        <span className="text-[#333350]">/</span>
        <span className="text-sm font-semibold text-white flex-1 truncate">Bölüm {chNum}</span>

        <div className="flex items-center gap-2">
          {prevCh && (
            <Link href={`/seri/${slug}/bolum/${prevCh.num}`}
              className="flex items-center gap-1 text-xs bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-white px-3 py-1.5 rounded-lg transition-all">
              <ChevronLeft size={13} /> Önceki
            </Link>
          )}
          {nextCh && (
            <Link href={`/seri/${slug}/bolum/${nextCh.num}`}
              className="flex items-center gap-1 text-xs bg-[#EF9F27] hover:bg-[#BA7517] text-white px-3 py-1.5 rounded-lg transition-all font-semibold">
              Sonraki <ChevronRight size={13} />
            </Link>
          )}

          <div className="relative" ref={listRef}>
            <button
              onClick={() => setShowChapters(v => !v)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg border transition-all',
                showChapters
                  ? 'bg-[#EF9F27]/10 border-[#EF9F27] text-[#EF9F27]'
                  : 'bg-[#13131c] border-[#1e1e2e] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-white'
              )}>
              {showChapters ? <X size={13} /> : <List size={13} />}
            </button>

            {showChapters && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#13131c] border border-[#1e1e2e] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-[#1e1e2e] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Bölümler</span>
                  <span className="text-[10px] text-[#555570]">{chapters.length} bölüm</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[...chapters].reverse().map(ch => (
                    <Link
                      key={ch.num}
                      href={`/seri/${slug}/bolum/${ch.num}`}
                      onClick={() => setShowChapters(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 text-sm border-b border-[#1e1e2e] last:border-0 transition-colors',
                        ch.num === chNum
                          ? 'bg-[#EF9F27]/10 text-[#EF9F27] font-semibold'
                          : 'text-[#9898b0] hover:bg-[#1a1a24] hover:text-white'
                      )}>
                      <span>Bölüm {ch.num}</span>
                      {ch.num === chNum && (
                        <span className="text-[10px] bg-[#EF9F27]/20 text-[#EF9F27] px-1.5 py-0.5 rounded-full">Şu an</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <>{navBar}<main className="min-h-screen flex items-center justify-center">
      <p className="text-[#555570] text-sm">Yükleniyor...</p>
    </main></>
  )

  if (!chapter) return (
    <>{navBar}<main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[#555570] text-sm">Bölüm bulunamadı.</p>
      <Link href={`/seri/${slug}`} className="text-xs text-[#EF9F27] hover:underline">Seri sayfasına dön</Link>
    </main></>
  )

  if (chapter.pages.length === 0) return (
    <>{navBar}<main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[#555570] text-sm">Bu bölüme henüz sayfa eklenmemiş.</p>
      <Link href={`/seri/${slug}`} className="text-xs text-[#EF9F27] hover:underline">Seri sayfasına dön</Link>
    </main></>
  )

  return (
    <>
      {navBar}
      <main className="bg-[#080808] min-h-screen pb-20">
        <div className="max-w-3xl mx-auto">
          {chapter.pages.map((url, i) => (
            <img key={i} src={url} alt={`Sayfa ${i + 1}`}
              className="w-full block select-none"
              loading={i < 3 ? 'eager' : 'lazy'}
              draggable={false} />
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-8 flex items-center justify-center gap-3">
          {prevCh ? (
            <Link href={`/seri/${slug}/bolum/${prevCh.num}`}
              className="flex items-center gap-2 text-sm bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-white px-5 py-2.5 rounded-xl transition-all">
              <ChevronLeft size={15} /> Önceki Bölüm
            </Link>
          ) : (
            <Link href={`/seri/${slug}`}
              className="flex items-center gap-2 text-sm bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-white px-5 py-2.5 rounded-xl transition-all">
              <Home size={15} /> Seri Sayfası
            </Link>
          )}
          {nextCh && (
            <Link href={`/seri/${slug}/bolum/${nextCh.num}`}
              className="flex items-center gap-2 text-sm bg-[#EF9F27] hover:bg-[#BA7517] text-white font-semibold px-5 py-2.5 rounded-xl transition-all">
              Sonraki Bölüm <ChevronRight size={15} />
            </Link>
          )}
        </div>
      </main>
    </>
  )
}
