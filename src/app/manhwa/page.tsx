import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manhwa Nedir?',
  description: 'Manhwa nedir, manga ve webtoon\'dan farkı nedir? Tüm merak ettikleriniz burada.',
}

export default function ManhwaPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">

        {/* Başlık */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
            <h1 className="text-3xl font-bold text-white">Manhwa Nedir?</h1>
          </div>
          <p className="text-[#9898b0] text-sm ml-4">HaeTae'ye hoş geldiniz — okumadan önce biraz bilgi edinelim.</p>
        </div>

        {/* Kartlar */}
        <div className="space-y-5">

          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#EF9F27]" />
              <h2 className="text-base font-bold text-white">Manhwa (만화)</h2>
            </div>
            <p className="text-[#9898b0] text-sm leading-relaxed">
              Manhwa, Güney Kore'nin kendine özgü çizgi roman geleneğidir. Soldan sağa okunan, tam renkli ve dikey kaydırma formatına göre tasarlanmış bu eserler; aksiyon, fantezi ve romantizm başta olmak üzere onlarca farklı türde binlerce hikaye sunar.
            </p>
          </div>

          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#EF9F27]" />
              <h2 className="text-base font-bold text-white">Manga'dan Farkı Ne?</h2>
            </div>
            <p className="text-[#9898b0] text-sm leading-relaxed">
              Manhwa soldan sağa okunur, manga ise sağdan sola. En önemli fark ise renk — manhwa baştan sona tam renklidir, manga ise geleneksel olarak siyah beyazdır. Çizim estetiği ve hikaye anlatımı da farklıdır; manhwa karakterleri genellikle daha uzun, zarif ve detaylı tasarlanır.
            </p>
          </div>

          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <h2 className="text-base font-bold text-white">Webtoon ile Manhwa Aynı Şey Mi?</h2>
            </div>
            <p className="text-[#9898b0] text-sm leading-relaxed">
              Neredeyse. Manhwa basılı eserleri de kapsayan genel bir terimdir. Webtoon ise dijital platformlar için üretilen, telefon ekranına göre tasarlanmış dikey kaydırmalı formatın adıdır. Günümüzde bu iki kelime çoğunlukla birbirinin yerine kullanılır.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a href="/seriler"
            className="inline-flex items-center gap-2 bg-[#EF9F27] hover:bg-[#BA7517] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-[#EF9F27]/25 text-sm">
            Okumaya Başla →
          </a>
        </div>

      </div>
    </main>
  )
}
