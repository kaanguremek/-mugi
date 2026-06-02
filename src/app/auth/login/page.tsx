'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, BookOpen } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [show, setShow]       = useState(false)
  const [show2, setShow2]     = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ username:'', email:'', password:'', password2:'' })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (form.password !== form.password2) return setError('Şifreler eşleşmiyor.')
      if (form.password.length < 6) return setError('Şifre en az 6 karakter olmalı.')
      setSuccess(true)
      return
    }
    // login — ileride Supabase
    localStorage.setItem('user', JSON.stringify({ email: form.email }))
window.location.href = '/'
  }

  if (success) return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm rounded-2xl border p-8 text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hesabın Oluşturuldu!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Hoş geldin <span className="text-blue-400 font-medium">{form.username}</span>! Artık giriş yapabilirsin.
        </p>
        <button onClick={() => { setSuccess(false); setMode('login') }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm">
          Giriş Yap
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Arka glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* Logo + başlık */}
      <div className="relative flex flex-col items-center mb-8 text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
          <BookOpen size={26} className="text-white" />
        </div>
        <p className="text-sm font-semibold tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)' }}>
          Hoş Geldin
        </p>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          MangaTR
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login'
            ? 'Okumaya devam etmek için giriş yap.'
            : 'Ücretsiz hesap oluştur ve okumaya başla.'}
        </p>
      </div>

      {/* Kart */}
      <div className="relative w-full max-w-sm rounded-2xl border p-8"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Kullanıcı adı — sadece register */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}>Kullanıcı Adı</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type="text" required minLength={3} maxLength={20}
                  placeholder="kullanici_adi" value={form.username}
                  onChange={e => set('username', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                  style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
              style={{ color: 'var(--text-secondary)' }}>E-posta</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input type="email" required placeholder="ornek@mail.com" value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>Şifre</label>
              {mode === 'login' && (
                <Link href="/auth/forgot" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Şifremi Unuttum
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input type={show ? 'text' : 'password'} required minLength={6}
                placeholder="••••••••" value={form.password}
                onChange={e => set('password', e.target.value)}
                className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Şifre tekrar — sadece register */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}>Şifre Tekrar</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type={show2 ? 'text' : 'password'} required
                  placeholder="Şifreni tekrar gir" value={form.password2}
                  onChange={e => set('password2', e.target.value)}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                  style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShow2(!show2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}>
                  {show2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 text-sm mt-1">
            {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            {mode === 'login' ? 'Üye Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>

      <p className="relative text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
        MangaTR © 2026
      </p>
    </main>
  )
}
