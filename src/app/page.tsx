import LatestChapters from '@/components/home/LatestChapters'
import PopularSection from '@/components/home/PopularSection'
import NewestSeries from '@/components/home/NewestSeries'
import HeroSlider from '@/components/home/HeroSlider'

export default function HomePage() {
  return (
    <main className="pt-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Hero Slider */}
        <div className="pt-5 pb-8">
          <HeroSlider />
        </div>

        {/* Sol + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">

          {/* SOL */}
          <div className="lg:col-span-2">
            <LatestChapters />
          </div>

          {/* SAĞ SIDEBAR */}
          <div>
            <PopularSection />
            <NewestSeries />
          </div>
        </div>
      </div>
    </main>
  )
}
