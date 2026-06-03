'use client'
import { Star, Zap, Crown, Lock, Gift, Calendar, MessageSquare, TrendingUp } from 'lucide-react'
import { useAuth, getVipLevel } from '@/lib/auth-context'

const VIP_LEVELS = [
  { level: 1,  required: 0,     daily: 5,  premiumDaily: 12,  color: '#9898b0', glow: false },
  { level: 2,  required: 50,    daily: 8,  premiumDaily: 19,  color: '#cd7f32', glow: false },
  { level: 3,  required: 150,   daily: 12, premiumDaily: 29,  color: '#c0c0c0', glow: false },
  { level: 4,  required: 350,   daily: 16, premiumDaily: 38,  color: '#EF9F27', glow: false },
  { level: 5,  required: 700,   daily: 21, premiumDaily: 50,  color: '#F5BA45', glow: true  },
  { level: 6,  required: 1300,  daily: 27, premiumDaily: 65,  color: '#F5BA45', glow: true  },
  { level: 7,  required: 2500,  daily: 34, premiumDaily: 82,  color: '#F5BA45', glow: true  },
  { level: 8,  required: 4500,  daily: 42, premiumDaily: 101, color: '#F5BA45', glow: true  },
  { level: 9,  required: 7500,  daily: 51, premiumDaily: 122, color: '#F5BA45', glow: true  },
  { level: 10, required: 12000, daily: 62, premiumDaily: 149, color: '#EF9F27', glow: true  },
]

function VipBadge({ level, color, glow }: { level: number; color: string; glow: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{
        color,
        borderColor: color + '55',
        backgroundColor: color + '15',
        boxShadow: glow ? `0 0 8px ${color}40` : undefined,
      }}>
      <Star size={9} fill={color} color={color} />
      VIP {level}
    </span>
  )
}

const VIP_THRESHOLDS = [0, 50, 150, 350, 700, 1300, 2500, 4500, 7500, 12000]

function VipProgressBar() {
  const { user } = useAuth()

  if (!user) return (
    <div className="bg-[#0d0d14] border border-[#EF9F27]/15 rounded-xl px-5 py-4 mb-3 text-xs text-[#555570] text-center">
      VIP ilerlemenizi görmek için giriş yapın.
    </div>
  )

  const points   = user.vipPoints ?? 0
  const level    = getVipLevel(points)
  const curV     = VIP_LEVELS[level - 1]
  const nextV    = VIP_LEVELS[level] ?? null
  const curThres = VIP_THRESHOLDS[level - 1]
  const nextThres= nextV ? VIP_THRESHOLDS[level] : null
  const pct      = nextThres ? Math.min(100, ((points - curThres) / (nextThres - curThres)) * 100) : 100

  return (
    <div className="bg-[#0d0d14] border border-[#EF9F27]/15 rounded-xl px-5 py-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <VipBadge level={curV.level} color={curV.color} glow={curV.glow} />
          <span className="text-xs text-[#555570]">Mevcut seviye</span>
        </div>
        <div className="flex items-center gap-2">
          {nextV && <>
            <span className="text-xs text-[#9898b0]">
              {points.toLocaleString('tr')} / {nextThres!.toLocaleString('tr')} puan
            </span>
            <VipBadge level={nextV.level} color={nextV.color} glow={nextV.glow} />
          </>}
          {!nextV && <span className="text-xs text-[#EF9F27] font-bold">Maksimum Seviye 🎉</span>}
        </div>
      </div>
      <div className="w-full h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#EF9F27] to-[#F5BA45] transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
      {nextV && nextThres && (
        <p className="text-[10px] text-[#555570] mt-1.5 text-right">
          {(nextThres - points).toLocaleString('tr')} puan sonra VIP {nextV.level}
        </p>
      )}
    </div>
  )
}

export default function PuanSistemiPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-10">

        {/* Başlık */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
            <h1 className="text-3xl font-bold text-white">Puan & VIP Sistemi</h1>
          </div>
          <p className="text-[#9898b0] text-sm ml-4">
            İmugi'de aktif ol, puan kazan, VIP seviyeni yükselt. Yükseldikçe daha fazla ayrıcalık açılır.
          </p>
        </div>

        {/* Puan Kazanma Yolları */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-[#EF9F27]" /> Nasıl Puan Kazanılır?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Calendar,      label: 'Günlük Giriş',       desc: 'Her gün siteye giriş yap',             base: '+5 puan',  note: 'VIP seviyene göre artar' },
              { icon: TrendingUp,    label: '7 Gün Serisi',        desc: 'Üst üste 7 gün giriş yap',            base: '+300 puan', note: 'Her Pazar sıfırlanır' },
              { icon: MessageSquare, label: 'Yorum Yapma',         desc: 'Seri veya bölüme yorum bırak',        base: '+5 puan',  note: 'Günlük maks. 3 yorum' },
              { icon: Star,          label: 'Seri Değerlendirme', desc: 'Okuduğun seriye puan ver',             base: '+5 puan',  note: 'Seri başına 1 kez' },
            ].map(({ icon: Icon, label, desc, base, note }) => (
              <div key={label} className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EF9F27]/15 flex items-center justify-center">
                  <Icon size={16} className="text-[#EF9F27]" />
                </div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[#555570] leading-relaxed">{desc}</p>
                <div className="mt-auto pt-2 border-t border-[#1e1e2e]">
                  <span className="text-sm font-bold text-[#EF9F27]">{base}</span>
                  <p className="text-[10px] text-[#555570] mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7 Gün detayı */}
        <div className="bg-[#13131c] border border-[#EF9F27]/20 rounded-2xl p-5 flex gap-4 items-start">
          <Gift size={20} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white mb-1">7 Günlük Giriş Serisi</p>
            <p className="text-xs text-[#9898b0] leading-relaxed">
              Üst üste 7 gün siteye giriş yaparsan <span className="text-[#EF9F27] font-semibold">+300 bonus puan</span> kazanırsın.
              Sayaç her <span className="text-white font-medium">Pazar gece yarısı</span> sıfırlanır — yeni haftaya yeniden başlarsın.
              Bir gün atlarsan seri bozulur, sayaç sıfırlanır.
            </p>
          </div>
        </div>

        {/* VIP vs Mağaza puan ayrımı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#13131c] border border-[#EF9F27]/25 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#EF9F27]" />
              <p className="text-sm font-bold text-white">VIP Puanı</p>
            </div>
            <p className="text-xs text-[#9898b0] leading-relaxed">
              Tüm etkinliklerde kazandığın puanların <span className="text-white font-medium">kümülatif toplamı</span>.
              Hiçbir zaman düşmez, yalnızca artar. VIP seviyeni bu toplam belirler.
            </p>
          </div>
          <div className="bg-[#13131c] border border-[#22C55E]/25 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <p className="text-sm font-bold text-white">Mağaza Bakiyesi</p>
            </div>
            <p className="text-xs text-[#9898b0] leading-relaxed">
              Mağazadan kozmetik satın almak veya erken erişim açmak için harcadığın ayrı bakiye.
              Harcama <span className="text-white font-medium">VIP puanını etkilemez</span>.
            </p>
          </div>
        </div>

        {/* VIP Seviyeleri */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Crown size={16} className="text-[#EF9F27]" /> VIP Seviyeleri
          </h2>
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <VipProgressBar />

            <div className="grid grid-cols-4 text-[11px] font-semibold text-[#555570] uppercase tracking-wider px-5 py-3 border-b border-[#1e1e2e]">
              <span>Seviye</span>
              <span className="text-right">Günlük (Normal)</span>
              <span className="text-right text-[#EF9F27]">Günlük (Premium)</span>
              <span className="text-right">Sonraki Seviyeye</span>
            </div>
            {VIP_LEVELS.map((v, i) => {
              const next = VIP_LEVELS[i + 1]
              return (
                <div key={v.level}
                  className="grid grid-cols-4 items-center px-5 py-3.5 border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                  <div className="flex items-center gap-2">
                    <VipBadge level={v.level} color={v.color} glow={v.glow} />
                  </div>
                  <span className="text-right text-sm font-semibold text-[#9898b0]">
                    +{v.daily}
                  </span>
                  <span className="text-right text-sm font-semibold text-[#EF9F27]">
                    +{v.premiumDaily}
                  </span>
                  <span className="text-right text-xs text-[#555570]">
                    {next ? `${next.required.toLocaleString('tr')} puan` : '— Maksimum —'}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#555570] mt-2 ml-1">
            * VIP puanın hiçbir zaman düşmez. Harcamalar sadece Mağaza bakiyenden gider.
          </p>
        </section>

        {/* Puan Harcama */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Lock size={16} className="text-[#EF9F27]" /> Puan Harcama
          </h2>
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EF9F27]/15 flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-[#EF9F27]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Erken Erişim Bölümü Açma</p>
              <p className="text-xs text-[#9898b0] leading-relaxed mb-3">
                Yeni bölümler yüklendiğinde <span className="text-white font-medium">5 saat boyunca kilitlidir</span>. Bu süreyi atlamak için puan harcayabilirsin.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#EF9F27]/10 border border-[#EF9F27]/25 rounded-xl px-4 py-2">
                <span className="text-[#EF9F27] font-bold text-sm">50 puan</span>
                <span className="text-[#555570] text-xs">= 1 bölüm erken erişim</span>
              </div>
            </div>
          </div>
        </section>

        {/* Premium */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Crown size={16} className="text-[#EF9F27]" /> Premium Üyelik
          </h2>
          <div className="bg-gradient-to-br from-[#1a1208] to-[#13131c] border border-[#EF9F27]/30 rounded-2xl p-6"
            style={{ boxShadow: '0 0 30px #EF9F2710' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EF9F27]/20 flex items-center justify-center">
                <Crown size={20} className="text-[#EF9F27]" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Premium Üye</p>
                <p className="text-xs text-[#EF9F27]/70">En yüksek ayrıcalık seviyesi</p>
              </div>
              {/* Premium kullanıcı isim örneği */}
              <div className="ml-auto hidden sm:block">
                <span className="text-sm font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #EF9F27, #F5BA45, #BA7517)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                  ✦ KullanıcıAdı ✦
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Anında +500 VIP Puanı',        desc: 'Premium aldığın an 500 puan eklenir — sıfırdan başlayan biri direkt VIP 4\'e geçer' },
                { title: '%20 Ekstra Günlük Puan',       desc: 'Bulunduğun VIP seviyesindeki günlük puanın üstüne %20 bonus eklenir' },
                { title: 'Anında Yeni Bölüm',           desc: '5 saatlik kilit yok — yeni bölümler sana anında açık' },
                { title: 'Özel İsim Rengi',             desc: 'Altın gradient ile diğer kullanıcılardan hemen ayırt edilirsin' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF9F27] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-[#555570] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#EF9F27]/15 flex items-center justify-between">
              <p className="text-xs text-[#555570]">
                Premium aldığında VIP puanı kazanmaya devam edersin — ikisi birbirini iptal etmez.
              </p>
              <button className="text-xs font-bold bg-[#EF9F27] hover:bg-[#BA7517] text-white px-5 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-[#EF9F27]/25 flex-shrink-0 ml-4">
                Premium Al
              </button>
            </div>
          </div>
        </section>

        {/* Normal vs Premium özet */}
        <section>
          <h2 className="text-base font-bold text-white mb-4">Karşılaştırma</h2>
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 text-[11px] font-semibold text-[#555570] uppercase tracking-wider px-5 py-3 border-b border-[#1e1e2e]">
              <span>Özellik</span>
              <span className="text-center">Normal Üye</span>
              <span className="text-center text-[#EF9F27]">Premium Üye</span>
            </div>
            {[
              ['Premium Başlangıç Bonusu','—',                 '+500 VIP puanı'],
              ['Günlük Giriş Puanı',     'VIP\'e göre 5–62',  'VIP\'e göre +%20 bonus'],
              ['Yorum Puanı',            '+5 puan',            '+5 puan'],
              ['7 Gün Streak Bonusu',    '+300 puan',          '+300 puan'],
              ['Yeni Bölüm Erişimi',     '5 saat sonra / puan ile', 'Anında'],
              ['İsim Görünümü',          'Beyaz',             'Altın gradient'],
              ['VIP Sistemi',            'Evet',              'Evet (ayrıca)'],
            ].map(([feature, normal, premium]) => (
              <div key={feature} className="grid grid-cols-3 items-center px-5 py-3.5 border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <span className="text-xs text-[#9898b0]">{feature}</span>
                <span className="text-center text-xs text-[#555570]">{normal}</span>
                <span className="text-center text-xs font-semibold text-[#EF9F27]">{premium}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
