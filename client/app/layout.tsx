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
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#8b3a52' },
    { media: '(prefers-color-scheme: light)', color: '#8b3a52' },
  ],
}

export const metadata: Metadata = {
  title: { default: 'Ahenk', template: '%s · Ahenk' },
  description: 'Topluluk iletişim platformu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ahenk',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'Ahenk',
    description: 'Topluluk iletişim platformu',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={lora.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#8b3a52" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body style={{ fontFamily: "'Lora', Georgia, serif" }}>{children}</body>
    </html>
  )
}
