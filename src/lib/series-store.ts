import { supabase } from './supabase'
import type { Series } from './types'

export interface AdminSeries {
  id: string
  slug: string
  title: string
  description: string
  coverUrl: string
  status: 'ongoing' | 'completed' | 'hiatus'
  genres: string[]
  author: string
  createdAt: string
  chapterCount: number
  latestChapter: number
  bookmarkCount: number
  viewCount: number
  rating: number
  ratingCount: number
}

export interface AdminChapter {
  id?: string
  num: number
  title: string
  pages: string[]
  createdAt: string
}

function dbToAdminSeries(s: Record<string, unknown>): AdminSeries {
  return {
    id:            s.id as string,
    slug:          s.slug as string,
    title:         s.title as string,
    description:   (s.description as string) ?? '',
    coverUrl:      (s.cover_url as string) ?? '',
    status:        (s.status as AdminSeries['status']) ?? 'ongoing',
    genres:        (s.genres as string[]) ?? [],
    author:        (s.author as string) ?? '',
    createdAt:     s.created_at as string,
    chapterCount:  (s.chapter_count as number) ?? 0,
    latestChapter: (s.latest_chapter as number) ?? 0,
    bookmarkCount: (s.bookmark_count as number) ?? 0,
    viewCount:     (s.view_count as number) ?? 0,
    rating:        (s.rating as number) ?? 0,
    ratingCount:   (s.rating_count as number) ?? 0,
  }
}

function adminToSeries(a: AdminSeries): Series {
  return {
    id:             a.id,
    slug:           a.slug,
    title:          a.title,
    description:    a.description,
    cover_url:      a.coverUrl,
    status:         a.status,
    type:           'manhwa',
    author:         a.author,
    rating:         a.rating,
    rating_count:   a.ratingCount,
    view_count:     a.viewCount,
    bookmark_count: a.bookmarkCount,
    is_featured:    false,
    is_adult:       false,
    created_at:     a.createdAt,
    updated_at:     a.createdAt,
    chapter_count:  a.chapterCount,
    latest_chapter: a.latestChapter,
    genre_names:    a.genres,
  }
}

export async function getAdminSeries(): Promise<AdminSeries[]> {
  const { data } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []).map(dbToAdminSeries)
}

export async function getAllSeries(): Promise<Series[]> {
  const list = await getAdminSeries()
  return list.map(adminToSeries)
}

export async function getAdminChapters(slug: string): Promise<AdminChapter[]> {
  const { data: series } = await supabase
    .from('series')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!series) return []

  const { data } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', series.id)
    .order('num', { ascending: false })

  return (data ?? []).map((c: Record<string, unknown>) => ({
    id:        c.id as string,
    num:       Number(c.num),
    title:     (c.title as string) ?? '',
    pages:     (c.pages as string[]) ?? [],
    createdAt: c.created_at as string,
  }))
}

export interface LatestChapterItem {
  id: string
  slug: string
  title: string
  cover: string
  chapter: number
  updated: string
}

export async function getLatestChapterItems(limit = 16): Promise<LatestChapterItem[]> {
  const { data } = await supabase
    .from('series')
    .select('id, slug, title, cover_url, latest_chapter, updated_at')
    .gt('chapter_count', 0)
    .order('updated_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((s: Record<string, unknown>) => ({
    id:      s.id as string,
    slug:    s.slug as string,
    title:   s.title as string,
    cover:   (s.cover_url as string) ?? '',
    chapter: Number(s.latest_chapter ?? 0),
    updated: s.updated_at as string,
  }))
}
