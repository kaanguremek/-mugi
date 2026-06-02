import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export function timeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  if (diff < 2592000) return `${Math.floor(diff / 604800)} hafta önce`
  return past.toLocaleDateString('tr-TR')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function chapterLabel(num: number): string {
  return Number.isInteger(num) ? `Bölüm ${num}` : `Bölüm ${num}`
}

export const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Devam Ediyor',
  completed: 'Tamamlandı',
  hiatus: 'Ara Verildi',
  cancelled: 'İptal Edildi',
}

export const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-400',
  completed: 'text-blue-400',
  hiatus: 'text-yellow-400',
  cancelled: 'text-red-400',
}
