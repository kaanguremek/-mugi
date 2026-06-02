'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Bookmark, Star, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_FEATURED = [
  {
    id:'1', slug:'solo-leveling', title:'Solo Leveling',
    description: 'Dünyanın en zayıf avcısı Sung Jinwoo, sıradan bir avcıyken gizemli bir double dungeon\'da neredeyse hayatını kaybeder. Bu olaydan sonra yalnızca ona görünen bir sistem penceresiyle uyanır ve seviye atlayan tek insan olarak inanılmaz bir güce ulaşmaya başlar.',
    cover_url:'https://picsum.photos/seed/solo/400/600',
    banner_url:'https://picsum.photos/seed/solo-banner/1400/500',
    rating:9.8, status:'completed', genre_names:['Aksiyon','Fantastik','Sistem'],
    latest_chapter:179,
  },
  {
    id:'2', slug:'omniscient-reader', title:'Her Şeyi Bilen Okuyucu',
    description: 'Kim Dokja, yıllarca okuduğu web romanının gerçeğe dönüştüğünü fark eder. Romanın tek okuyucusu olarak tüm olay örgüsünü bilen Dokja, hayatta kalmak için bu bilgiyi kullanmak zorundadır. Ama asıl soru şu: Yazar bu sona nasıl karar verdi ve değiştirilebilir mi?',
    cover_url:'https://picsum.photos/seed/omni/400/600',
    banner_url:'https://picsum.photos/seed/omni-banner/1400/500',
    rating:9.6, status:'completed', genre_names:['Aksiyon','Drama','Fantastik'],
    latest_chapter:551,
  },
  {
    id:'3', slug:'reformation-deadbeat', title:'Tembel Soylunun Değişimi',
    description: 'Önceki hayatında tembel ve amaçsız bir soylu olan Rowan Gonzo, ölümünden önce pişmanlık içinde geçirdiği 20 yılı görür. Yeniden doğduğunda çocukluk yıllarına dönen Rowan, bu kez kılıç, siyaset ve aile arasında çok daha farklı kararlar almaya kararlıdır.',
    cover_url:'https://picsum.photos/seed/reform/400/600',
    banner_url:'https://picsum.photos/seed/reform-banner/1400/500',
    rating:9.4, status:'ongoing', genre_names:['Fantastik','Aksiyon','Macera'],
    latest_chapter:144,
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const items = MOCK_FEATURED

  const go = (idx: number) => {
    setFading(true)
    setTimeout(() => { setCurrent(idx); setFading(false) }, 250)
  }

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [current])

  const s = items[current]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ height: '310px' }}>

      {/* Arka plan banner */}
      {/* Düz koyu arka plan */}
      <div className="absolute inset-0 bg-[#0d0d14]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#EF9F27]/5 via-transparent to-transparent" />

      {/* İçerik */}
      <div className={cn(
        'relative h-full flex items-center px-6 gap-6 transition-opacity duration-250',
        fading ? 'opacity-0' : 'opacity-100'
      )}>

        {/* Kapak */}
        <div className="hidden sm:block flex-shrink-0 w-[130px] h-[185px] rounded-xl overflow-hidden border border-[#EF9F27]/35 shadow-2xl shadow-black/60">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${s.cover_url})` }} />
        </div>

        {/* SOL — başlık + meta + butonlar */}
        <div className="flex-shrink-0 w-[260px]">
          <div className="flex gap-1.5 mb-2.5">
            {s.genre_names.slice(0,3).map(g => (
              <span key={g} className="text-[10px] bg-[#EF9F27]/20 border border-[#EF9F27]/30 text-[#EF9F27] px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-2 leading-tight">
            {s.title}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[#9898b0] mb-5">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Star size={11} fill="currentColor" /> {s.rating}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={11} /> Bölüm {s.latest_chapter}
            </span>
            <span className={s.status === 'ongoing' ? 'text-[#22C55E]' : 'text-[#EF9F27]'}>
              {s.status === 'ongoing' ? 'Devam Ediyor' : 'Tamamlandı'}
            </span>
          </div>

          <div className="flex gap-2">
            <Link href={`/seri/${s.slug}`}
              className="flex items-center gap-1.5 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-[#EF9F27]/30">
              <Play size={12} fill="currentColor" /> Okumaya Başla
            </Link>
            <button className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#9898b0] hover:text-white text-xs px-4 py-2 rounded-lg transition-all">
              <Bookmark size={12} /> Listeme Ekle
            </button>
          </div>
        </div>

        {/* Ayraç çizgisi */}
        <div className="hidden lg:block w-px self-stretch my-8 bg-white/10 flex-shrink-0" />

        {/* SAĞ — doğal açıklama */}
        <div className="hidden lg:flex flex-1 flex-col justify-center gap-2 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#EF9F27]/70">Konu</p>
          <p className="text-sm text-[#b8b8cc] leading-relaxed">
            {s.description}
          </p>
        </div>
      </div>

      {/* Oklar + dots — alt sol */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2">
        <button onClick={() => go((current - 1 + items.length) % items.length)}
          className="w-6 h-6 bg-black/40 hover:bg-[#EF9F27] border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ChevronLeft size={13} />
        </button>
        <button onClick={() => go((current + 1) % items.length)}
          className="w-6 h-6 bg-black/40 hover:bg-[#EF9F27] border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ChevronRight size={13} />
        </button>
        <div className="flex items-center gap-1.5 ml-1">
          {items.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={cn('rounded-full transition-all duration-300',
                i === current ? 'w-4 h-1.5 bg-[#EF9F27]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              )} />
          ))}
        </div>
      </div>
    </div>
  )
}
