import Link from 'next/link'
import { Clock, Flame, Lock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

const HOT_IDS = new Set(['1', '3', '4'])

const isLocked = (updatedAt: string) => {
  const diff = Date.now() - new Date(updatedAt).getTime()
  return diff < 5 * 60 * 60 * 1000
}

const MOCK_LATEST = [
  { id:'1', slug:'solo-leveling',        title:'Solo Leveling',                cover:'https://picsum.photos/seed/sl30/400/560',  chapter:179, updated:'2026-06-02T08:00:00Z' },
  { id:'2', slug:'omniscient-reader',    title:'Her Şeyi Bilen Okuyucu',       cover:'https://picsum.photos/seed/omni30/400/560', chapter:551, updated:'2026-06-01T20:00:00Z' },
  { id:'3', slug:'reformation-deadbeat', title:'Tembel Soylunun Değişimi',     cover:'https://picsum.photos/seed/ref30/400/560',  chapter:144, updated:'2026-06-02T09:30:00Z' },
  { id:'4', slug:'academy-swordmaster',  title:"Academy's Genius Swordmaster", cover:'https://picsum.photos/seed/ags30/400/560',  chapter:133, updated:'2026-06-02T10:00:00Z' },
  { id:'5', slug:'world-saving-skill',   title:'World-Saving is a Skill',      cover:'https://picsum.photos/seed/wss30/400/560',  chapter:28,  updated:'2026-06-01T15:00:00Z' },
  { id:'6', slug:'dark-swordsman',       title:'The Dark Swordsman Returns',   cover:'https://picsum.photos/seed/ds30/400/560',   chapter:52,  updated:'2026-06-01T12:00:00Z' },
  { id:'7', slug:'shepherd-wizard',      title:'The Shepherd Wizard',          cover:'https://picsum.photos/seed/sw30/400/560',   chapter:22,  updated:'2026-06-01T10:00:00Z' },
  { id:'8', slug:'iron-blooded',         title:'Revenge of the Iron-Blooded',  cover:'https://picsum.photos/seed/ib30/400/560',   chapter:165, updated:'2026-06-01T08:00:00Z' },
]

export default function LatestChapters() {
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
        {MOCK_LATEST.map(item => {
          const locked = isLocked(item.updated)
          const hot = HOT_IDS.has(item.id)

          return (
            <Link key={item.id} href={`/seri/${item.slug}`}
              className="group flex flex-col bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#EF9F27]/10">

              {/* Kapak — tam genişlik, 3:4 oran */}
              <div className="relative w-full aspect-[3/4] bg-[#1a1a24] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.cover})` }} />

                {/* Üst sol: HOT veya Erken Erişim */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {hot && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-400 bg-[#0a0a0f]/80 backdrop-blur-sm border border-orange-500/30 px-1.5 py-0.5 rounded-full">
                      <Flame size={9} /> HOT
                    </span>
                  )}
                  {locked && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 bg-[#0a0a0f]/80 backdrop-blur-sm border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
                      Erken Erişim
                    </span>
                  )}
                </div>

                {/* Alt gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>

              {/* Alt bilgi */}
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

      {/* Erken erişim notu */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-[#555570] bg-[#13131c] border border-[#1e1e2e] rounded-xl px-4 py-2.5">
        <Lock size={11} className="text-yellow-500 flex-shrink-0" />
        <span>
          <span className="text-yellow-500 font-medium">Erken Erişim</span> bölümler yüklendikten 5 saat sonra herkese açılır. Puan harcayarak şimdi açabilirsin.
        </span>
      </div>
    </section>
  )
}
