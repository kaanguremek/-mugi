import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: { default: 'HaeTae', template: '%s | HaeTae' },
  description: 'Türkçe manhwa, manga ve webtoon okuma platformu.',
  icons: {
    icon: [
      { url: '/logo.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.ico',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css" />
      </head>
      <body className="bg-[#0a0a0f] text-[#e8e8f0] antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
