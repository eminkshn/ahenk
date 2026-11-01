'use client'

import { LogoMark } from '@/components/ui/Logo'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      gap: 16, padding: 24, textAlign: 'center',
    }}>
      <LogoMark size={56} />
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E8EAEE', margin: 0 }}>
        İnternet bağlantısı yok
      </h1>
      <p style={{ fontSize: '0.9375rem', color: '#8A919C', margin: 0, maxWidth: 280 }}>
        Ahenk&apos;e bağlanmak için internet bağlantısına ihtiyacın var.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: '10px 24px', borderRadius: 12,
          background: 'var(--accent)',
          color: 'var(--accent-ink)', border: 'none', cursor: 'pointer',
          fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'inherit',
        }}
      >
        Tekrar Dene
      </button>
    </div>
  )
}
