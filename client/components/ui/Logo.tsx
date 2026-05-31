'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { user } = useAuthStore()
  const href = user ? '/app' : '/'

  const cfg = {
    sm: { flower: 16, text: '0.9375rem', gap: 6 },
    md: { flower: 20, text: '1.125rem', gap: 7 },
    lg: { flower: 26, text: '1.375rem', gap: 9 },
  }[size]

  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: cfg.gap, textDecoration: 'none', userSelect: 'none' }}>
      <FlowerSVG size={cfg.flower} />
      <span style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: cfg.text, color: '#f0e4e7', letterSpacing: '-0.01em', lineHeight: 1 }}>
        ahenk
      </span>
    </Link>
  )
}

function FlowerSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(12,12)">
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.92" transform="rotate(0)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.88" transform="rotate(60)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#b05a72" opacity="0.88" transform="rotate(120)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#b05a72" opacity="0.84" transform="rotate(180)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.84" transform="rotate(240)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.88" transform="rotate(300)" />
      </g>
      <circle cx="12" cy="12" r="3.8" fill="#f5dde5" />
      <circle cx="12" cy="12" r="2.2" fill="#f0e4e7" />
    </svg>
  )
}
