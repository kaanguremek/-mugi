import Link from 'next/link'
import { Star, Eye, BookOpen } from 'lucide-react'
import { Series } from '@/lib/types'
import { formatNumber, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils'

interface Props {
  series: Partial<Series>
  showChapter?: boolean
  rank?: number
}

export default function SeriesCard({ series, showChapter = true, rank }: Props) {
  return (
    <Link href={`/seri/${series.slug}`}
      className="group relative flex flex-col bg-[#13131c] border border-[#1e1e2e] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10">

      {/* Kapak görseli */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a24]">
        {series.cover_url ? (
          <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url("${series.cover_url}")` }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={32} className="text-[#333350]" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

        {/* Rank */}
        {rank && (
          <div className="absolute top-2 left-2 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {rank}
          </div>
        )}

        {/* Puan */}
        {series.rating && series.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0a0a0f]/80 backdrop-blur-sm text-yellow-400 text-xs px-2 py-1 rounded-lg">
            <Star size={10} fill="currentColor" /> {series.rating}
          </div>
        )}

        {/* Alt bilgi (kapak üstünde) */}
        {showChapter && series.latest_chapter && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="text-xs text-[#9898b0] bg-[#0a0a0f]/70 backdrop-blur-sm rounded-lg px-2 py-1 inline-block">
              Bölüm {series.latest_chapter}
            </div>
          </div>
        )}
      </div>

      {/* Metin bilgileri */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#e8e8f0] line-clamp-2 leading-snug mb-2 group-hover:text-blue-400 transition-colors">
          {series.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-[#555570]">
          <span className={cn('font-medium', STATUS_COLORS[series.status || 'ongoing'])}>
            {STATUS_LABELS[series.status || 'ongoing']}
          </span>
          {series.view_count ? (
            <span className="flex items-center gap-1">
              <Eye size={10} /> {formatNumber(series.view_count)}
            </span>
          ) : null}
        </div>

        {series.genre_names && series.genre_names.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {series.genre_names.slice(0, 2).map(g => (
              <span key={g} className="text-[10px] bg-[#1a1a24] text-[#555570] px-1.5 py-0.5 rounded-md">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
