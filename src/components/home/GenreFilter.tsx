'use client'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const GENRES = [
  'Tümü','Aksiyon','Fantastik','Macera','Dövüş Sanatları',
  'Shounen','Doğaüstü','Komedi','Drama','Manhwa','Büyü','Sistem','Isekai','Romantik'
]

export default function GenreFilter() {
  const [active, setActive] = useState('Tümü')

  return (
    <div className="flex gap-2 flex-wrap">
      {GENRES.map(genre => (
        <button key={genre}
          onClick={() => setActive(genre)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all border',
            active === genre
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#13131c] border-[#1e1e2e] text-[#9898b0] hover:border-blue-500/50 hover:text-white'
          )}>
          {genre}
        </button>
      ))}
    </div>
  )
}
