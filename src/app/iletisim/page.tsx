import type { Metadata } from 'next'
import { Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'İletişim' }

export default function IletisimPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#EF9F27]/10 border border-[#EF9F27]/30 rounded-full flex items-center justify-center mx-auto">
          <Clock size={28} className="text-[#EF9F27]" />
        </div>
        <h1 className="text-2xl font-bold text-white">İletişim</h1>
        <p className="text-[#9898b0] text-sm">Yakında Eklenecektir.</p>
      </div>
    </main>
  )
}
