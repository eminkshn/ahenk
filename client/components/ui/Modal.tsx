'use client'

import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(26,9,15,0.99)',
          border: '1px solid rgba(139,58,82,0.42)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-bold mb-1" style={{ color: '#f0e4e7' }}>{title}</h2>}
        {subtitle && <p className="text-sm italic mb-5" style={{ color: '#7a5a62' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
