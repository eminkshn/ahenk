'use client'

import { useState } from 'react'
import Modal from './Modal'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

const STATUSES = [
  { value: 'ONLINE', label: 'Çevrimiçi', color: '#43b581' },
  { value: 'IDLE', label: 'Boşta', color: '#faa61a' },
  { value: 'DND', label: 'Rahatsız Etme', color: '#ed4245' },
  { value: 'OFFLINE', label: 'Görünmez', color: '#747f8d' },
]

const inputStyle = {
  background: '#10050a',
  border: '1px solid rgba(139,58,82,0.3)',
  color: '#f0e4e7',
}

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [status, setStatus] = useState('ONLINE')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.patch('/users/me', { displayName, status })
      if (user) setAuth({ ...user, displayName: data.displayName }, accessToken!, refreshToken!)
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 1200)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Profil Ayarları">
      <form onSubmit={handleSave} className="space-y-5 mt-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}
          >
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#f0e4e7' }}>{user?.displayName}</p>
            <p className="text-sm" style={{ color: '#7a5a62' }}>@{user?.username}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>
            Görünen Ad
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#c4a0a8' }}>
            Durum
          </label>
          <div className="space-y-1.5">
            {STATUSES.map((s) => (
              <label
                key={s.value}
                className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors"
                style={{ background: status === s.value ? 'rgba(139,58,82,0.15)' : 'transparent' }}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-sm flex-1" style={{ color: '#f0e4e7' }}>{s.label}</span>
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={status === s.value}
                  onChange={() => setStatus(s.value)}
                  className="sr-only"
                />
                {status === s.value && (
                  <span style={{ color: '#c96b82' }} className="text-xs">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(139,58,82,0.12)', color: '#9a7a82', border: '1px solid rgba(139,58,82,0.2)' }}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: saved ? '#43b581' : 'linear-gradient(135deg, #8b3a52, #a84f68)',
              color: '#f0e4e7',
              opacity: loading ? 0.65 : 1,
            }}
          >
            {saved ? '✓ Kaydedildi' : loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
