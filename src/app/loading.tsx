import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Arka plan çizgi detayları — bulanık */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="llines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <line x1="0" y1="60" x2="60" y2="0" stroke="#EF9F27" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#llines)" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#EF9F27]/5 rounded-full blur-[80px]" />
      </div>

      {/* Logo + glow animasyonu */}
      <div className="relative flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 30px #EF9F2760)' }}>
        {/* Dış halka glow */}
        <div className="absolute w-32 h-32 rounded-full animate-ping"
          style={{ background: 'radial-gradient(circle, #EF9F2730 0%, transparent 70%)', animationDuration: '2s' }} />
        <div className="absolute w-40 h-40 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, #EF9F2718 0%, transparent 70%)', animationDuration: '2s' }} />

        {/* Logo */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#EF9F27]/60 animate-[logoBreath_2s_ease-in-out_infinite]"
          style={{ boxShadow: '0 0 30px #EF9F2770, 0 0 60px #EF9F2740' }}>
          <Image src="/logo.png" alt="İmugi" width={96} height={96} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Yükleniyor yazısı */}
      <p className="mt-8 text-sm font-semibold text-[#EF9F27]/70 animate-pulse tracking-widest uppercase">
        Yükleniyor...
      </p>

      <style>{`
        @keyframes logoBreath {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 30px #EF9F2770, 0 0 60px #EF9F2740; }
          50%       { transform: scale(1.08); box-shadow: 0 0 50px #EF9F27AA, 0 0 100px #EF9F2760; }
        }
      `}</style>
    </div>
  )
}
