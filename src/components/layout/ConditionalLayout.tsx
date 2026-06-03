'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth   = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register'
  const isReader = /\/seri\/.+\/bolum\/.+/.test(pathname)

  if (isAuth || isReader) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
