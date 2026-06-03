'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0f]">

      {/* Arka plan — altın/siyah çizgi detayları */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Diagonal çizgiler */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <line x1="0" y1="60" x2="60" y2="0" stroke="#EF9F27" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
        {/* Glow odakları */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#EF9F27]/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#B8960C]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-[#EF9F27]/4 rounded-full blur-2xl" />
      </div>

      {/* 4 [LOGO] 4 */}
      <div className="relative flex items-center gap-2 sm:gap-4 mb-10 select-none">
        <span className="text-[100px] sm:text-[140px] lg:text-[180px] font-black leading-none"
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px #EF9F27',
            textShadow: '0 0 40px #EF9F2760, 0 0 80px #EF9F2730',
          }}>
          4
        </span>

        {/* Logo ortada */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-[#EF9F27]/70"
            style={{ boxShadow: '0 0 40px #EF9F2780, 0 0 80px #EF9F2740, inset 0 0 30px #EF9F2720' }}>
            <Image src="/logo.png" alt="İmugi" width={144} height={144} className="w-full h-full object-cover" />
          </div>
          {/* Dış halka parlaması */}
          <div className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 60px #EF9F2760' }} />
        </div>

        <span className="text-[100px] sm:text-[140px] lg:text-[180px] font-black leading-none"
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px #EF9F27',
            textShadow: '0 0 40px #EF9F2760, 0 0 80px #EF9F2730',
          }}>
          4
        </span>
      </div>

      {/* İki kolon açıklama + ok + buton */}
      <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 relative z-10">

        {/* Sol — Ana Sayfa */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-bold text-white">Kayboldunuz mu?</p>
          <p className="text-sm text-[#9898b0]">Ana Sayfaya gitmek için</p>
          <ArrowDown size={20} className="text-[#EF9F27] animate-bounce" />
          <Link href="/"
            className="flex items-center gap-2 bg-[#EF9F27] hover:bg-[#BA7517] text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-[#EF9F27]/30 text-sm">
            Ana Sayfa
          </Link>
        </div>

        {/* Ayraç */}
        <div className="w-px h-24 bg-[#1e1e2e] hidden sm:block" />

        {/* Sağ — Seriler */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-bold text-white">Kaybolmayın!</p>
          <p className="text-sm text-[#9898b0]">Sitemizdeki serileri incelemek için</p>
          <ArrowDown size={20} className="text-[#EF9F27] animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Link href="/seriler"
            className="flex items-center gap-2 bg-[#13131c] hover:bg-[#1a1a24] border border-[#EF9F27]/40 hover:border-[#EF9F27] text-[#EF9F27] font-bold px-6 py-3 rounded-xl transition-all text-sm">
            Seriler
          </Link>
        </div>
      </div>
    </main>
  )
}
