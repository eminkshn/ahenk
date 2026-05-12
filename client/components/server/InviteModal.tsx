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
          style={{ background: 'rgba(139,58,82,0.1)', border: '1px solid rgba(139,58,82,0.25)' }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#9a7a82' }}>
            Davet Kodu
          </p>
          <p className="font-mono text-lg break-all" style={{ color: '#c96b82' }}>{inviteCode}</p>
        </div>

        <button
          onClick={copy}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: copied ? '#43b581' : 'linear-gradient(135deg, #8b3a52, #a84f68)',
            color: '#f0e4e7',
          }}
        >
          {copied ? '✓ Kopyalandı!' : 'Kodu Kopyala'}
        </button>

        <p className="text-xs text-center" style={{ color: '#7a5a62' }}>
          Bu kod kalıcıdır. Topluluğa katılmak isteyen herkesle paylaş.
        </p>
      </div>
    </Modal>
  )
}
