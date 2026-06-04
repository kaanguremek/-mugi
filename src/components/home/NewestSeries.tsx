'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { getAllSeries } from '@/lib/series-store'
import type { Series } from '@/lib/types'

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating / 2)
  const half = (rating / 2) % 1 >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= full ? 'text-[#EF9F27]' : i === full + 1 && half ? 'text-[#EF9F27]' : 'text-[#333350]'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-white ml-1">{(rating / 2).toFixed(1)}</span>
    </div>
  )
}

export default function NewestSeries() {
  const [newest, setNewest] = useState<Series[]>([])

  useEffect(() => {
    getAllSeries().then(all => {
      const sorted = [...all].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 7)
      setNewest(sorted)
    })
  }, [])

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={17} className="text-[#EF9F27]" /> En Yeni Seriler
        </h2>
        <Link href="/seriler?sort=updated" className="text-xs text-[#EF9F27] hover:text-[#F5BA45] transition-colors">
          Tümü →
        </Link>
      </div>

      {newest.length === 0 && (
        <p className="text-sm text-[#555570] text-center py-8">Henüz seri eklenmedi.</p>
      )}

      <div className="space-y-3">
        {newest.map((series, i) => (
          <Link key={series.id} href={`/seri/${series.slug}`}
            className="flex items-center gap-4 bg-[#13131c] hover:bg-[#1a1a24] border border-[#1e1e2e] hover:border-[#EF9F27]/30 rounded-xl p-3 transition-all group">

            {/* Kapak — PopularSection ile aynı boyut */}
            <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-[#1a1a24] flex-shrink-0 shadow-lg">
              <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url("${series.cover_url}")` }} />
              <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-br-lg bg-[#EF9F27] text-white">
                {i + 1}
              </div>
            </div>

            {/* Bilgi */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <p className="text-sm font-bold text-white group-hover:text-[#EF9F27] transition-colors leading-tight line-clamp-2">
                {series.title}
              </p>
              <p className="text-[11px] text-[#555570]">
                {series.genre_names?.slice(0, 3).join(', ')}
              </p>
              {series.rating > 0
                ? <StarRating rating={series.rating * 2} />
                : <span className="text-[11px] text-[#333350]">{series.chapter_count ?? 0} bölüm</span>
              }
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
