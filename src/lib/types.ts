export type SeriesStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled'
export type SeriesType = 'manhwa' | 'manga' | 'manhua' | 'webtoon'
export type ChapterVersion = 'speed' | 'quality'
export type UserRole = 'user' | 'admin' | 'moderator'
export type BookmarkStatus = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold'
export type ReactionType = 'upvote' | 'funny' | 'love' | 'surprised' | 'angry' | 'sad'

export interface Series {
  id: string
  slug: string
  title: string
  alt_titles?: string[]
  description?: string
  cover_url?: string
  banner_url?: string
  status: SeriesStatus
  type: SeriesType
  author?: string
  artist?: string
  release_year?: number
  rating: number
  rating_count: number
  view_count: number
  bookmark_count: number
  is_featured: boolean
  is_adult: boolean
  created_at: string
  updated_at: string
  // from view
  chapter_count?: number
  latest_chapter?: number
  last_updated?: string
  genre_names?: string[]
}

export interface Chapter {
  id: string
  series_id: string
  chapter_num: number
  title?: string
  version: ChapterVersion
  page_count: number
  view_count: number
  published_at: string
  created_at: string
}

export interface ChapterPage {
  id: string
  chapter_id: string
  page_num: number
  image_url: string
  width?: number
  height?: number
}

export interface Genre {
  id: number
  name: string
  slug: string
}

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  series_id?: string
  chapter_id?: string
  parent_id?: string
  content: string
  is_spoiler: boolean
  like_count: number
  created_at: string
  updated_at: string
  // joined
  profile?: Profile
  replies?: Comment[]
}
