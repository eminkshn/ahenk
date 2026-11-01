'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { enablePush, getPushState, syncPush, type PushState } from '@/lib/push'

const DISMISS_KEY = 'ahenk:push-prompt-dismissed'

export default function NotificationPrompt() {
  const [state, setState] = useState<PushState>('unsupported')
  const [dismissed, setDismissed] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const s = getPushState()
    setState(s)
    try { setDismissed(localStorage.getItem(DISMISS_KEY) === '1') } catch { setDismissed(false) }
    if (s === 'granted') syncPush()
  }, [])

  if (dismissed || (state !== 'default' && state !== 'needs-install')) return null

  function dismiss() {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* gizli sekme */ }
  }

  async function enable() {
    setBusy(true)
    try {
      setState(await enablePush())
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      role="region"
      aria-label="Bildirimler"
      className="flex items-center gap-3 px-4 py-2.5 shrink-0"
      style={{ background: '#12352A', borderBottom: '1px solid #2C7A5E', color: '#E8EAEE' }}
    >
      <Bell size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <p className="flex-1 min-w-0 text-sm" style={{ lineHeight: 1.4 }}>
        {state === 'needs-install'
          ? 'Bildirim almak için Ahenk\'i Paylaş → Ana Ekrana Ekle ile yükle.'
          : 'Yeni mesajlarda bildirim almak ister misin?'}
      </p>
      {state === 'default' && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)', opacity: busy ? 0.6 : 1 }}
        >
          Bildirimleri aç
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Kapat"
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ color: '#9AA1AD' }}
      >
        <X size={18} />
      </button>
    </div>
  )
}
