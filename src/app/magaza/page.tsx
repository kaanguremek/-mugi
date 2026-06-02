import type { Metadata } from 'next'
import { Coins, Crown, Palette, Frame, Sparkles, Star, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mağaza',
  description: 'Puan harcayarak profil çerçeveleri, isim renkleri ve özel aksesuarlar satın al.',
}

type Rarity = 'normal' | 'nadir' | 'efsanevi'

type ShopItem = {
  id: string
  name: string
  desc: string
  price: number
  category: string
  rarity: Rarity
  preview: React.ReactNode
}

const RARITY_STYLE: Record<Rarity, { label: string; color: string; border: string; bg: string }> = {
  normal:    { label: 'Normal',    color: '#9898b0', border: '#9898b0/30', bg: '#9898b0/10' },
  nadir:     { label: 'Nadir',     color: '#EF9F27', border: '#EF9F27/30', bg: '#EF9F27/10' },
  efsanevi:  { label: 'Efsanevi', color: '#F472B6', border: '#F472B6/30', bg: '#F472B6/10' },
}

const CATEGORIES = [
  { key: 'hepsi',    label: 'Tümü',           icon: Sparkles },
  { key: 'cerceve',  label: 'Avatar Çerçevesi', icon: Frame    },
  { key: 'aksesuar', label: 'Aksesuar',        icon: Crown    },
  { key: 'isim',     label: 'İsim Rengi',      icon: Palette  },
  { key: 'rozet',    label: 'Özel Rozet',       icon: Shield   },
]

function FramePreview({ color, style }: { color: string; style?: string }) {
  return (
    <div className="relative w-16 h-16 mx-auto">
      <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center overflow-hidden"
        style={{ border: `3px solid ${color}`, boxShadow: style === 'glow' ? `0 0 12px ${color}80` : undefined }}>
        <div className="w-10 h-10 rounded-full bg-[#2a2a3e] flex items-center justify-center text-lg">👤</div>
      </div>
      {style === 'crown' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base">👑</span>}
      {style === 'star'  && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base">⭐</span>}
      {style === 'flame' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base">🔥</span>}
      {style === 'sakura'&& <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base">🌸</span>}
    </div>
  )
}

function NamePreview({ text, gradient }: { text: string; gradient: string }) {
  return (
    <p className="text-sm font-bold text-center" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {text}
    </p>
  )
}

function BadgePreview({ icon, color }: { icon: string; color: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mx-auto">
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
        style={{ color, borderColor: color + '55', backgroundColor: color + '15' }}>
        {icon} Kullanıcı Adı
      </span>
    </div>
  )
}

const ITEMS: ShopItem[] = [
  // Çerçeveler
  { id:'f1', name:'Altın Çerçeve',    desc:'Klasik altın rengi profil çerçevesi',           price:200,  category:'cerceve',  rarity:'nadir',    preview:<FramePreview color="#EF9F27" /> },
  { id:'f2', name:'Kral Tacı',        desc:'Avatarının üstünde parlayan altın taç',         price:500,  category:'cerceve',  rarity:'efsanevi', preview:<FramePreview color="#EF9F27" style="crown" /> },
  { id:'f3', name:'Yıldız Çerçeve',   desc:'Gümüş yıldız temalı profil çerçevesi',         price:150,  category:'cerceve',  rarity:'normal',   preview:<FramePreview color="#c0c0c0" style="star" /> },
  { id:'f4', name:'Alevli Çerçeve',   desc:'Kızıl ateş efektli cesur çerçeve',             price:350,  category:'cerceve',  rarity:'nadir',    preview:<FramePreview color="#ef4444" style="flame" /> },
  { id:'f5', name:'Sakura Çerçeve',   desc:'Pembe sakura temalı zarif çerçeve',             price:300,  category:'cerceve',  rarity:'nadir',    preview:<FramePreview color="#F472B6" style="sakura" /> },
  { id:'f6', name:'Neon Mavi Işık',   desc:'Parlayan neon mavi glow çerçevesi',             price:400,  category:'cerceve',  rarity:'nadir',    preview:<FramePreview color="#38bdf8" style="glow" /> },

  // Aksesuarlar
  { id:'a1', name:'VIP Tacı',         desc:'Profilinde taç ikonu görünür',                  price:800,  category:'aksesuar', rarity:'efsanevi', preview:<div className="text-center text-3xl">👑</div> },
  { id:'a2', name:'Samuray Miğferi',  desc:'Savaşçı ruhu taşıyanlara özel aksesuar',       price:600,  category:'aksesuar', rarity:'efsanevi', preview:<div className="text-center text-3xl">⛩️</div> },
  { id:'a3', name:'Ejderha Ruhu',     desc:'Profil kartında ejderha efekti',                price:1000, category:'aksesuar', rarity:'efsanevi', preview:<div className="text-center text-3xl">🐉</div> },
  { id:'a4', name:'Şapka',            desc:'Klasik siyah şapka aksesuarı',                  price:100,  category:'aksesuar', rarity:'normal',   preview:<div className="text-center text-3xl">🎩</div> },

  // İsim Renkleri
  { id:'n1', name:'Altın İsim',       desc:'İsmin altın gradient ile parlasın',             price:300,  category:'isim',     rarity:'nadir',    preview:<NamePreview text="KullanıcıAdı" gradient="linear-gradient(90deg,#EF9F27,#F5BA45)" /> },
  { id:'n2', name:'Ateş İsim',        desc:'Kızıl-turuncu alev tonlarında isim',            price:350,  category:'isim',     rarity:'nadir',    preview:<NamePreview text="KullanıcıAdı" gradient="linear-gradient(90deg,#ef4444,#f97316)" /> },
  { id:'n3', name:'Gökkuşağı İsim',   desc:'Canlı gökkuşağı renk geçişi',                  price:500,  category:'isim',     rarity:'efsanevi', preview:<NamePreview text="KullanıcıAdı" gradient="linear-gradient(90deg,#F472B6,#818cf8,#38bdf8)" /> },
  { id:'n4', name:'Zümrüt İsim',      desc:'Taze yeşil tonlarında isim rengi',              price:250,  category:'isim',     rarity:'normal',   preview:<NamePreview text="KullanıcıAdı" gradient="linear-gradient(90deg,#22c55e,#4ade80)" /> },
  { id:'n5', name:'Mor Kristal',      desc:'Derin mor kristal renk geçişi',                 price:300,  category:'isim',     rarity:'nadir',    preview:<NamePreview text="KullanıcıAdı" gradient="linear-gradient(90deg,#a855f7,#818cf8)" /> },

  // Rozetler
  { id:'r1', name:'⚔️ Savaşçı',       desc:'İsmin yanında ⚔️ simgesi belirir',              price:150,  category:'rozet',    rarity:'normal',   preview:<BadgePreview icon="⚔️" color="#9898b0" /> },
  { id:'r2', name:'🔥 Efsane',         desc:'İsmin yanında 🔥 simgesi belirir',              price:200,  category:'rozet',    rarity:'nadir',    preview:<BadgePreview icon="🔥" color="#EF9F27" /> },
  { id:'r3', name:'✦ Seçkin',          desc:'Altın ✦ rozeti — nadirlik göstergesi',          price:450,  category:'rozet',    rarity:'efsanevi', preview:<BadgePreview icon="✦" color="#F472B6" /> },
  { id:'r4', name:'🐉 Ejderha',        desc:'İsmin yanında ejderha simgesi',                 price:600,  category:'rozet',    rarity:'efsanevi', preview:<BadgePreview icon="🐉" color="#F472B6" /> },
]

export default function MagazaPage() {
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
            Biriktirdiğin puanları profil özelleştirmelerine harca. Çerçeveler, renkler, rozetler ve daha fazlası.
          </p>
        </div>

        {/* Bakiye bilgisi (mock) */}
        <div className="flex items-center gap-3 bg-[#13131c] border border-[#EF9F27]/20 rounded-2xl px-5 py-4 w-fit">
          <Coins size={18} className="text-[#EF9F27]" />
          <span className="text-sm text-[#9898b0]">Puanın:</span>
          <span className="text-lg font-bold text-[#EF9F27]">—</span>
          <span className="text-xs text-[#555570] ml-1">Giriş yaparak bakiyeni gör</span>
        </div>

        {/* Kategori sekmeleri */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <div key={key}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm transition-all cursor-pointer border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27] font-medium first:flex hidden">
              <Icon size={14} /> {label}
            </div>
          ))}
          {/* Statik görünüm — gerçek filter için client component gerekir */}
          <div className="flex gap-2 flex-wrap w-full">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <span key={key}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs cursor-pointer border-[#1e1e2e] bg-[#13131c] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-[#EF9F27] transition-all">
                <Icon size={13} /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Ürün grid */}
        {['cerceve', 'aksesuar', 'isim', 'rozet'].map(cat => {
          const catItems = ITEMS.filter(i => i.category === cat)
          const catInfo = CATEGORIES.find(c => c.key === cat)!
          const CatIcon = catInfo.icon
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <CatIcon size={16} className="text-[#EF9F27]" />
                <h2 className="text-base font-bold text-white">{catInfo.label}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {catItems.map(item => {
                  const r = RARITY_STYLE[item.rarity]
                  return (
                    <div key={item.id}
                      className="bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/30 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 group">

                      {/* Nadir rozeti */}
                      <div className="flex justify-end">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: r.color, backgroundColor: r.color + '18', border: `1px solid ${r.color}44` }}>
                          {r.label}
                        </span>
                      </div>

                      {/* Önizleme */}
                      <div className="py-2 flex items-center justify-center min-h-[72px]">
                        {item.preview}
                      </div>

                      {/* Bilgi */}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white group-hover:text-[#EF9F27] transition-colors">{item.name}</p>
                        <p className="text-[11px] text-[#555570] mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>

                      {/* Fiyat + Satın Al */}
                      <button className="w-full flex items-center justify-center gap-1.5 bg-[#EF9F27]/10 hover:bg-[#EF9F27] border border-[#EF9F27]/30 hover:border-[#EF9F27] text-[#EF9F27] hover:text-white text-xs font-semibold py-2 rounded-xl transition-all">
                        <Coins size={12} /> {item.price.toLocaleString('tr')} puan
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Not */}
        <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl px-5 py-4 flex gap-3 items-start">
          <Star size={15} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#555570] leading-relaxed">
            <span className="text-[#9898b0] font-medium">Satın aldığın kozmetikler VIP puanını düşürmez</span> — harcama sadece mağaza bakiyenden gider. Bölüm kilit açma (50 puan/bölüm) ise ayrı bir havuzdan ödenir.
          </div>
        </div>

      </div>
    </main>
  )
}
