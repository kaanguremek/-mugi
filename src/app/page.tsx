import Link from 'next/link'
import HeroSlider from '@/components/home/HeroSlider'
import LatestChapters from '@/components/home/LatestChapters'
import PopularSection from '@/components/home/PopularSection'
import GenreFilter from '@/components/home/GenreFilter'
import SeriesCard from '@/components/series/SeriesCard'

const MOCK_FEATURED_GRID = [
  { id:'1', slug:'solo-leveling',         title:'Solo Leveling',                cover_url:'https://picsum.photos/seed/sl20/300/400',  rating:9.8, status:'completed' as const, view_count:2400000, latest_chapter:179, genre_names:['Aksiyon','Sistem'] },
  { id:'2', slug:'omniscient-reader',     title:'Her Şeyi Bilen Okuyucu',       cover_url:'https://picsum.photos/seed/omni20/300/400', rating:9.6, status:'completed' as const, view_count:1800000, latest_chapter:551, genre_names:['Drama','Fantastik'] },
  { id:'3', slug:'reformation-deadbeat',  title:'Tembel Soylunun Değişimi',     cover_url:'https://picsum.photos/seed/ref20/300/400',  rating:9.4, status:'ongoing'   as const, view_count:980000,  latest_chapter:144, genre_names:['Fantastik'] },
  { id:'4', slug:'academy-swordmaster',   title:"Academy's Genius Swordmaster", cover_url:'https://picsum.photos/seed/ags20/300/400',  rating:9.0, status:'ongoing'   as const, view_count:760000,  latest_chapter:133, genre_names:['Aksiyon','Macera'] },
  { id:'5', slug:'deadbeat-noble',        title:'Reformation of the Deadbeat',  cover_url:'https://picsum.photos/seed/dbn20/300/400',  rating:9.7, status:'ongoing'   as const, view_count:1200000, latest_chapter:144, genre_names:['Fantastik','Macera'] },
  { id:'6', slug:'world-saving-skill',    title:'World-Saving is a Skill',      cover_url:'https://picsum.photos/seed/wss20/300/400',  rating:8.6, status:'ongoing'   as const, view_count:93000,   latest_chapter:28,  genre_names:['Komedi','Fantastik'] },
]

export default function HomePage() {
  return (
    <main className="pt-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Hero */}
        <div className="pt-5 pb-8">
          <HeroSlider />
        </div>

        {/* Sol + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">

          {/* SOL — geniş */}
          <div className="lg:col-span-2 space-y-12">

            {/* Son Yüklenen Bölümler */}
            <LatestChapters />

            {/* Öne Çıkanlar */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#EF9F27] rounded-full" />
                  <h2 className="text-lg font-bold text-white">Öne Çıkanlar</h2>
                </div>
                <Link href="/seriler" className="text-xs text-[#EF9F27] hover:text-[#F5BA45]">Tümünü Gör →</Link>
              </div>
              <div className="mb-4 overflow-x-auto pb-1">
                <GenreFilter />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MOCK_FEATURED_GRID.map(s => (
                  <SeriesCard key={s.id} series={s} />
                ))}
              </div>
            </section>
          </div>

          {/* SAĞ SIDEBAR */}
          <div>
            <PopularSection />
          </div>
        </div>
      </div>
    </main>
  )
}
