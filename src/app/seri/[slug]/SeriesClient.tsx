'use client'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, ChevronDown, ThumbsUp, ThumbsDown, MessageCircle, Send, X } from 'lucide-react'
import { cn, formatNumber, STATUS_LABELS, timeAgo } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getAllSeries, getAdminChapters } from '@/lib/series-store'
import type { Series } from '@/lib/types'
import type { AdminChapter } from '@/lib/series-store'

// ── Types ───────────────────────────────────────────────────────
interface Reply {
  id: string; username: string; avatar: string | null; frame: string | null; isPremium: boolean
  content: string; likes: string[]; dislikes: string[]; createdAt: string
}
interface Comment {
  id: string; username: string; avatar: string | null; frame: string | null; isPremium: boolean
  content: string; likes: string[]; dislikes: string[]; createdAt: string
  replies: Reply[]
}
type SortMode = 'best' | 'newest' | 'oldest'

// ── Reactions localStorage (cosmetic) ──────────────────────────
function getReactions(slug: string): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(`imugi_rx_${slug}`) || '{}') } catch { return {} }
}
function saveReactions(slug: string, r: Record<string, number>) {
  try { localStorage.setItem(`imugi_rx_${slug}`, JSON.stringify(r)) } catch {}
}
function getMyReaction(slug: string): string | null {
  try { return JSON.parse(localStorage.getItem(`imugi_rxu_${slug}`) || 'null') } catch { return null }
}
function setMyReaction(slug: string, r: string | null) {
  if (r) localStorage.setItem(`imugi_rxu_${slug}`, JSON.stringify(r))
  else localStorage.removeItem(`imugi_rxu_${slug}`)
}

// ── Star visual ─────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const full = rating >= i
        const half = !full && rating >= i - 0.5
        return (
          <i key={i} className={cn('fi leading-none',
            full ? 'fi-sr-star text-[#EF9F27]' :
            half ? 'fi-sr-star text-[#EF9F27] opacity-50' :
            'fi-rr-star text-[#555570]'
          )} style={{ fontSize: size }} />
        )
      })}
    </span>
  )
}

// ── Rating popup ────────────────────────────────────────────────
function RatingPopup({ seriesId, userId, currentRating, onClose, onSaved }: {
  seriesId: string; userId: string; currentRating: number
  onClose: () => void; onSaved: (avg: number) => void
}) {
  const [sel,    setSel]    = useState(currentRating)
  const [hov,    setHov]    = useState(0)
  const [saving, setSaving] = useState(false)

  const disp = hov > 0 ? hov : sel   // 0–5, 0.5 adımlarla

  const confirm = async () => {
    if (!sel || saving) return
    setSaving(true)
    const { error } = await supabase
      .from('ratings')
      .upsert({ user_id: userId, series_id: seriesId, rating: sel }, { onConflict: 'user_id,series_id' })
    if (error) { console.error('Rating error:', error.message); setSaving(false); return }

    const { data } = await supabase.from('ratings').select('rating').eq('series_id', seriesId)
    const vals = (data ?? []).map((r: Record<string, unknown>) => Number(r.rating))
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : sel
    onSaved(Math.round(avg * 10) / 10)
    setSaving(false)
    onClose()
  }

  return (
    <div onClick={e => e.stopPropagation()}
      className="absolute top-full left-0 mt-2 z-50 bg-[#13131c] border border-[#EF9F27]/30 rounded-2xl p-4 shadow-2xl shadow-black/80 min-w-[230px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#9898b0]">
          Puanın: <span className="text-[#EF9F27]">{disp ? disp.toFixed(1) : '—'}</span>
        </span>
        <button onClick={onClose} className="text-[#555570] hover:text-white transition-colors"><X size={14} /></button>
      </div>

      {/* Yıldızlar — her yıldızın sol yarısı .5, sağ yarısı tam puan */}
      <div className="flex gap-1.5 mb-4 justify-center" onMouseLeave={() => setHov(0)}>
        {[1, 2, 3, 4, 5].map(i => {
          const fill = Math.max(0, Math.min(1, disp - (i - 1)))   // 0 | 0.5 | 1
          return (
            <div key={i} className="relative" style={{ width: 32, height: 32 }}>
              {/* Gri taban */}
              <i className="fi fi-sr-star absolute inset-0 leading-none text-[#333350]" style={{ fontSize: 32 }} />
              {/* Turuncu dolgu (genişlikle kırpılır) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${fill * 100}%` }}>
                <i className="fi fi-sr-star absolute inset-0 leading-none text-[#EF9F27]" style={{ fontSize: 32 }} />
              </div>
              {/* Tık bölgeleri */}
              <button type="button" aria-label={`${i - 0.5} puan`}
                className="absolute inset-y-0 left-0 w-1/2 z-10"
                onMouseEnter={() => setHov(i - 0.5)} onClick={() => setSel(i - 0.5)} />
              <button type="button" aria-label={`${i} puan`}
                className="absolute inset-y-0 right-0 w-1/2 z-10"
                onMouseEnter={() => setHov(i)} onClick={() => setSel(i)} />
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={confirm} disabled={!sel || saving}
          className="flex-1 bg-[#EF9F27] hover:bg-[#BA7517] disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-xl transition-all">
          {saving ? 'Kaydediliyor...' : 'Onayla'}
        </button>
        <button onClick={onClose} className="px-3 py-2 text-xs text-[#555570] hover:text-white rounded-xl border border-[#1e1e2e] transition-colors">
          Vazgeç
        </button>
      </div>
    </div>
  )
}

// ── Reactions ───────────────────────────────────────────────────
const RXLIST = [
  { key: 'upvote',    emoji: '👍', label: 'Harika'     },
  { key: 'funny',     emoji: '😂', label: 'Komik'      },
  { key: 'love',      emoji: '❤️', label: 'Aşk'        },
  { key: 'surprised', emoji: '😮', label: 'Şaşırtıcı' },
  { key: 'angry',     emoji: '😤', label: 'Sinir B.'   },
  { key: 'sad',       emoji: '😢', label: 'Üzücü'      },
]

function ReactionsBlock({ slug, userId }: { slug: string; userId: string | null }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine, setMine]     = useState<string | null>(null)

  useEffect(() => { setCounts(getReactions(slug)); setMine(getMyReaction(slug)) }, [slug])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const react = (key: string) => {
    if (!userId) { window.location.href = '/login'; return }
    const c = { ...counts }
    if (mine === key) {
      c[key] = Math.max(0, (c[key] ?? 0) - 1)
      saveReactions(slug, c); setMyReaction(slug, null); setCounts(c); setMine(null)
    } else {
      if (mine) c[mine] = Math.max(0, (c[mine] ?? 0) - 1)
      c[key] = (c[key] ?? 0) + 1
      saveReactions(slug, c); setMyReaction(slug, key); setCounts(c); setMine(key)
    }
  }

  return (
    <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 mt-6">
      <div className="text-center mb-5">
        <h3 className="text-sm font-bold text-white">Bu seri hakkında ne düşünüyorsunuz?</h3>
        <p className="text-xs text-[#555570] mt-1">{total.toLocaleString('tr')} tepki</p>
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {RXLIST.map(r => (
          <button key={r.key} onClick={() => react(r.key)}
            className={cn('flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border transition-all min-w-[72px]',
              mine === r.key ? 'border-[#EF9F27]/60 bg-[#EF9F27]/10' : 'border-[#1e1e2e] bg-[#1a1a24] hover:border-[#EF9F27]/30'
            )}>
            <span className="text-2xl leading-none">{r.emoji}</span>
            <span className="text-sm font-bold text-white">{(counts[r.key] ?? 0).toLocaleString('tr')}</span>
            <span className="text-[10px] text-[#555570]">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Avatar ──────────────────────────────────────────────────────
function Avatar({ username, avatar, frame, size = 36 }: {
  username: string; avatar: string | null; frame?: string | null; size?: number
}) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <div className="rounded-full overflow-hidden border border-[#1e1e2e] w-full h-full">
          <img src={avatar} alt={username} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="rounded-full bg-[#2a2a3e] border border-[#1e1e2e] flex items-center justify-center w-full h-full">
          <span className="font-bold text-[#9898b0]" style={{ fontSize: size * 0.35 }}>
            {username[0]?.toUpperCase()}
          </span>
        </div>
      )}
      {frame && (
        <img src={frame} alt="frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      )}
    </div>
  )
}

function Username({ username, isPremium }: { username: string; isPremium: boolean }) {
  if (isPremium) return (
    <span className="inline-flex items-center gap-1">
      <span className="text-sm font-bold text-[#EF9F27]">✦</span>
      <span className="text-sm font-bold"
        style={{ background: 'linear-gradient(90deg,#EF9F27,#F5BA45,#BA7517)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {username}
      </span>
    </span>
  )
  return <span className="text-sm font-bold text-white">{username}</span>
}

// ── Reply item ──────────────────────────────────────────────────
function ReplyItem({ reply, userId, onLike, onDislike }: {
  reply: Reply; userId: string
  onLike: (id: string) => void; onDislike: (id: string) => void
}) {
  return (
    <div className="flex gap-2.5">
      <Avatar username={reply.username} avatar={reply.avatar} frame={reply.frame} size={28} />
      <div className="flex-1 min-w-0">
        <Username username={reply.username} isPremium={reply.isPremium ?? false} />
        <span className="text-[10px] text-[#555570] ml-2">{timeAgo(reply.createdAt)}</span>
        <p className="text-sm text-[#d0d0e0] leading-relaxed mt-0.5">{reply.content}</p>
        <div className="flex gap-3 mt-1.5">
          <button onClick={() => onLike(reply.id)} className={cn('flex items-center gap-1 text-xs transition-colors', reply.likes.includes(userId) ? 'text-[#EF9F27]' : 'text-[#555570] hover:text-[#9898b0]')}>
            <ThumbsUp size={11} /> {reply.likes.length}
          </button>
          <button onClick={() => onDislike(reply.id)} className={cn('flex items-center gap-1 text-xs transition-colors', reply.dislikes.includes(userId) ? 'text-red-400' : 'text-[#555570] hover:text-[#9898b0]')}>
            <ThumbsDown size={11} /> {reply.dislikes.length}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Comment item ────────────────────────────────────────────────
function CommentItem({ comment, userId, onLike, onDislike, onReply, onReplyLike, onReplyDislike }: {
  comment: Comment; userId: string
  onLike: (id: string) => void; onDislike: (id: string) => void
  onReply: (id: string, text: string) => void
  onReplyLike: (cid: string, rid: string) => void
  onReplyDislike: (cid: string, rid: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [replyTxt, setReplyTxt] = useState('')
  const [expanded, setExpanded] = useState(false)

  const visReplies = expanded ? comment.replies : comment.replies.slice(0, 2)
  const extra = comment.replies.length - 2

  const submit = () => {
    if (!replyTxt.trim()) return
    onReply(comment.id, replyTxt.trim())
    setReplyTxt(''); setShowForm(false)
  }

  return (
    <div>
      <div className="flex gap-3">
        <Avatar username={comment.username} avatar={comment.avatar} frame={comment.frame} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Username username={comment.username} isPremium={comment.isPremium ?? false} />
            <span className="text-xs text-[#555570]">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-[#d0d0e0] leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => onLike(comment.id)} className={cn('flex items-center gap-1.5 text-xs transition-colors', comment.likes.includes(userId) ? 'text-[#EF9F27]' : 'text-[#555570] hover:text-[#9898b0]')}>
              <ThumbsUp size={13} /> {comment.likes.length}
            </button>
            <button onClick={() => onDislike(comment.id)} className={cn('flex items-center gap-1.5 text-xs transition-colors', comment.dislikes.includes(userId) ? 'text-red-400' : 'text-[#555570] hover:text-[#9898b0]')}>
              <ThumbsDown size={13} /> {comment.dislikes.length}
            </button>
            {userId && (
              <button onClick={() => setShowForm(f => !f)} className="text-xs text-[#555570] hover:text-[#9898b0] transition-colors flex items-center gap-1">
                ↩ Yanıtla
              </button>
            )}
          </div>
          {showForm && (
            <div className="mt-2.5 flex gap-2">
              <input value={replyTxt} onChange={e => setReplyTxt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Yanıtın..." autoFocus
                className="flex-1 bg-[#1a1a24] border border-[#1e1e2e] focus:border-[#EF9F27]/40 text-sm text-white rounded-xl px-3 py-2 outline-none placeholder-[#555570] transition-all" />
              <button onClick={submit} disabled={!replyTxt.trim()}
                className="bg-[#EF9F27] hover:bg-[#BA7517] disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                Gönder
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-[46px] mt-3 border-l-2 border-[#1e1e2e] pl-4 space-y-3">
          {visReplies.map(r => (
            <ReplyItem key={r.id} reply={r} userId={userId}
              onLike={id => onReplyLike(comment.id, id)}
              onDislike={id => onReplyDislike(comment.id, id)} />
          ))}
          {extra > 0 && (
            <button onClick={() => setExpanded(e => !e)} className="text-xs text-[#EF9F27] hover:text-[#BA7517] transition-colors">
              {expanded ? '▲ Yanıtları gizle' : `▼ ${extra} yanıt daha`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Comments block ──────────────────────────────────────────────
function CommentsBlock({ seriesId, slug, userId, userAvatar, userFrame, userPremium, username }: {
  seriesId: string; slug: string; userId: string | null
  userAvatar: string | null; userFrame: string | null; userPremium: boolean; username: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText]         = useState('')
  const [sort, setSort]         = useState<SortMode>('newest')
  const [loading, setLoading]   = useState(true)

  const fetchComments = async () => {
    const { data: rows } = await supabase
      .from('comments')
      .select('*, replies(*)')
      .eq('series_id', seriesId)
      .order('created_at', { ascending: false })

    const mapped: Comment[] = (rows ?? []).map((c: Record<string, unknown>) => ({
      id:        c.id as string,
      username:  (c.username as string) ?? '',
      avatar:    (c.avatar_url as string) ?? null,
      frame:     (c.frame_url as string) ?? null,
      isPremium: (c.is_premium as boolean) ?? false,
      content:   c.content as string,
      likes:     (c.likes as string[]) ?? [],
      dislikes:  (c.dislikes as string[]) ?? [],
      createdAt: c.created_at as string,
      replies:   ((c.replies as Record<string, unknown>[]) ?? []).map((r: Record<string, unknown>) => ({
        id:        r.id as string,
        username:  (r.username as string) ?? '',
        avatar:    (r.avatar_url as string) ?? null,
        frame:     (r.frame_url as string) ?? null,
        isPremium: (r.is_premium as boolean) ?? false,
        content:   r.content as string,
        likes:     (r.likes as string[]) ?? [],
        dislikes:  (r.dislikes as string[]) ?? [],
        createdAt: r.created_at as string,
      })),
    }))
    setComments(mapped)
    setLoading(false)
  }

  useEffect(() => { if (seriesId) fetchComments() }, [seriesId])

  const submit = async () => {
    if (!userId || !text.trim()) return
    await supabase.from('comments').insert({
      user_id: userId, series_id: seriesId,
      content: text.trim(),
      username, avatar_url: userAvatar, frame_url: userFrame, is_premium: userPremium,
    })
    setText('')
    fetchComments()
  }

  const toggleLike = async (cid: string) => {
    if (!userId) { window.location.href = '/login'; return }
    const c = comments.find(x => x.id === cid)
    if (!c) return
    const liked = c.likes.includes(userId)
    const newLikes    = liked ? c.likes.filter(e => e !== userId) : [...c.likes, userId]
    const newDislikes = c.dislikes.filter(e => e !== userId)
    await supabase.from('comments').update({ likes: newLikes, dislikes: newDislikes }).eq('id', cid)
    setComments(prev => prev.map(x => x.id === cid ? { ...x, likes: newLikes, dislikes: newDislikes } : x))
  }

  const toggleDislike = async (cid: string) => {
    if (!userId) { window.location.href = '/login'; return }
    const c = comments.find(x => x.id === cid)
    if (!c) return
    const dised = c.dislikes.includes(userId)
    const newDislikes = dised ? c.dislikes.filter(e => e !== userId) : [...c.dislikes, userId]
    const newLikes    = c.likes.filter(e => e !== userId)
    await supabase.from('comments').update({ likes: newLikes, dislikes: newDislikes }).eq('id', cid)
    setComments(prev => prev.map(x => x.id === cid ? { ...x, likes: newLikes, dislikes: newDislikes } : x))
  }

  const addReply = async (cid: string, content: string) => {
    if (!userId) return
    await supabase.from('replies').insert({
      comment_id: cid, user_id: userId,
      content, username, avatar_url: userAvatar, frame_url: userFrame, is_premium: userPremium,
    })
    fetchComments()
  }

  const replyLike = async (cid: string, rid: string) => {
    if (!userId) { window.location.href = '/login'; return }
    const comment = comments.find(c => c.id === cid)
    const reply   = comment?.replies.find(r => r.id === rid)
    if (!reply) return
    const liked   = reply.likes.includes(userId)
    const newLikes    = liked ? reply.likes.filter(e => e !== userId) : [...reply.likes, userId]
    const newDislikes = reply.dislikes.filter(e => e !== userId)
    await supabase.from('replies').update({ likes: newLikes, dislikes: newDislikes }).eq('id', rid)
    setComments(prev => prev.map(c => c.id !== cid ? c : { ...c, replies: c.replies.map(r => r.id === rid ? { ...r, likes: newLikes, dislikes: newDislikes } : r) }))
  }

  const replyDislike = async (cid: string, rid: string) => {
    if (!userId) { window.location.href = '/login'; return }
    const comment = comments.find(c => c.id === cid)
    const reply   = comment?.replies.find(r => r.id === rid)
    if (!reply) return
    const dised   = reply.dislikes.includes(userId)
    const newDislikes = dised ? reply.dislikes.filter(e => e !== userId) : [...reply.dislikes, userId]
    const newLikes    = reply.likes.filter(e => e !== userId)
    await supabase.from('replies').update({ likes: newLikes, dislikes: newDislikes }).eq('id', rid)
    setComments(prev => prev.map(c => c.id !== cid ? c : { ...c, replies: c.replies.map(r => r.id === rid ? { ...r, likes: newLikes, dislikes: newDislikes } : r) }))
  }

  const sorted = [...comments].sort((a, b) => {
    if (sort === 'best')   return (b.likes.length - b.dislikes.length) - (a.likes.length - a.dislikes.length)
    if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt)
    return b.createdAt.localeCompare(a.createdAt)
  })

  return (
    <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 mt-4 mb-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageCircle size={17} className="text-[#EF9F27]" />
          {comments.length} Yorum
        </h3>
        <div className="flex gap-1">
          {([['best','En İyi'],['newest','En Yeni'],['oldest','En Eski']] as [SortMode, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)}
              className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                sort === k ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]' : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30 hover:text-[#9898b0]'
              )}>{l}</button>
          ))}
        </div>
      </div>

      {userId ? (
        <div className="flex gap-3 mb-6">
          <Avatar username={username} avatar={userAvatar} />
          <div className="flex-1">
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Yorum yaz..." rows={3}
              className="w-full bg-[#1a1a24] border border-[#1e1e2e] focus:border-[#EF9F27]/40 text-sm text-white rounded-xl px-4 py-3 outline-none placeholder-[#555570] transition-all resize-none" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-[#555570]">{text.length}/2000</span>
              <button onClick={submit} disabled={!text.trim() || text.length > 2000}
                className="flex items-center gap-1.5 bg-[#EF9F27] hover:bg-[#BA7517] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                <Send size={12} /> Gönder
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 mb-5 bg-[#1a1a24] rounded-2xl border border-[#1e1e2e]">
          <p className="text-sm text-[#555570] mb-3">Yorum yazmak için giriş yapın</p>
          <Link href="/login" className="text-xs bg-[#EF9F27] hover:bg-[#BA7517] text-white font-semibold px-4 py-2 rounded-xl transition-all">
            Giriş Yap
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-[#555570] py-8">Yorumlar yükleniyor...</p>
      ) : (
        <div className="space-y-0">
          {sorted.map((c, i) => (
            <div key={c.id}>
              <CommentItem comment={c} userId={userId ?? ''} onLike={toggleLike} onDislike={toggleDislike}
                onReply={addReply} onReplyLike={replyLike} onReplyDislike={replyDislike} />
              {i < sorted.length - 1 && <div className="my-5 border-b border-[#1e1e2e]" />}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-[#555570] py-8">Henüz yorum yok. İlk yorumu sen yaz!</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────
export default function SeriesClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: paramSlug } = use(params)
  const slug = (typeof window !== 'undefined' && paramSlug === '_')
    ? window.location.pathname.split('/').filter(Boolean)[1] ?? paramSlug
    : paramSlug
  const { user, toggleBookmark, isBookmarked } = useAuth()

  const [series,        setSeries]       = useState<Series | null>(null)
  const [chapters,      setChapters]     = useState<AdminChapter[]>([])
  const [search,        setSearch]       = useState('')
  const [sortDesc,      setSortDesc]     = useState(true)
  const [showAllCh,     setShowAllCh]    = useState(false)
  const [descOpen,      setDescOpen]     = useState(false)
  const [showRating,    setShowRating]   = useState(false)
  const [displayRating, setDisplayRating] = useState(0)
  const [userRating,    setUserRating]   = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)

  useEffect(() => {
    getAllSeries().then(all => {
      const found = all.find(s => s.slug === slug)
      if (!found) return
      setSeries(found)
      setDisplayRating(found.rating)
      setBookmarkCount(found.bookmark_count)
      getAdminChapters(slug).then(chs => setChapters(chs.sort((a, b) => b.num - a.num)))
    })
  }, [slug])

  // Kullanıcının mevcut puanını yükle
  useEffect(() => {
    if (!user || !series) return
    supabase.from('ratings').select('rating').eq('user_id', user.id).eq('series_id', series.id).maybeSingle()
      .then(({ data }) => { if (data) setUserRating(Number(data.rating)) })
  }, [user?.id, series?.id])

  const bookmarked = isBookmarked(slug)

  const filtered  = chapters
    .filter(c => search ? String(c.num).includes(search) || c.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => sortDesc ? b.num - a.num : a.num - b.num)
  const displayed = showAllCh ? filtered : filtered.slice(0, 30)

  if (!series) return (
    <main className="min-h-screen pt-24 flex items-center justify-center">
      <p className="text-[#555570]">Seri bulunamadı.</p>
    </main>
  )

  const STATUS_DOT: Record<string, string> = { ongoing:'bg-green-400', completed:'bg-[#EF9F27]', hiatus:'bg-yellow-400', cancelled:'bg-red-400' }
  const STATUS_TXT: Record<string, string> = { ongoing:'text-green-400', completed:'text-[#EF9F27]', hiatus:'text-yellow-400', cancelled:'text-red-400' }
  const first = chapters[chapters.length - 1] ?? null
  const last  = chapters[0] ?? null

  return (
    <main className="pt-20 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-8">

          {/* SOL SÜTUN */}
          <div className="flex-shrink-0 w-full lg:w-[240px] xl:w-[260px] flex flex-col items-center lg:items-stretch gap-2">
            <div className="w-[192px] lg:w-full rounded-2xl overflow-hidden border border-[#EF9F27]/30 shadow-2xl shadow-black/60">
              {series.cover_url && <img src={series.cover_url} alt={series.title} className="w-full aspect-[3/4] object-cover" />}
            </div>

            <div className="relative w-[192px] lg:w-full">
              <button onClick={() => { if (!user) { window.location.href = '/login'; return } setShowRating(r => !r) }}
                className="w-full flex items-center justify-center gap-2 bg-[#13131c] border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#EF9F27] text-sm font-semibold py-2.5 rounded-xl transition-all">
                <i className="fi fi-sr-star leading-none text-base" /> Değerlendir
              </button>
              {showRating && user && series && (
                <RatingPopup
                  seriesId={series.id}
                  userId={user.id}
                  currentRating={userRating}
                  onClose={() => setShowRating(false)}
                  onSaved={avg => { setDisplayRating(avg); setShowRating(false) }} />
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 w-[192px] lg:w-full">
              {[
                { val: displayRating > 0 ? displayRating.toFixed(1) : '—', cls:'text-yellow-400', lbl:'Puan' },
                { val: String(series.chapter_count ?? chapters.length), cls:'text-[#EF9F27]', lbl:'Bölüm' },
                { val: formatNumber(bookmarkCount), cls:'text-[#9898b0]', lbl:'Listede' },
              ].map(s => (
                <div key={s.lbl} className="bg-[#13131c] border border-[#1e1e2e] rounded-xl py-2.5 text-center">
                  <p className={cn('text-sm font-bold', s.cls)}>{s.val}</p>
                  <p className="text-[10px] text-[#555570] mt-0.5">{s.lbl}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5 w-[192px] lg:w-full">
              <div className="bg-[#13131c] border border-[#1e1e2e] rounded-xl px-2.5 py-2.5">
                <p className="text-[9px] text-[#555570] uppercase tracking-wide mb-1">Durum</p>
                <div className="flex items-center gap-1">
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[series.status])} />
                  <p className={cn('text-[10px] font-semibold leading-tight', STATUS_TXT[series.status])}>{STATUS_LABELS[series.status]}</p>
                </div>
              </div>
              <div className="bg-[#13131c] border border-[#1e1e2e] rounded-xl px-2.5 py-2.5">
                <p className="text-[9px] text-[#555570] uppercase tracking-wide mb-1">Yazar</p>
                <p className="text-[10px] font-semibold text-[#9898b0] leading-tight truncate">{series.author || '—'}</p>
              </div>
            </div>

            {series.genre_names && series.genre_names.length > 0 && (
              <div className="flex flex-wrap gap-1.5 w-[192px] lg:w-full">
                {series.genre_names.map(g => (
                  <span key={g} className="text-[10px] bg-[#1a1a24] border border-[#1e1e2e] text-[#9898b0] px-2 py-1 rounded-lg">{g}</span>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ SÜTUN */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">{series.title}</h1>

            {series.description && (
              <div className="mb-5">
                <p className={cn('text-sm text-[#9898b0] leading-relaxed', !descOpen && 'line-clamp-3')}>
                  {series.description}
                </p>
                <button onClick={() => setDescOpen(o => !o)}
                  className="text-xs text-[#EF9F27] hover:text-[#BA7517] mt-1.5 transition-colors">
                  {descOpen ? 'Daha az göster ▲' : 'Daha fazla göster ▼'}
                </button>
              </div>
            )}

            <div className="flex gap-2 flex-wrap mb-6">
              <button onClick={() => toggleBookmark(slug)}
                className={cn('flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border transition-all',
                  bookmarked ? 'bg-[#EF9F27]/15 border-[#EF9F27]/40 text-[#EF9F27]' : 'bg-[#13131c] border-[#1e1e2e] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-white'
                )}>
                <i className="fi fi-rr-bookmark leading-none text-base" />
                {bookmarked ? 'Listemde' : 'Listeme Ekle'}
              </button>
              {first && (
                <Link href={`/seri/${slug}/bolum/${first.num}`}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#13131c] border border-[#1e1e2e] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-white transition-all">
                  <i className="fi fi-rr-book-alt leading-none text-base" /> İlk Bölüm
                </Link>
              )}
              {last && (
                <Link href={`/seri/${slug}/bolum/${last.num}`}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#13131c] border border-[#1e1e2e] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-white transition-all">
                  <i className="fi fi-rr-book-alt leading-none text-base" /> Son Bölüm
                </Link>
              )}
            </div>

            <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-book-alt text-[#EF9F27] leading-none" />
                  <h2 className="text-base font-bold text-white">{series.chapter_count ?? chapters.length} Bölüm</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#1a1a24] border border-[#1e1e2e] focus-within:border-[#EF9F27]/40 rounded-xl px-3 py-2 transition-all">
                    <Search size={13} className="text-[#555570]" />
                    <input type="text" placeholder="Bölüm ara..." value={search} onChange={e => setSearch(e.target.value)}
                      className="bg-transparent text-sm text-white outline-none w-24 placeholder-[#555570]" />
                  </div>
                  <button onClick={() => setSortDesc(d => !d)}
                    className="flex items-center gap-1.5 text-xs text-[#9898b0] hover:text-white bg-[#1a1a24] border border-[#1e1e2e] hover:border-[#EF9F27]/40 px-3 py-2 rounded-xl transition-all whitespace-nowrap">
                    <ChevronDown size={13} className={cn('transition-transform', !sortDesc && 'rotate-180')} />
                    {sortDesc ? 'En Yeni' : 'En Eski'}
                  </button>
                </div>
              </div>

              <div className="max-h-[480px] overflow-y-auto">
                {chapters.length === 0 ? (
                  <p className="px-5 py-12 text-center text-[#555570] text-sm">Henüz bölüm eklenmemiş.</p>
                ) : (
                  <>
                    {displayed.map(ch => (
                      <Link key={ch.num} href={`/seri/${slug}/bolum/${ch.num}`}
                        className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors group">
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#EF9F27] transition-colors">Bölüm {ch.num}</p>
                          {ch.title && <p className="text-xs text-[#555570] mt-0.5">{ch.title}</p>}
                        </div>
                        <span className="text-xs text-[#555570] flex items-center gap-1 ml-4 whitespace-nowrap">
                          <Clock size={11} /> {timeAgo(ch.createdAt)}
                        </span>
                      </Link>
                    ))}
                    {!showAllCh && filtered.length > 30 && (
                      <button onClick={() => setShowAllCh(true)}
                        className="w-full py-3.5 text-sm text-[#EF9F27] hover:bg-[#1a1a24] transition-colors">
                        Tümünü Göster ({filtered.length} bölüm) →
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <ReactionsBlock slug={slug} userId={user?.id ?? null} />
        {series && (
          <CommentsBlock
            seriesId={series.id}
            slug={slug}
            userId={user?.id ?? null}
            userAvatar={user?.avatar ?? null}
            userFrame={user?.equippedFrame ?? null}
            userPremium={user?.isPremium ?? false}
            username={user?.username ?? ''}
          />
        )}
      </div>
    </main>
  )
}
