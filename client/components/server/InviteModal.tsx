'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'

export default function InviteModal({
  open,
  onClose,
  inviteCode,
  communityName,
}: {
  open: boolean
  onClose: () => void
  inviteCode: string
  communityName: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Arkadaşlarını Davet Et" subtitle={`${communityName} topluluğuna davet kodu`}>
      <div className="space-y-4 mt-4">
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(79,209,165,0.1)', border: '1px solid rgba(79,209,165,0.25)' }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#9AA1AD' }}>
            Davet Kodu
          </p>
          <p className="font-mono text-lg break-all" style={{ color: '#4FD1A5' }}>{inviteCode}</p>
        </div>

        <button
          onClick={copy}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: copied ? '#43b581' : 'var(--accent)',
            color: 'var(--accent-ink)',
          }}
        >
          {copied ? '✓ Kopyalandı!' : 'Kodu Kopyala'}
        </button>

        <p className="text-xs text-center" style={{ color: '#7C838F' }}>
          Bu kod kalıcıdır. Topluluğa katılmak isteyen herkesle paylaş.
        </p>
      </div>
    </Modal>
  )
}
