'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const inputCls = 'w-full pl-9 pr-10 py-3 rounded-xl border bg-[#1a1a24] border-[#1e1e2e] text-white text-sm outline-none transition-all focus:border-[#EF9F27]/50 placeholder-[#555570]'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [identifier, setIdentifier] = useState('')
  const [password,   setPassword]   = useState('')
  const [show,       setShow]       = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(identifier, password)
    if (err) { setError(err); setLoading(false); return }
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EF9F27]/4 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-[#13131c] border border-[#1e1e2e] rounded-2xl p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#EF9F27]/70 shadow-lg shadow-[#EF9F27]/20 mb-3">
            <Image src="/logo.png" alt="İmugi" width={56} height={56} className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#555570] mb-0.5">Hoş Geldin</p>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9F27] to-[#F5BA45]">
            İmugi
          </h1>
          <p className="text-xs mt-1.5 text-[#9898b0]">Okumaya devam etmek için giriş yap.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block text-[#9898b0]">
              E-posta
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570]" />
              <input type="email" required placeholder="ornek@mail.com"
                value={identifier} onChange={e => setIdentifier(e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block text-[#9898b0]">
              Şifre
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570]" />
              <input type={show ? 'text' : 'password'} required minLength={6}
                placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570] hover:text-[#9898b0]">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#EF9F27] hover:bg-[#BA7517] disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#EF9F27]/20 text-sm">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-[#555570]">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-[#EF9F27] hover:text-[#F5BA45] font-semibold transition-colors">
            Üye Ol
          </Link>
        </p>

        <p className="text-center text-[10px] mt-4 text-[#333350]">İmugi © 2026</p>
      </div>
    </main>
  )
}
