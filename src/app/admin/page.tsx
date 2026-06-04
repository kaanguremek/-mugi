'use client'
import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Megaphone, Users, X, Check, Eye, Trash2, Gift, LogIn } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getVipLevel } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { GENRES } from '@/lib/mock-data'

const ADMIN_PASSWORD = 'imugi2026'
type Tab = 'seriler' | 'bolumler' | 'duyurular' | 'kullanicilar'

interface AdminSeries {
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
}
interface AdminChapter {
  id: string
  num: number
  title: string
  pages: string[]
  createdAt: string
}
interface AdminUser {
  id: string
  username: string
  email?: string
  avatar_url?: string
  vip_points: number
  shop_balance: number
  is_premium: boolean
  is_admin: boolean
  created_at: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#9898b0] uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const inputCls = 'w-full bg-[#1a1a24] border border-[#1e1e2e] text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[#EF9F27]/50 placeholder-[#555570] transition-all'

export default function AdminPage() {
  const { user, ready } = useAuth()
  const [authed, setAuthed] = useState(false)
  const [pw,     setPw]     = useState('')
  const [pwErr,  setPwErr]  = useState('')
  const [tab,    setTab]    = useState<Tab>('seriler')

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwErr('') }
    else setPwErr('Yanlış şifre.')
  }

  if (!ready) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <p className="text-[#555570] text-sm">Yükleniyor...</p>
    </main>
  )

  if (!user) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-white mb-4">Admin Paneli</h1>
        <p className="text-sm text-[#9898b0] mb-4">Giriş yapmanız gerekiyor.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
          <LogIn size={14} /> Giriş Yap
        </Link>
      </div>
    </main>
  )

  if (!user.isAdmin) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-white mb-4">Admin Paneli</h1>
        <p className="text-sm text-red-400">Bu hesabın admin yetkisi yok.</p>
        <p className="text-xs text-[#555570] mt-2">Kullanıcı adın: <span className="text-white">{user.username}</span></p>
      </div>
    </main>
  )

  if (!authed) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-6 text-center">Admin Paneli</h1>
        <input type="password" placeholder="Admin şifresi" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          className={inputCls} />
        {pwErr && <p className="text-xs text-red-400 mt-2">{pwErr}</p>}
        <button onClick={tryLogin}
          className="w-full mt-4 py-2.5 bg-[#EF9F27] hover:bg-[#BA7517] text-white font-semibold rounded-xl transition-all text-sm">
          Giriş
        </button>
      </div>
    </main>
  )

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key:'seriler',      label:'Seriler',      icon: BookOpen  },
    { key:'bolumler',     label:'Bölüm Ekle',   icon: Plus      },
    { key:'duyurular',   label:'Duyurular',    icon: Megaphone },
    { key:'kullanicilar', label:'Kullanıcılar', icon: Users     },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-6 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                tab === key
                  ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                  : 'border-[#1e1e2e] bg-[#13131c] text-[#9898b0] hover:border-[#EF9F27]/30'
              )}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'seriler'      && <SerilerTab />}
        {tab === 'bolumler'     && <BolumlerTab />}
        {tab === 'duyurular'    && <DuyurularTab />}
        {tab === 'kullanicilar' && <KullanicilarTab />}
      </div>
    </main>
  )
}

/* ══ SERİLER TAB ══════════════════════════════════ */
function SerilerTab() {
  const [series,    setSeries]    = useState<AdminSeries[]>([])
  const [loading,   setLoading]   = useState(true)
  const [form,      setForm]      = useState({
    title:'', slug:'', description:'', coverUrl:'', author:'',
    status: 'ongoing' as AdminSeries['status'], genres:[] as string[],
  })
  const [saved,     setSaved]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editId,    setEditId]    = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('series').select('*').order('created_at', { ascending: false })
    setSeries((data ?? []).map((s: Record<string, unknown>) => ({
      id:           s.id as string,
      slug:         s.slug as string,
      title:        s.title as string,
      description:  (s.description as string) ?? '',
      coverUrl:     (s.cover_url as string) ?? '',
      status:       (s.status as AdminSeries['status']) ?? 'ongoing',
      genres:       (s.genres as string[]) ?? [],
      author:       (s.author as string) ?? '',
      createdAt:    s.created_at as string,
      chapterCount: (s.chapter_count as number) ?? 0,
    })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const toggleGenre = (g: string) =>
    set('genres', form.genres.includes(g) ? form.genres.filter(x => x !== g) : [...form.genres, g])

  const slugify = (t: string) => t.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `covers/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('covers').getPublicUrl(path)
      set('coverUrl', data.publicUrl)
    } catch {
      // Fallback: base64
      const reader = new FileReader()
      reader.onload = () => set('coverUrl', reader.result as string)
      reader.readAsDataURL(file)
    }
    setUploading(false)
  }

  const handleAdd = async () => {
    if (!form.title || !form.coverUrl) return
    const slug = form.slug || slugify(form.title)
    const { error } = await supabase.from('series').insert({
      slug, title: form.title, description: form.description,
      cover_url: form.coverUrl, author: form.author,
      status: form.status, genres: form.genres,
    })
    if (error) { alert(error.message); return }
    setForm({ title:'', slug:'', description:'', coverUrl:'', author:'', status:'ongoing', genres:[] })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    load()
  }

  const handleUpdate = async () => {
    if (!editId || !form.title || !form.coverUrl) return
    const { error } = await supabase.from('series').update({
      title: form.title, description: form.description,
      cover_url: form.coverUrl, author: form.author,
      status: form.status, genres: form.genres,
    }).eq('id', editId)
    if (error) { alert(error.message); return }
    setForm({ title:'', slug:'', description:'', coverUrl:'', author:'', status:'ongoing', genres:[] })
    setEditId(null)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    load()
  }

  const handleEdit = (s: AdminSeries) => {
    setForm({ title: s.title, slug: s.slug, description: s.description, coverUrl: s.coverUrl, author: s.author, status: s.status, genres: s.genres })
    setEditId(s.id)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('series').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-8">
      <div ref={formRef} className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-white">{editId ? 'Seri Düzenle' : 'Yeni Seri Ekle'}</h2>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ title:'', slug:'', description:'', coverUrl:'', author:'', status:'ongoing', genres:[] }) }}
              className="text-xs text-[#555570] hover:text-red-400 transition-colors">× İptal</button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Seri Adı *">
            <input value={form.title} onChange={e => { set('title', e.target.value); if (!editId) set('slug', slugify(e.target.value)) }}
              placeholder="Solo Leveling" className={inputCls} />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              placeholder="solo-leveling" className={cn(inputCls, editId && 'opacity-50 cursor-not-allowed')} disabled={!!editId} />
          </Field>
          <Field label="Yazar">
            <input value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="Chugong" className={inputCls} />
          </Field>
        </div>

        <Field label="Kapak Görseli *">
          <div className="flex items-start gap-4">
            <div onClick={() => fileRef.current?.click()}
              className="w-28 flex-shrink-0 rounded-xl overflow-hidden bg-[#1a1a24] border-2 border-dashed border-[#1e1e2e] hover:border-[#EF9F27]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
              style={{ height: 160 }}>
              {form.coverUrl ? (
                <img src={form.coverUrl} alt="kapak" className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg className="w-6 h-6 text-[#555570] group-hover:text-[#EF9F27] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] text-[#555570] group-hover:text-[#EF9F27] transition-colors text-center px-1">
                    {uploading ? 'Yükleniyor...' : 'Tıkla\nya da sürükle'}
                  </p>
                </>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm bg-[#1a1a24] hover:bg-[#EF9F27]/10 border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-[#EF9F27] px-4 py-2.5 rounded-xl transition-all w-full justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? 'Yükleniyor...' : 'Bilgisayardan Seç (Supabase Storage)'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <p className="text-[10px] text-[#555570] leading-relaxed">PNG, JPG, WEBP. Supabase Storage'a yüklenir.</p>
              <div>
                <p className="text-[10px] text-[#555570] mb-1">Ya da URL ile:</p>
                <input value={form.coverUrl.startsWith('data:') ? '' : form.coverUrl}
                  onChange={e => set('coverUrl', e.target.value)}
                  placeholder="https://..." className={cn(inputCls, 'text-xs py-2')} />
              </div>
              {form.coverUrl && (
                <button onClick={() => set('coverUrl', '')} className="text-[10px] text-red-400 hover:text-red-300 transition-colors">
                  × Görseli kaldır
                </button>
              )}
            </div>
          </div>
        </Field>

        <Field label="Açıklama / Konu">
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3} placeholder="Seri hakkında kısa bir açıklama..."
            className={cn(inputCls, 'resize-none')} />
        </Field>

        <Field label="Durum">
          <div className="flex gap-2">
            {(['ongoing','completed','hiatus'] as const).map(s => (
              <button key={s} onClick={() => set('status', s)}
                className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                  form.status === s ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]' : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30'
                )}>
                {s === 'ongoing' ? 'Devam Ediyor' : s === 'completed' ? 'Tamamlandı' : 'Ara Verildi'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Kategoriler">
          <div className="flex gap-1.5 flex-wrap">
            {GENRES.map(g => (
              <button key={g} onClick={() => toggleGenre(g)}
                className={cn('text-xs px-2.5 py-1 rounded-lg border transition-all',
                  form.genres.includes(g) ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]' : 'border-[#1e1e2e] text-[#555570] hover:border-[#EF9F27]/30'
                )}>
                {g}
              </button>
            ))}
          </div>
        </Field>

        <button onClick={editId ? handleUpdate : handleAdd}
          className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
            saved ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-[#EF9F27] hover:bg-[#BA7517] text-white'
          )}>
          {saved ? <><Check size={15} /> {editId ? 'Güncellendi!' : 'Eklendi!'}</> : editId ? <><Check size={15} /> Güncelle</> : <><Plus size={15} /> Seri Ekle</>}
        </button>
      </div>

      {!loading && series.length > 0 && (
        <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e1e2e]">
            <h2 className="text-sm font-bold text-white">Eklenmiş Seriler ({series.length})</h2>
          </div>
          {series.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#2a2a3e] flex-shrink-0">
                {s.coverUrl && <img src={s.coverUrl} alt={s.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-xs text-[#555570]">{s.slug} · {s.genres.slice(0,2).join(', ')}</p>
                <p className="text-xs text-[#555570]">{s.chapterCount} bölüm</p>
              </div>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                s.status === 'ongoing' ? 'text-green-400 bg-green-400/10' :
                s.status === 'completed' ? 'text-[#EF9F27] bg-[#EF9F27]/10' : 'text-yellow-400 bg-yellow-400/10'
              )}>
                {s.status === 'ongoing' ? 'Devam' : s.status === 'completed' ? 'Bitti' : 'Ara'}
              </span>
              <button onClick={() => handleEdit(s)} className="text-[#555570] hover:text-[#EF9F27] transition-colors">
                <i className="fi fi-rr-pencil text-sm leading-none" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="text-[#555570] hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══ BÖLÜMLER TAB ══════════════════════════════════ */
function BolumlerTab() {
  const [series,       setSeries]      = useState<AdminSeries[]>([])
  const [selected,     setSelected]    = useState<AdminSeries | null>(null)
  const [chapters,     setChapters]    = useState<AdminChapter[]>([])
  const [chNum,        setChNum]       = useState('')
  const [pages,        setPages]       = useState<string[]>([])
  const [urlInput,     setUrlInput]    = useState('')
  const [saved,        setSaved]       = useState(false)
  const [uploadingPgs, setUploadingPgs] = useState(false)
  const chFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('series').select('id, slug, title, cover_url, chapter_count').order('created_at', { ascending: false })
      .then(({ data }) => setSeries((data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string, slug: s.slug as string, title: s.title as string,
        coverUrl: (s.cover_url as string) ?? '', chapterCount: (s.chapter_count as number) ?? 0,
        description: '', status: 'ongoing', genres: [], author: '', createdAt: '',
      }))))
  }, [])

  const selectSeries = async (s: AdminSeries) => {
    setSelected(s)
    const { data } = await supabase.from('chapters').select('*').eq('series_id', s.id).order('num', { ascending: false })
    setChapters((data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string, num: Number(c.num), title: (c.title as string) ?? '',
      pages: (c.pages as string[]) ?? [], createdAt: c.created_at as string,
    })))
  }

  const handleChFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingPgs(true)
    const urls: string[] = []
    for (const file of files) {
      try {
        const path = `chapters/${selected!.slug}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage.from('chapters').upload(path, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('chapters').getPublicUrl(path)
        urls.push(data.publicUrl)
      } catch {
        // Fallback: base64
        await new Promise<void>(resolve => {
          const reader = new FileReader()
          reader.onload = () => { urls.push(reader.result as string); resolve() }
          reader.readAsDataURL(file)
        })
      }
    }
    setPages(prev => [...prev, ...urls])
    setUploadingPgs(false)
    if (chFileRef.current) chFileRef.current.value = ''
  }

  const addUrls = () => {
    const newUrls = urlInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (!newUrls.length) return
    setPages(prev => [...prev, ...newUrls])
    setUrlInput('')
  }

  const removePage = (idx: number) => setPages(p => p.filter((_, i) => i !== idx))

  const addChapter = async () => {
    if (!selected || !chNum || pages.length === 0) return
    const num = parseFloat(chNum)
    const { error } = await supabase.from('chapters').upsert({
      series_id: selected.id, num, title: '', pages,
    }, { onConflict: 'series_id,num' })
    if (error) { alert(error.message); return }

    // Bookmarks → bildirim gönder
    const { data: bookmarkRows } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('series_id', selected.id)
    if (bookmarkRows && bookmarkRows.length > 0) {
      const notifs = bookmarkRows.map((b: Record<string, unknown>) => ({
        user_id: b.user_id as string,
        type: 'new_chapter',
        title: `📖 ${selected.title} — Bölüm ${num}`,
        body: `Listenizde bulunan "${selected.title}" serisinin ${num}. bölümü yüklendi!`,
        link: `/seri/${selected.slug}`,
      }))
      await supabase.from('notifications').insert(notifs)
    }

    setChNum(''); setPages([]); setUrlInput('')
    setSaved(true); setTimeout(() => setSaved(false), 2500)
    selectSeries(selected)
  }

  const deleteChapter = async (id: string) => {
    await supabase.from('chapters').delete().eq('id', id)
    if (selected) selectSeries(selected)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">Seri Seç</h2>
        {series.length === 0 ? (
          <p className="text-sm text-[#555570]">Önce "Seriler" sekmesinden seri eklemelisiniz.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {series.map(s => (
              <button key={s.id} onClick={() => selectSeries(s)}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all',
                  selected?.id === s.id
                    ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                    : 'border-[#1e1e2e] bg-[#1a1a24] text-[#9898b0] hover:border-[#EF9F27]/30'
                )}>
                {s.coverUrl && <div className="w-6 h-8 rounded overflow-hidden flex-shrink-0"><img src={s.coverUrl} alt={s.title} className="w-full h-full object-cover" /></div>}
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-white">
              <span className="text-[#EF9F27]">{selected.title}</span> — Yeni Bölüm
            </h2>

            <Field label="Bölüm Numarası *">
              <input type="number" value={chNum} onChange={e => setChNum(e.target.value)}
                placeholder="1" className={cn(inputCls, 'w-48')} />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#9898b0] uppercase tracking-wide">Sayfa Görselleri</label>
                <span className="text-xs text-[#555570]">{pages.length} sayfa eklendi</span>
              </div>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => chFileRef.current?.click()} disabled={uploadingPgs}
                  className="flex items-center gap-2 text-sm bg-[#1a1a24] hover:bg-[#EF9F27]/10 border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-[#EF9F27] px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 flex-1 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {uploadingPgs ? 'Yükleniyor...' : 'Bilgisayardan Seç (Supabase Storage)'}
                </button>
                <input ref={chFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChFileUpload} />
              </div>
              <p className="text-[10px] text-[#555570] mb-2">Ya da CDN URL'si yapıştır (ImgBB, Cloudinary vb.):</p>
              <textarea value={urlInput} onChange={e => setUrlInput(e.target.value)} rows={3}
                placeholder={'https://cdn.example.com/bolum1/sayfa1.jpg\nhttps://cdn.example.com/bolum1/sayfa2.jpg\n...'}
                className={cn(inputCls, 'resize-none font-mono text-xs')} />
              <button onClick={addUrls} disabled={!urlInput.trim()}
                className="mt-2 flex items-center gap-1.5 text-xs bg-[#1a1a24] hover:bg-[#EF9F27]/10 border border-[#1e1e2e] hover:border-[#EF9F27]/40 text-[#9898b0] hover:text-[#EF9F27] px-3 py-2 rounded-xl transition-all disabled:opacity-40">
                <Plus size={12} /> URL'leri Ekle
              </button>
              {pages.length > 0 && (
                <div className="mt-3 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                  {pages.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-[10px] text-[#555570] w-6 flex-shrink-0">{i+1}.</span>
                      <span className="text-[11px] text-[#9898b0] truncate flex-1 font-mono">{p.startsWith('data:') ? '[base64 görsel]' : p}</span>
                      <button onClick={() => removePage(i)} className="text-[#555570] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={addChapter} disabled={!chNum || pages.length === 0}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40',
                saved ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-[#EF9F27] hover:bg-[#BA7517] text-white'
              )}>
              {saved ? <><Check size={15} /> Eklendi + Bildirim Gönderildi!</> : <><Plus size={15} /> Bölüm Ekle</>}
            </button>
          </div>

          {chapters.length > 0 && (
            <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1e1e2e]">
                <p className="text-sm font-bold text-white">{chapters.length} bölüm</p>
              </div>
              {chapters.map(ch => (
                <div key={ch.id} className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">Bölüm {ch.num}</p>
                    <p className="text-xs text-[#555570]">{ch.pages.length} sayfa · {new Date(ch.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#555570] flex items-center gap-1"><Eye size={11} /> {ch.pages.length}</span>
                    <button onClick={() => deleteChapter(ch.id)} className="text-[#555570] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ══ DUYURULAR TAB ════════════════════════════════ */
function DuyurularTab() {
  const [title, setTitle] = useState('')
  const [body,  setBody]  = useState('')
  const [sent,  setSent]  = useState(false)
  const [link,  setLink]  = useState('')

  const send = async () => {
    if (!title || !body) return
    const { data: profiles } = await supabase.from('profiles').select('id')
    if (!profiles || profiles.length === 0) { setSent(true); setTimeout(() => setSent(false), 2500); return }
    const notifs = profiles.map((p: Record<string, unknown>) => ({
      user_id: p.id as string,
      type: 'announcement',
      title: '📢 ' + title,
      body,
      link: link || null,
    }))
    await supabase.from('notifications').insert(notifs)
    setTitle(''); setBody(''); setLink('')
    setSent(true); setTimeout(() => setSent(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Yeni Duyuru</h2>
        <Field label="Başlık">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Duyuru başlığı..." className={inputCls} />
        </Field>
        <Field label="İçerik">
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Duyuru metni..." className={cn(inputCls, 'resize-none')} />
        </Field>
        <Field label="Link (isteğe bağlı)">
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="/seri/solo-leveling" className={inputCls} />
        </Field>
        <div className="flex items-center gap-3">
          <button onClick={send}
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
              sent ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-[#EF9F27] hover:bg-[#BA7517] text-white'
            )}>
            {sent ? <><Check size={15} /> Gönderildi!</> : <><Megaphone size={15} /> Tüm Kullanıcılara Gönder</>}
          </button>
          <p className="text-xs text-[#555570]">Tüm kayıtlı hesaplara bildirim olarak gönderilir.</p>
        </div>
      </div>
    </div>
  )
}

/* ══ KULLANICILAR TAB ═════════════════════════════ */
function KullanicilarTab() {
  const [search,   setSearch]   = useState('')
  const [users,    setUsers]    = useState<AdminUser[]>([])
  const [points,   setPoints]   = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers((data ?? []) as AdminUser[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = search.trim()
    ? users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const addVip = async (id: string) => {
    const amount = parseInt(points[id] || '0')
    if (!amount) return
    const target = users.find(u => u.id === id)
    if (!target) return
    const { error } = await supabase.from('profiles').update({
      vip_points:   (target.vip_points ?? 0) + amount,
      shop_balance: (target.shop_balance ?? 0) + amount,
    }).eq('id', id)
    if (error) return
    await supabase.from('notifications').insert({
      user_id: id,
      type: 'announcement',
      title: '🎁 VIP Puanı Eklendi!',
      body: `Hesabınıza admin tarafından ${amount} VIP puanı eklendi.`,
    })
    setPoints(p => ({ ...p, [id]: '' }))
    setFeedback(f => ({ ...f, [id]: `+${amount} eklendi ✓` }))
    setTimeout(() => setFeedback(f => ({ ...f, [id]: '' })), 2500)
    load()
  }

  const togglePremium = async (id: string) => {
    const target = users.find(u => u.id === id)
    if (!target) return
    const nowPremium = !target.is_premium
    await supabase.from('profiles').update({
      is_premium:   nowPremium,
      vip_points:   nowPremium ? (target.vip_points ?? 0) + 500 : (target.vip_points ?? 0),
      shop_balance: nowPremium ? (target.shop_balance ?? 0) + 500 : (target.shop_balance ?? 0),
    }).eq('id', id)
    if (nowPremium) {
      await supabase.from('notifications').insert({
        user_id: id, type: 'announcement',
        title: '⭐ Premium Üyelik Aktif!',
        body: 'Hesabınıza premium üyelik tanımlandı. +500 VIP puanı hediye edildi.',
      })
    }
    setFeedback(f => ({ ...f, [id]: nowPremium ? 'Premium verildi ✓' : 'Premium kaldırıldı' }))
    setTimeout(() => setFeedback(f => ({ ...f, [id]: '' })), 2500)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-[#13131c] border border-[#1e1e2e] focus-within:border-[#EF9F27]/40 rounded-2xl px-4 py-3 transition-all">
        <Users size={15} className="text-[#555570]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Kullanıcı adı ile ara..."
          className="bg-transparent text-sm text-white outline-none w-full placeholder-[#555570]" />
        {search && <button onClick={() => setSearch('')} className="text-[#555570] hover:text-white transition-colors"><X size={14} /></button>}
      </div>

      <p className="text-xs text-[#555570] px-1">{filtered.length} kullanıcı{search ? ' bulundu' : ' kayıtlı'}</p>

      {loading && <p className="text-sm text-[#555570] text-center py-8">Yükleniyor...</p>}
      {!loading && users.length === 0 && (
        <p className="text-sm text-[#555570] text-center py-12">Henüz kayıtlı kullanıcı yok.</p>
      )}

      <div className="space-y-3">
        {filtered.map(u => {
          const vipLevel = getVipLevel(u.vip_points ?? 0)
          return (
            <div key={u.id} className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#2a2a3e] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-[#1e1e2e]">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                    : <span className="text-lg">👤</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{u.username}</p>
                    {u.is_premium && (
                      <span className="text-[10px] font-bold text-[#EF9F27] bg-[#EF9F27]/15 border border-[#EF9F27]/30 px-2 py-0.5 rounded-full">⭐ Premium</span>
                    )}
                    {u.is_admin && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-400/15 border border-purple-400/30 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                    <span className="text-[10px] text-[#9898b0] bg-[#1a1a24] border border-[#1e1e2e] px-2 py-0.5 rounded-full">VIP {vipLevel}</span>
                  </div>
                  <p className="text-xs text-[#555570] mt-0.5 font-mono text-[10px]">{u.id.slice(0,8)}...</p>
                  <p className="text-[10px] text-[#555570]">🗓 {new Date(u.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#EF9F27]">{(u.vip_points ?? 0).toLocaleString('tr')} puan</p>
                  <p className="text-[10px] text-[#555570]">Bakiye: {(u.shop_balance ?? 0).toLocaleString('tr')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-[#1e1e2e]">
                <input type="number" value={points[u.id] || ''}
                  onChange={e => setPoints(p => ({ ...p, [u.id]: e.target.value }))}
                  placeholder="Puan ekle..."
                  className="bg-[#1a1a24] border border-[#1e1e2e] text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-[#EF9F27]/50 w-36 placeholder-[#555570] transition-all" />
                <button onClick={() => addVip(u.id)}
                  className="flex items-center gap-1.5 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                  <Gift size={13} /> Puan Ekle
                </button>
                <button onClick={() => togglePremium(u.id)}
                  className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all',
                    u.is_premium
                      ? 'border-[#EF9F27]/40 bg-[#EF9F27]/10 text-[#EF9F27] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400'
                      : 'border-[#1e1e2e] bg-[#1a1a24] text-[#9898b0] hover:border-[#EF9F27]/40 hover:text-[#EF9F27]'
                  )}>
                  ⭐ {u.is_premium ? 'Premium Kaldır' : 'Premium Ver'}
                </button>
                {feedback[u.id] && (
                  <span className="text-xs text-green-400 font-semibold">{feedback[u.id]}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
