'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Lock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { getLatestChapterItems } from '@/lib/series-store'
import type { LatestChapterItem } from '@/lib/series-store'

const isLocked = (updatedAt: string) =>
  Date.now() - new Date(updatedAt).getTime() < 5 * 60 * 60 * 1000

export default function LatestChapters() {
  const [items, setItems] = useState<LatestChapterItem[]>([])

  useEffect(() => {
    getLatestChapterItems(16).then(setItems)
  }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#EF9F27] rounded-full" />
          <h2 className="text-lg font-bold text-white">Son Yüklenen Bölümler</h2>
        </div>
        <Link href="/seriler?sort=updated" className="text-xs text-[#EF9F27] hover:text-[#F5BA45] transition-colors">
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(item => {
          const locked = isLocked(item.updated)
          return (
            <Link key={item.id} href={`/seri/${item.slug}`}
              className="group flex flex-col bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#EF9F27]/10">

              <div className="relative w-full aspect-[3/4] bg-[#1a1a24] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.cover})` }} />
                {locked && (
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 bg-[#0a0a0f]/80 backdrop-blur-sm border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
                      🔒 Erken Erişim
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>

              <div className="p-2.5">
                <p className="text-xs font-semibold text-[#e8e8f0] line-clamp-2 leading-snug group-hover:text-[#EF9F27] transition-colors mb-1">
                  {item.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#555570]">
                  <span className="text-[#9898b0]">Bölüm {item.chapter}</span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={9} /> {timeAgo(item.updated)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[#555570] bg-[#13131c] border border-[#1e1e2e] rounded-xl px-4 py-2.5">
        <Lock size={11} className="text-yellow-500 flex-shrink-0" />
        <span>
          <span className="text-yellow-500 font-medium">Erken Erişim</span> bölümler yüklendikten 5 saat sonra herkese açılır. Puan harcayarak şimdi açabilirsin.
        </span>
      </div>
    </section>
  )
}
