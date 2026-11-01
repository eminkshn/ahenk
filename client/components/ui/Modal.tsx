'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 440,
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full relative"
        style={{
          maxWidth: width,
          background: 'linear-gradient(145deg, rgba(28,32,40,0.98), rgba(11,13,16,0.99))',
          border: '1px solid rgba(79,209,165,0.38)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,209,165,0.08) inset',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(79,209,165,0.1)', border: 'none', borderRadius: 8,
            color: '#5C626D', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8EAEE'; e.currentTarget.style.background = 'rgba(79,209,165,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#5C626D'; e.currentTarget.style.background = 'rgba(79,209,165,0.1)' }}
          aria-label="Kapat"
        >
          <X size={14} />
        </button>

        {title && (
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#E8EAEE', marginBottom: subtitle ? 4 : 20, paddingRight: 32 }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ fontSize: '0.8125rem', color: '#5C626D', fontStyle: 'italic', marginBottom: 20 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
