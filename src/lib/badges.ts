export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend'

export interface Badge {
  tier: BadgeTier
  label: string
  icon: string        // /badges/ altındaki dosya adı
  color: string       // UI rengi
  minDays: number     // kaç günden itibaren
}

export const BADGES: Badge[] = [
  { tier: 'bronze',  label: 'Bronz',    icon: '/badges/bronze.ico',  color: '#CD7F32', minDays: 7    },
  { tier: 'silver',  label: 'Gümüş',   icon: '/badges/silver.ico',  color: '#C0C0C0', minDays: 30   },
  { tier: 'gold',    label: 'Altın',    icon: '/badges/altın.ico',   color: '#FFD700', minDays: 180  },
  { tier: 'diamond', label: 'Elmas',    icon: '/badges/elmas.ico',   color: '#88CFFF', minDays: 365  },
  { tier: 'legend',  label: 'Efsane',   icon: '/badges/efsane.ico',  color: '#F472B6', minDays: 730  },
]

/**
 * Kayıt tarihi verilen bir kullanıcının rozetini döndürür.
 * Henüz 1 haftayı doldurmamışsa null döner.
 */
export function getUserBadge(createdAt: string | Date): Badge | null {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // En yüksek seviyeden başla, ilk uyuyana dön
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (days >= BADGES[i].minDays) return BADGES[i]
  }
  return null
}
