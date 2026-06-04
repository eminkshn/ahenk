import type { Metadata, Viewport } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b3a52',
}

export const metadata: Metadata = {
  title: 'Ahenk',
  description: 'Topluluk iletişim platformu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ahenk',
  },
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={lora.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ fontFamily: "'Lora', Georgia, serif" }}>{children}</body>
    </html>
  )
}
