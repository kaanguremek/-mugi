'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Coins, Crown, Palette, Frame, Sparkles, User, X, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type Rarity = 'normal' | 'nadir' | 'efsanevi'
type Category = 'hepsi' | 'cerceve' | 'aksesuar' | 'isim'

interface ShopItem {
  id: string
  name: string
  desc: string
  price: number
  category: Exclude<Category, 'hepsi'>
  rarity: Rarity
  imagePath?: string
  previewType: 'frame' | 'accessory' | 'name'
  nameGradient?: string
}

const RARITY: Record<Rarity, { label: string; color: string }> = {
  normal:   { label: 'Normal',   color: '#9898b0' },
  nadir:    { label: 'Nadir',    color: '#EF9F27' },
  efsanevi: { label: 'Efsanevi', color: '#F472B6' },
}

const CATEGORIES: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: 'hepsi',    label: 'Tümü',            icon: Sparkles },
  { key: 'cerceve',  label: 'Avatar Çerçevesi', icon: Frame    },
  { key: 'aksesuar', label: 'Aksesuar',         icon: Crown    },
  { key: 'isim',     label: 'İsim Rengi',       icon: Palette  },
]

const ITEMS: ShopItem[] = [
  // ── Çerçeveler ──────────────────────────────────────────────
  { id:'f1', name:'Melek Çerçevesi',  desc:'Kutsal hale ve bulutlarla süslü ilahi çerçeve',      price:450,  category:'cerceve',  rarity:'efsanevi', previewType:'frame',     imagePath:'/frames/melek.svg'   },
  { id:'f2', name:'Kedi Çerçevesi',   desc:'Pembe kedi kulakları, kalpler ve pençelerle dolu',   price:250,  category:'cerceve',  rarity:'nadir',    previewType:'frame',     imagePath:'/frames/kedi.svg'    },
  { id:'f3', name:'Ateş Çerçevesi',   desc:'Dört köşeden yükselen dramatik alev efekti',         price:400,  category:'cerceve',  rarity:'nadir',    previewType:'frame',     imagePath:'/frames/ates.svg'    },
  { id:'f4', name:'Buz Çerçevesi',    desc:'Kristal buz ve kelebek temalı zarif çerçeve',        price:300,  category:'cerceve',  rarity:'nadir',    previewType:'frame',     imagePath:'/frames/buz.svg'     },
  { id:'f5', name:'Taş Çerçevesi',    desc:'Altın kenarlı koyu taş halka ve mavi mücevher',      price:500,  category:'cerceve',  rarity:'efsanevi', previewType:'frame',     imagePath:'/frames/tas.svg'     },
  { id:'f6', name:'Canavar Çerçevesi',desc:'Kanlı dişleri olan ürkütücü canavar ağzı',           price:350,  category:'cerceve',  rarity:'nadir',    previewType:'frame',     imagePath:'/frames/canavar.svg' },
  { id:'f7', name:'Enerji Çerçevesi', desc:'Dinamik kırmızı enerji kesim çizgileri',             price:200,  category:'cerceve',  rarity:'normal',   previewType:'frame',     imagePath:'/frames/enerji.svg'  },
  { id:'f8', name:'Zırh Çerçevesi',   desc:'Karanlık metal zırh dokusu ve perçinleri',           price:600,  category:'cerceve',  rarity:'efsanevi', previewType:'frame',     imagePath:'/frames/zirh.svg'    },

  // ── Aksesuarlar ─────────────────────────────────────────────
  { id:'a1', name:'Altın Taç',        desc:'Mücevherli görkemli altın taç',                      price:500,  category:'aksesuar', rarity:'efsanevi', previewType:'accessory', imagePath:'/accessories/altin-tac.svg'     },
  { id:'a2', name:'Altın Kanatlar',   desc:'Parlak altın tüy kanatlar',                          price:400,  category:'aksesuar', rarity:'nadir',    previewType:'accessory', imagePath:'/accessories/altin-kanat.svg'   },
  { id:'a3', name:'Korsan Şapkası',   desc:'Kafatası amblemli efsanevi korsan şapkası',          price:300,  category:'aksesuar', rarity:'nadir',    previewType:'accessory', imagePath:'/accessories/korsan-sapka.svg'  },
  { id:'a4', name:'Yarasa Kanatları', desc:'Karanlık yarasanın kadifemsi kanatları',              price:350,  category:'aksesuar', rarity:'nadir',    previewType:'accessory', imagePath:'/accessories/yarasa-kanat.svg'  },
  { id:'a5', name:'Kedi Kulakları',   desc:'Tatlı pembe kedi kulakları',                         price:150,  category:'aksesuar', rarity:'normal',   previewType:'accessory', imagePath:'/accessories/kedi-kulak.svg'    },
  { id:'a6', name:'Cadı Şapkası',     desc:'Gizemli mor bantlı sivri cadı şapkası',              price:250,  category:'aksesuar', rarity:'normal',   previewType:'accessory', imagePath:'/accessories/cadi-sapka.svg'    },
  { id:'a7', name:'Noel Şapkası',     desc:'Yılbaşı ruhunu taşıyan kırmızı şapka',              price:200,  category:'aksesuar', rarity:'normal',   previewType:'accessory', imagePath:'/accessories/noel-sapka.svg'    },
  { id:'a8', name:'Samuray Kaskı',    desc:'Altın süslü geleneksel samuray miğferi',             price:600,  category:'aksesuar', rarity:'efsanevi', previewType:'accessory', imagePath:'/accessories/samuray-kask.svg'  },
  { id:'a9', name:'Pixel Gözlük',     desc:'Klasik thug life pixel güneş gözlüğü',               price:100,  category:'aksesuar', rarity:'normal',   previewType:'accessory', imagePath:'/accessories/pixel-gozluk.svg'  },

  // ── İsim Renkleri ───────────────────────────────────────────
  { id:'n1', name:'Altın İsim',       desc:'İsmin altın gradient ile parlasın',                  price:300,  category:'isim',     rarity:'nadir',    previewType:'name', nameGradient:'linear-gradient(90deg,#EF9F27,#F5BA45)' },
  { id:'n2', name:'Ateş İsim',        desc:'Kızıl-turuncu alev tonlarında isim',                 price:350,  category:'isim',     rarity:'nadir',    previewType:'name', nameGradient:'linear-gradient(90deg,#ef4444,#f97316)' },
  { id:'n3', name:'Gökkuşağı İsim',   desc:'Canlı gökkuşağı renk geçişi',                       price:500,  category:'isim',     rarity:'efsanevi', previewType:'name', nameGradient:'linear-gradient(90deg,#F472B6,#818cf8,#38bdf8)' },
  { id:'n4', name:'Zümrüt İsim',      desc:'Taze yeşil tonlarında isim rengi',                   price:250,  category:'isim',     rarity:'normal',   previewType:'name', nameGradient:'linear-gradient(90deg,#22c55e,#4ade80)' },
  { id:'n5', name:'Mor Kristal',      desc:'Derin mor kristal renk geçişi',                      price:300,  category:'isim',     rarity:'nadir',    previewType:'name', nameGradient:'linear-gradient(90deg,#a855f7,#818cf8)' },

]

function FramePreview({ imagePath }: { imagePath: string }) {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* Avatar placeholder */}
      <div className="absolute inset-0 rounded-full bg-[#2a2a3e] flex items-center justify-center overflow-hidden">
        <User size={28} className="text-[#555570]" />
      </div>
      {/* Frame overlay */}
      <Image src={imagePath} alt="frame" fill className="object-contain" unoptimized />
    </div>
  )
}

function AccessoryPreview({ imagePath }: { imagePath: string }) {
  return (
    <div className="relative w-20 h-16 mx-auto flex items-center justify-center">
      <Image src={imagePath} alt="accessory" width={80} height={64} className="object-contain max-h-16" unoptimized />
    </div>
  )
}

function NamePreview({ gradient }: { gradient: string }) {
  return (
    <p className="text-sm font-bold text-center"
      style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      KullanıcıAdı
    </p>
  )
}

function ItemPreview({ item }: { item: ShopItem }) {
  if (item.previewType === 'frame' && item.imagePath)
    return <FramePreview imagePath={item.imagePath} />
  if (item.previewType === 'accessory' && item.imagePath)
    return <AccessoryPreview imagePath={item.imagePath} />
  if (item.previewType === 'name' && item.nameGradient)
    return <NamePreview gradient={item.nameGradient} />
  return null
}

export default function MagazaPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('hepsi')
  const [previewFrame, setPreviewFrame] = useState<ShopItem | null>(null)
  const { user } = useAuth()

  const visibleItems = activeCategory === 'hepsi'
    ? ITEMS
    : ITEMS.filter(i => i.category === activeCategory)

  const sections = activeCategory === 'hepsi'
    ? (['cerceve', 'aksesuar', 'isim'] as const)
    : [activeCategory as Exclude<Category, 'hepsi'>]

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Başlık */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
            <h1 className="text-3xl font-bold text-white">Mağaza</h1>
          </div>
          <p className="text-[#9898b0] text-sm ml-4">
            Biriktirdiğin puanları profil özelleştirmelerine harca. Çerçeveler, aksesuarlar, renkler ve daha fazlası.
          </p>
        </div>

        {/* Bakiye */}
        <div className="flex items-center gap-3 bg-[#13131c] border border-[#EF9F27]/20 rounded-2xl px-5 py-4 w-fit">
          <Coins size={18} className="text-[#EF9F27]" />
          <span className="text-sm text-[#9898b0]">Puanın:</span>
          <span className="text-lg font-bold text-[#EF9F27]">—</span>
          <span className="text-xs text-[#555570] ml-1">Giriş yaparak bakiyeni gör</span>
        </div>

        {/* Kategori sekmeleri */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                activeCategory === key
                  ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                  : 'border-[#1e1e2e] bg-[#13131c] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-[#EF9F27]'
              }`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Ürün bölümleri */}
        {sections.map(cat => {
          const catItems = visibleItems.filter(i => i.category === cat)
          if (!catItems.length) return null
          const catInfo = CATEGORIES.find(c => c.key === cat)!
          const CatIcon = catInfo.icon
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <CatIcon size={16} className="text-[#EF9F27]" />
                <h2 className="text-base font-bold text-white">{catInfo.label}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {catItems.map(item => (
                    <div key={item.id}
                      className="bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/30 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 group">

                      {/* Önizleme */}
                      <div className="py-1 flex items-center justify-center min-h-[80px]">
                        <ItemPreview item={item} />
                      </div>

                      {/* Bilgi */}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white group-hover:text-[#EF9F27] transition-colors leading-tight">{item.name}</p>
                        <p className="text-[11px] text-[#555570] mt-1 leading-relaxed">{item.desc}</p>
                      </div>

                      {/* Butonlar */}
                      <div className="flex gap-1.5">
                        {item.previewType === 'frame' && item.imagePath && (
                          <button
                            onClick={() => setPreviewFrame(item)}
                            className="flex-1 text-[10px] py-1.5 rounded-xl border border-[#1e1e2e] bg-[#1a1a24] text-[#9898b0] hover:border-[#EF9F27]/30 hover:text-[#EF9F27] transition-all">
                            Önizle
                          </button>
                        )}
                        <button className="flex-1 flex items-center justify-center gap-1 bg-[#EF9F27]/10 hover:bg-[#EF9F27] border border-[#EF9F27]/30 hover:border-[#EF9F27] text-[#EF9F27] hover:text-white text-[10px] font-semibold py-1.5 rounded-xl transition-all">
                          <Coins size={10} /> {item.price.toLocaleString('tr')}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )
        })}

        {/* Not */}
        <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl px-5 py-4 flex gap-3 items-start">
          <Star size={15} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#555570] leading-relaxed">
            <span className="text-[#9898b0] font-medium">Satın aldığın kozmetikler VIP puanını düşürmez</span> — harcama sadece mağaza bakiyenden gider. Bölüm kilit açma (50 puan/bölüm) ise ayrı bir havuzdan ödenir.
          </p>
        </div>

      </div>

      {/* Çerçeve Önizleme Modal */}
      {previewFrame && previewFrame.imagePath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewFrame(null)}>
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-8 max-w-xs w-full mx-4 text-center"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-white">{previewFrame.name} — Önizleme</p>
              <button onClick={() => setPreviewFrame(null)} className="text-[#555570] hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Avatar + Çerçeve */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full overflow-hidden bg-[#2a2a3e] flex items-center justify-center">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={48} className="text-[#555570]" />
                }
              </div>
              <Image src={previewFrame.imagePath} alt="frame" fill className="object-contain" unoptimized />
            </div>

            <p className="text-xs text-[#9898b0] mb-5">
              {user?.avatar ? 'Profil fotoğrafınla nasıl durduğunu görüyorsun.' : 'Profil fotoğrafı yüklenirse bu çerçeveyle görünür.'}
            </p>
            <p className="text-xs text-[#555570] mb-5">{previewFrame.desc}</p>

            <button className="w-full flex items-center justify-center gap-2 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <Coins size={14} /> {previewFrame.price.toLocaleString('tr')} puan ile al
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
