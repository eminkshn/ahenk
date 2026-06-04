'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'
import { useAppStore } from '@/store/app'
import type { Community } from '@/store/app'

type Step = 'pick' | 'create' | 'join'

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg text-sm outline-none'
const inputStyle = { background: '#10050a', border: '1px solid rgba(139,58,82,0.3)', color: '#f0e4e7' }

export default function CommunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('pick')
  function handleClose() { setStep('pick'); onClose() }

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 'pick' && <PickStep onCreate={() => setStep('create')} onJoin={() => setStep('join')} />}
      {step === 'create' && <CreateStep onClose={handleClose} onBack={() => setStep('pick')} />}
      {step === 'join' && <JoinStep onClose={handleClose} onBack={() => setStep('pick')} />}
    </Modal>
  )
}

function PickStep({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">🌸</div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#f0e4e7' }}>Topluluğa Başla</h2>
        <p className="text-sm" style={{ color: '#7a5a62' }}>Kendi topluluğunu kur ya da var olana katıl</p>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Topluluk Oluştur', sub: 'Sıfırdan yeni bir topluluk kur', fn: onCreate },
          { label: 'Topluluğa Katıl', sub: 'Davet koduyla mevcut bir topluluğa katıl', fn: onJoin },
        ].map(({ label, sub, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors text-left group"
            style={{ background: 'rgba(139,58,82,0.08)', border: '1px solid rgba(139,58,82,0.18)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.08)')}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: '#f0e4e7' }}>{label}</p>
              <p className="text-xs" style={{ color: '#7a5a62' }}>{sub}</p>
            </div>
            <span style={{ color: '#9a7a82' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CreateStep({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const router = useRouter()
  const { addCommunity } = useAppStore()
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/communities', form)
      addCommunity(data as Community)
      const firstChannel = (data as Community).channels[0]
      onClose()
      router.push(firstChannel ? `/app/${data.id}/${firstChannel.id}` : `/app`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm mb-4 flex items-center gap-1 transition-colors" style={{ color: '#9a7a82' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f0e4e7')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}>
        ← Geri
      </button>
      <h2 className="text-xl font-bold mb-1" style={{ color: '#f0e4e7' }}>Topluluğunu Özelleştir</h2>
      <p className="text-sm mb-5" style={{ color: '#7a5a62' }}>Topluluğuna bir ad ver. Daha sonra değiştirebilirsin.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Topluluk Adı', placeholder: 'Benim Topluluğum', required: true },
          { key: 'description', label: 'Açıklama (opsiyonel)', placeholder: 'Topluluk hakkında kısa bir açıklama', required: false },
        ].map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>{label}</label>
            <input
              type="text"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className={inputCls}
              style={inputStyle}
              required={required}
              autoFocus={key === 'name'}
              onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
            />
          </div>
        ))}

        {error && <p className="text-sm" style={{ color: '#e85c6a' }}>{error}</p>}

        <button
          type="submit"
          disabled={!form.name.trim() || loading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mt-1 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7', opacity: (!form.name.trim() || loading) ? 0.5 : 1 }}
        >
          {loading ? 'Oluşturuluyor...' : 'Topluluk Oluştur'}
        </button>
      </form>
    </div>
  )
}

function JoinStep({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const router = useRouter()
  const { addCommunity, communities } = useAppStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(`/communities/join/${trimmed}`)
      if (!communities.find((c) => c.id === data.id)) addCommunity(data as Community)
      const firstCh = (data as Community).channels?.[0]
      onClose()
      router.push(firstCh ? `/app/${data.id}/${firstCh.id}` : `/app`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Geçersiz davet kodu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm mb-4 transition-colors" style={{ color: '#9a7a82' }}>← Geri</button>
      <h2 className="text-xl font-bold mb-1" style={{ color: '#f0e4e7' }}>Topluluğa Katıl</h2>
      <p className="text-sm mb-5" style={{ color: '#7a5a62' }}>Davet kodunu girerek katıl.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Davet Kodu</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="örn: abc123xyz"
            className={`${inputCls} font-mono`}
            style={inputStyle}
            autoFocus
            onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
          />
          <p className="text-xs mt-1.5" style={{ color: '#7a5a62' }}>Davet kodunu topluluk sahibinden alabilirsin</p>
        </div>

        {error && <p className="text-sm" style={{ color: '#e85c6a' }}>{error}</p>}

        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity"
          style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7', opacity: (!code.trim() || loading) ? 0.5 : 1 }}
        >
          {loading ? 'Katılınıyor...' : 'Topluluğa Katıl'}
        </button>
      </form>
    </div>
  )
}
