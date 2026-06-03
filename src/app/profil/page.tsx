'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Save, Eye, EyeOff, Lock, Shield, Shirt } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getUserBadge, BADGES } from '@/lib/badges'

const FRAMES = [
  { path: '/frames/melek.svg',    name: 'Melek'   },
  { path: '/frames/kedi.svg',     name: 'Kedi'    },
  { path: '/frames/ates.svg',     name: 'Ateş'    },
  { path: '/frames/buz.svg',      name: 'Buz'     },
  { path: '/frames/tas.svg',      name: 'Taş'     },
  { path: '/frames/canavar.svg',  name: 'Canavar' },
  { path: '/frames/enerji.svg',   name: 'Enerji'  },
  { path: '/frames/zirh.svg',     name: 'Zırh'    },
]

const ACCESSORIES = [
  { path: '/accessories/altin-tac.svg',     name: 'Altın Taç'       },
  { path: '/accessories/altin-kanat.svg',   name: 'Altın Kanatlar'  },
  { path: '/accessories/korsan-sapka.svg',  name: 'Korsan Şapkası'  },
  { path: '/accessories/yarasa-kanat.svg',  name: 'Yarasa Kanatları'},
  { path: '/accessories/kedi-kulak.svg',    name: 'Kedi Kulakları'  },
  { path: '/accessories/cadi-sapka.svg',    name: 'Cadı Şapkası'    },
  { path: '/accessories/noel-sapka.svg',    name: 'Noel Şapkası'    },
  { path: '/accessories/samuray-kask.svg',  name: 'Samuray Kaskı'   },
  { path: '/accessories/pixel-gozluk.svg',  name: 'Pixel Gözlük'    },
]

type Tab = 'genel' | 'gorunum'

export default function ProfilPage() {
  const { user, ready, update } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.push('/login')
  }, [user, ready, router])

  const [tab,      setTab]      = useState<Tab>('genel')
  const [showNew,  setShowNew]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [newPass,  setNewPass]  = useState('')
  const [passErr,  setPassErr]  = useState('')
  const [passSaved, setPassSaved] = useState(false)

  const avatarRef = useRef<HTMLInputElement>(null)

  if (!ready || !user) return null

  const badge = getUserBadge(user.createdAt)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Önce Supabase Storage'a yükle, olmazsa base64 kullan
    const ext  = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    supabase.storage.from('covers').upload(path, file, { upsert: true })
      .then(({ error }) => {
        if (error) {
          // Fallback: base64
          const reader = new FileReader()
          reader.onload = () => update({ avatar: reader.result as string })
          reader.readAsDataURL(file)
        } else {
          const { data } = supabase.storage.from('covers').getPublicUrl(path)
          update({ avatar: data.publicUrl })
        }
      })
  }

  const savePassword = async () => {
    setPassErr('')
    if (newPass.length < 6) { setPassErr('Yeni şifre en az 6 karakter olmalı.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { setPassErr(error.message); return }
    setNewPass('')
    setPassSaved(true)
    setTimeout(() => setPassSaved(false), 2000)
  }

  const handleSave = async () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[#EF9F27] rounded-full" />
          <h1 className="text-2xl font-bold text-white">Profil Ayarları</h1>
        </div>

        {/* Avatar kartı */}
        <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 flex flex-col items-center gap-4">
          <div className="relative">
            {user.equippedAccessory && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-10 z-20">
                <img src={user.equippedAccessory} alt="aksesuar" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2a2a3e] flex items-center justify-center border-2 border-[#1e1e2e]">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <i className="fi fi-rr-user text-[#555570] text-3xl leading-none mt-2" />
                }
              </div>
              {user.equippedFrame && (
                <img src={user.equippedFrame} alt="çerçeve" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              )}
              <button onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#EF9F27] rounded-full flex items-center justify-center shadow-lg hover:bg-[#BA7517] transition-colors z-30">
                <Camera size={13} className="text-white" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.showBadge && badge && (
              <img src={badge.icon} alt={badge.label} className="w-5 h-5 object-contain" title={badge.label} />
            )}
            <span className="text-lg font-bold text-white">{user.username}</span>
          </div>
          <p className="text-xs text-[#555570]">{user.email}</p>

          {badge ? (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
              style={{ color: badge.color, borderColor: badge.color + '44', backgroundColor: badge.color + '12' }}>
              <img src={badge.icon} alt={badge.label} className="w-4 h-4 object-contain" />
              {badge.label} Üye
            </div>
          ) : (
            <p className="text-xs text-[#555570]">1 haftayı tamamladığında rozet kazanacaksın</p>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2">
          {([
            { key: 'genel',   label: 'Genel',   icon: Lock  },
            { key: 'gorunum', label: 'Görünüm', icon: Shirt },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                tab === key
                  ? 'border-[#EF9F27] bg-[#EF9F27]/10 text-[#EF9F27]'
                  : 'border-[#1e1e2e] bg-[#13131c] text-[#9898b0] hover:border-[#EF9F27]/30'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* GENEL TAB */}
        {tab === 'genel' && (
          <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
            <div className="border-b border-[#1e1e2e] pb-5">
              <p className="text-xs font-semibold text-[#9898b0] mb-1 uppercase tracking-wide">E-posta</p>
              <p className="text-sm text-white">{user.email}</p>
              <p className="text-[10px] text-[#555570] mt-1">E-posta değişikliği için destek hattına ulaşın.</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#9898b0] mb-4 uppercase tracking-wide flex items-center gap-1.5">
                <Lock size={12} /> Şifre Değiştir
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} placeholder="Yeni şifre (min. 6 karakter)"
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border bg-[#1a1a24] border-[#1e1e2e] text-white text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder-[#555570]" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570]">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {passErr && <p className="text-xs text-red-400 mt-2">{passErr}</p>}
              <button onClick={savePassword}
                className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  passSaved
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-[#EF9F27] hover:bg-[#BA7517] text-white'
                }`}>
                <Save size={14} />
                {passSaved ? 'Şifre Güncellendi!' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </div>
        )}

        {/* GÖRÜNÜM TAB */}
        {tab === 'gorunum' && (
          <div className="space-y-6">
            {/* Rozet görünürlüğü */}
            <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-[#EF9F27]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Üyelik Rozeti</p>
                    <p className="text-xs text-[#555570] mt-0.5">İsmin önünde rozet gösterilsin mi?</p>
                  </div>
                </div>
                <button onClick={() => update({ showBadge: !user.showBadge })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${user.showBadge ? 'bg-[#EF9F27]' : 'bg-[#2a2a3e]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${user.showBadge ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              {badge && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {BADGES.map(b => (
                    <div key={b.tier} className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#1e1e2e] bg-[#1a1a24]">
                      <img src={b.icon} alt={b.label} className="w-8 h-8 object-contain" />
                      <span className="text-[10px] font-semibold" style={{ color: b.color }}>{b.label}</span>
                      <span className="text-[9px] text-[#555570]">{b.minDays >= 365 ? `${b.minDays/365}y` : `${b.minDays}g`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Çerçeve seçimi */}
            <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-1">Avatar Çerçevesi</p>
              <p className="text-xs text-[#555570] mb-4">Mağazadan satın aldığın çerçeveler burada görünür</p>
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => update({ equippedFrame: null })}
                  className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                    !user.equippedFrame ? 'border-[#EF9F27]' : 'border-[#1e1e2e] hover:border-[#EF9F27]/40'
                  } bg-[#1a1a24]`}>
                  <span className="text-xs text-[#555570]">Yok</span>
                </button>
                {FRAMES.map(f => (
                  <button key={f.path} onClick={() => update({ equippedFrame: f.path })}
                    className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                      user.equippedFrame === f.path ? 'border-[#EF9F27]' : 'border-[#1e1e2e] hover:border-[#EF9F27]/40'
                    } bg-[#1a1a24]`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a3e]" />
                    </div>
                    <img src={f.path} alt={f.name} className="absolute inset-0 w-full h-full object-contain" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-[#9898b0]">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aksesuar seçimi */}
            <div className="bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-1">Aksesuar</p>
              <p className="text-xs text-[#555570] mb-4">Avatarının üzerinde görünecek aksesuar</p>
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => update({ equippedAccessory: null })}
                  className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                    !user.equippedAccessory ? 'border-[#EF9F27]' : 'border-[#1e1e2e] hover:border-[#EF9F27]/40'
                  } bg-[#1a1a24]`}>
                  <span className="text-xs text-[#555570]">Yok</span>
                </button>
                {ACCESSORIES.map(a => (
                  <button key={a.path} onClick={() => update({ equippedAccessory: a.path })}
                    className={`relative aspect-square rounded-xl border-2 transition-all p-2 ${
                      user.equippedAccessory === a.path ? 'border-[#EF9F27]' : 'border-[#1e1e2e] hover:border-[#EF9F27]/40'
                    } bg-[#1a1a24] flex flex-col items-center justify-center gap-1`}>
                    <img src={a.path} alt={a.name} className="w-10 h-8 object-contain" />
                    <span className="text-[9px] text-[#9898b0] text-center leading-tight">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
