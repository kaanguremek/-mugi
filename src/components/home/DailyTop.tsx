import Link from 'next/link'
import { TrendingUp, Star, Eye, Flame } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

const DAILY_TOP = [
  { id:'1', slug:'solo-leveling',        title:'Solo Leveling',                cover:'https://picsum.photos/seed/sl10/80/110',  rating:9.8, views:24000 },
  { id:'3', slug:'reformation-deadbeat', title:'Tembel Soylunun Değişimi',     cover:'https://picsum.photos/seed/ref10/80/110', rating:9.4, views:18500 },
  { id:'4', slug:'academy-swordmaster',  title:"Academy's Genius Swordmaster", cover:'https://picsum.photos/seed/ags10/80/110', rating:9.0, views:14200 },
  { id:'2', slug:'omniscient-reader',    title:'Her Şeyi Bilen Okuyucu',       cover:'https://picsum.photos/seed/omni10/80/110',rating:9.6, views:11800 },
  { id:'5', slug:'world-saving-skill',   title:'World-Saving is a Skill',      cover:'https://picsum.photos/seed/wss10/80/110', rating:8.6, views:8900  },
]

const RANK_STYLE = [
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-[#9898b0]/15 text-[#9898b0] border-[#9898b0]/25',
  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'bg-[#1a1a24] text-[#555570] border-[#1e1e2e]',
  'bg-[#1a1a24] text-[#555570] border-[#1e1e2e]',
]

export default function DailyTop() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-orange-500 rounded-full" />
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame size={17} className="text-orange-400" />
          Günlük En Çok Okunan
        </h2>
      </div>

      <div className="space-y-2">
        {DAILY_TOP.map((item, i) => (
          <Link key={item.id} href={`/seri/${item.slug}`}
            className="flex items-center gap-3 bg-[#13131c] hover:bg-[#1a1a24] border border-[#1e1e2e] hover:border-orange-500/30 rounded-xl p-3 transition-all group">

            {/* Sıra numarası */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 border ${RANK_STYLE[i]}`}>
              {i + 1}
            </div>

            {/* Kapak */}
            <div className="w-9 h-12 rounded-lg overflow-hidden bg-[#1a1a24] flex-shrink-0">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.cover})` }} />
            </div>

            {/* Bilgi */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e8e8f0] line-clamp-1 group-hover:text-orange-400 transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                  <Star size={9} fill="currentColor" /> {item.rating}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-[#555570]">
                  <Eye size={9} /> {formatNumber(item.views)}
                </span>
              </div>
            </div>

            {/* HOT badge — top 3 için */}
            {i < 3 && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/25 px-1.5 py-0.5 rounded-full flex-shrink-0">
                <Flame size={9} /> HOT
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
