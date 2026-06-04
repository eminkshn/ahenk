'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'
import { useAppStore } from '@/store/app'

type Mode = 'channel' | 'category'

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg text-sm outline-none'
const inputStyle = { background: '#10050a', border: '1px solid rgba(139,58,82,0.3)', color: '#f0e4e7' }
const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#8b3a52')
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')

export default function ChannelModal({
  open, onClose, communityId
}: {
  open: boolean; onClose: () => void; communityId: string
}) {
  const [mode, setMode] = useState<Mode>('channel')
  const [form, setForm] = useState({ name: '', type: 'TEXT', categoryId: '', topic: '' })
  const [catName, setCatName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { communities, setCommunities } = useAppStore()
  const community = communities.find((c) => c.id === communityId)

  function handleClose() {
    setForm({ name: '', type: 'TEXT', categoryId: '', topic: '' })
    setCatName('')
    setError('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'channel') {
        const { data } = await api.post(`/communities/${communityId}/channels`, {
          name: form.name, type: form.type,
          topic: form.topic || undefined,
          categoryId: form.categoryId || undefined,
        })
        setCommunities(communities.map((c) => c.id === communityId ? { ...c, channels: [...c.channels, data] } : c))
      } else {
        const { data } = await api.post(`/communities/${communityId}/categories`, { name: catName })
        setCommunities(communities.map((c) => c.id === communityId ? { ...c, categories: [...c.categories, data] } : c))
      }
      handleClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(139,58,82,0.1)' }}>
        {(['channel', 'category'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: mode === m ? 'linear-gradient(135deg, #8b3a52, #a84f68)' : 'transparent',
              color: mode === m ? '#f0e4e7' : '#9a7a82',
            }}
          >
            {m === 'channel' ? 'Kanal Oluştur' : 'Kategori Oluştur'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'channel' ? (
          <>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Kanal Adı</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="genel" className={inputCls} style={inputStyle}
                required autoFocus onFocus={focusOn} onBlur={focusOff} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Kanal Türü</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
                <option value="TEXT"># Metin</option>
                <option value="ANNOUNCEMENT">📢 Duyuru</option>
                <option value="VOICE">🔊 Ses</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Konu (opsiyonel)</label>
              <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="Bu kanal ne hakkında?" className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            {community && community.categories.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Kategori (opsiyonel)</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
                  <option value="">Kategori yok</option>
                  {community.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>Kategori Adı</label>
            <input value={catName} onChange={(e) => setCatName(e.target.value)}
              placeholder="Genel Kanallar" className={inputCls} style={inputStyle}
              required autoFocus onFocus={focusOn} onBlur={focusOff} />
          </div>
        )}

        {error && <p className="text-sm" style={{ color: '#e85c6a' }}>{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(139,58,82,0.1)', color: '#9a7a82', border: '1px solid rgba(139,58,82,0.2)' }}>
            İptal
          </button>
          <button type="submit"
            disabled={loading || (mode === 'channel' ? !form.name : !catName)}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-opacity"
            style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7',
              opacity: (loading || (mode === 'channel' ? !form.name : !catName)) ? 0.5 : 1 }}>
            {loading ? 'Oluşturuluyor...' : 'Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
