'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Flame, Bookmark, Star, Eye } from 'lucide-react'
import { formatNumber, cn } from '@/lib/utils'
import { MOCK_SERIES } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

const DAILY_MOST_READ       = ['8','1','7','16','5','2']
const DAILY_MOST_BOOKMARKED = ['8','16','1','7','2','5']

const tabs = [
  { key: 'read',     label: 'En Çok Okunan',          icon: Eye,      ids: DAILY_MOST_READ       },
  { key: 'bookmark', label: 'En Çok Listeye Eklenen', icon: Bookmark, ids: DAILY_MOST_BOOKMARKED },
]

export default function DailyTrending() {
  const [tab, setTab] = useState('read')
  const { toggleBookmark, isBookmarked } = useAuth()

  const current = tabs.find(t => t.key === tab)!
  const items = current.ids.map(id => MOCK_SERIES.find(s => s.id === id)!).filter(Boolean).slice(0, 6)

  return (
    <section>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#EF9F27] rounded-full" />
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame size={17} className="text-[#EF9F27]" /> Günün Öne Çıkanları
          </h2>
        </div>
        {/* Tab seçimi */}
        <div className="flex bg-[#13131c] border border-[#1e1e2e] rounded-xl p-0.5 gap-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-all font-medium',
                tab === t.key ? 'bg-[#EF9F27] text-white shadow' : 'text-[#555570] hover:text-[#9898b0]'
              )}>
              <t.icon size={11} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 kart — tam genişlik, 6 kolon */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((series, i) => (
          <div key={series.id} className="group relative bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/30 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5">
            <Link href={`/seri/${series.slug}`} className="block">
              {/* Kapak */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a24]">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${series.cover_url})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

                {/* Sıra */}
                <div className={cn(
                  'absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold',
                  i === 0 ? 'bg-[#EF9F27] text-white' :
                  i === 1 ? 'bg-[#9898b0]/80 text-white' :
                  i === 2 ? 'bg-[#BA7517]/80 text-white' :
                  'bg-black/60 text-[#9898b0]'
                )}>
                  {i + 1}
                </div>

                {/* Puan */}
                <div className="absolute top-2 right-1.5 flex items-center gap-0.5 bg-black/60 text-yellow-400 text-[9px] font-semibold px-1 py-0.5 rounded">
                  <Star size={7} fill="currentColor" /> {series.rating}
                </div>

                {/* Stat */}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-[9px] text-white/60 bg-black/50 px-1 py-0.5 rounded">
                  {tab === 'read'
                    ? <><Eye size={8} /> {formatNumber(series.view_count)}</>
                    : <><Bookmark size={8} /> {formatNumber(series.bookmark_count)}</>
                  }
                </div>
              </div>

              {/* Başlık */}
              <div className="px-2 pt-2 pb-1">
                <p className="text-[11px] font-semibold text-[#e8e8f0] line-clamp-2 leading-snug group-hover:text-[#EF9F27] transition-colors" style={{ minHeight: '2.4em' }}>
                  {series.title}
                </p>
              </div>
            </Link>

            {/* Bookmark */}
            <div className="px-2 pb-2">
              <button
                onClick={() => toggleBookmark(series.slug)}
                className={cn(
                  'w-full flex items-center justify-center gap-1 text-[9px] py-1 rounded-lg border transition-all',
                  isBookmarked(series.slug)
                    ? 'bg-[#EF9F27]/15 border-[#EF9F27]/40 text-[#EF9F27]'
                    : 'bg-[#1a1a24] border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30 hover:text-[#EF9F27]'
                )}>
                <Bookmark size={8} fill={isBookmarked(series.slug) ? 'currentColor' : 'none'} />
                {isBookmarked(series.slug) ? 'Listemde' : 'Ekle'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
