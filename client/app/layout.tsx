import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-figtree',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['500'],
  variable: '--font-jetbrains',
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
    { media: '(prefers-color-scheme: dark)', color: '#0F1115' },
    { media: '(prefers-color-scheme: light)', color: '#0F1115' },
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
    <html lang="tr" className={`${figtree.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#0F1115" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body>{children}</body>
    </html>
  )
}
