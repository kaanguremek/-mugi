'use client'
import Link from 'next/link'
import { Star, Eye, TrendingUp } from 'lucide-react'
import { formatNumber, cn } from '@/lib/utils'

const POPULAR = [
  { id:'1', slug:'solo-leveling', title:'Solo Leveling', cover:'https://picsum.photos/seed/sl/80/110', rating:9.8, views:2400000, genres:['Aksiyon'] },
  { id:'2', slug:'omniscient', title:'Her Şeyi Bilen Okuyucu', cover:'https://picsum.photos/seed/omni3/80/110', rating:9.6, views:1800000, genres:['Drama'] },
  { id:'5', slug:'deadbeat', title:'Reformation of the Deadbeat Noble', cover:'https://picsum.photos/seed/dbn4/80/110', rating:9.7, views:1200000, genres:['Fantastik'] },
  { id:'3', slug:'reform', title:'Tembel Soylunun Değişimi', cover:'https://picsum.photos/seed/ref3/80/110', rating:9.4, views:980000, genres:['Fantastik'] },
  { id:'4', slug:'academy', title:"Academy's Genius Swordmaster", cover:'https://picsum.photos/seed/ags2/80/110', rating:9.0, views:760000, genres:['Aksiyon'] },
]

export default function PopularSection() {
  return (
    <section>
      <div className="flex items-center mb-5">
        <div className="w-1 h-6 bg-[#EF9F27] rounded-full mr-3" />
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-[#EF9F27]" /> Popüler
        </h2>
      </div>

      <div className="space-y-2">
        {POPULAR.map((item, i) => (
          <Link key={item.id} href={`/seri/${item.slug}`}
            className="flex items-center gap-4 bg-[#13131c] hover:bg-[#1a1a24] border border-[#1e1e2e] hover:border-[#EF9F27]/30 rounded-xl p-3 transition-all group">

            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
              i === 0 ? 'bg-[#EF9F27]/20 text-[#EF9F27]' :
              i === 1 ? 'bg-[#9898b0]/20 text-[#9898b0]' :
              i === 2 ? 'bg-[#BA7517]/20 text-[#BA7517]' :
              'bg-[#1a1a24] text-[#555570]'
            )}>
              {i + 1}
            </div>

            <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#1a1a24] flex-shrink-0">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.cover})` }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e8e8f0] line-clamp-1 group-hover:text-[#EF9F27] transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-[#555570] mt-0.5">{item.genres[0]}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-[#F59E0B] text-xs mb-0.5">
                <Star size={10} fill="currentColor" /> {item.rating}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#555570]">
                <Eye size={9} /> {formatNumber(item.views)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
