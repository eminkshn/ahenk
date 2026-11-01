'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { user } = useAuthStore()
  const href = user ? '/app' : '/'

  const cfg = {
    sm: { mark: 20, text: '1.0625rem', gap: 6 },
    md: { mark: 24, text: '1.25rem', gap: 7 },
    lg: { mark: 30, text: '1.5rem', gap: 9 },
  }[size]

  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: cfg.gap, textDecoration: 'none', userSelect: 'none' }}>
      <LogoMark size={cfg.mark} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: cfg.text, color: 'var(--text-primary)', letterSpacing: '-0.045em', lineHeight: 1 }}>
        ahenk
      </span>
    </Link>
  )
}

// Speech bubble with three voice bars — community, order, privacy in rhythm.
export function LogoMark({ size, bubble = 'var(--accent)', bars = 'var(--bg-base)' }: { size: number; bubble?: string; bars?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 7h24a14 14 0 0 1 14 14v13a14 14 0 0 1-14 14H25l-11 9v-10A14 14 0 0 1 6 34V21A14 14 0 0 1 20 7z" fill={bubble} />
      {size > 16 && (
        <>
          <rect x="19.5" y="22" width="5.5" height="13" rx="2.75" fill={bars} />
          <rect x="29.25" y="16" width="5.5" height="25" rx="2.75" fill={bars} />
          <rect x="39" y="20" width="5.5" height="17" rx="2.75" fill={bars} />
        </>
      )}
    </svg>
  )
}
