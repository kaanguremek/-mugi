import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#EF9F27]/60 flex-shrink-0">
                <Image src="/logo.png" alt="HaeTae" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9F27] to-[#F5BA45]">
                HaeTae
              </span>
            </Link>
            <p className="text-xs text-[#555570] leading-relaxed">
              Türkçe manhwa, manga ve webtoon okuma platformu. Hız ve kalite versiyonlarıyla en güncel çeviriler.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#9898b0] mb-3">Keşfet</h4>
            <ul className="space-y-2">
              {['Seriler', 'Popüler', 'Son Eklenenler', 'Tamamlananlar'].map(item => (
                <li key={item}>
                  <Link href="/seriler" className="text-xs text-[#555570] hover:text-[#EF9F27] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#9898b0] mb-3">Türler</h4>
            <ul className="space-y-2">
              {['Aksiyon', 'Fantastik', 'Romantik', 'Komedi', 'Drama'].map(genre => (
                <li key={genre}>
                  <Link href={`/seriler?genre=${genre}`} className="text-xs text-[#555570] hover:text-[#EF9F27] transition-colors">
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#9898b0] mb-3">Hesap</h4>
            <ul className="space-y-2">
              {[['Giriş Yap', '/auth/login'], ['Üye Ol', '/auth/register'], ['Listem', '/bookmarks'], ['İletişim', '/iletisim']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-[#555570] hover:text-[#EF9F27] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#1e1e2e] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-[#333350]">© 2026 HaeTae. Tüm hakları saklıdır.</p>
          <p className="text-xs text-[#333350]">
            Bu site herhangi bir yayıncı ile bağlantılı değildir.
          </p>
        </div>
      </div>
    </footer>
  )
}
