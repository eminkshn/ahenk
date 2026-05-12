import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ahenk',
  description: 'Yerli ve milli iletişim platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={lora.variable}>
      <body style={{ fontFamily: "'Lora', Georgia, serif" }}>{children}</body>
    </html>
  )
}
