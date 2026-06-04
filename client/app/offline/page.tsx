'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', color: 'var(--text-primary)',
      fontFamily: "'Lora', Georgia, serif",
      gap: 16, padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem' }}>🌸</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0e4e7', margin: 0 }}>
        İnternet bağlantısı yok
      </h1>
      <p style={{ fontSize: '0.9375rem', color: '#8a6870', margin: 0, maxWidth: 280 }}>
        Ahenk&apos;e bağlanmak için internet bağlantısına ihtiyacın var.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: '10px 24px', borderRadius: 12,
          background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
          color: '#f0e4e7', border: 'none', cursor: 'pointer',
          fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'inherit',
        }}
      >
        Tekrar Dene
      </button>
    </div>
  )
}
