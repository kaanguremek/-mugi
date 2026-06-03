import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: { default: 'İmugi', template: '%s | İmugi' },
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
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
