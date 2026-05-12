'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/app')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8"
      style={{
        background: 'rgba(14,5,9,0.97)',
        border: '1px solid rgba(139,58,82,0.42)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
      }}
    >
      <div className="text-center mb-7">
        <div className="text-4xl mb-3">🌸</div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f0e4e7' }}>Tekrar Hoş Geldin</h1>
        <p className="text-sm italic" style={{ color: '#7a5a62' }}>Ahenk'e giriş yap</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'email', label: 'E-Posta', type: 'email', auto: 'email' },
          { key: 'password', label: 'Şifre', type: 'password', auto: 'current-password' },
        ].map(({ key, label, type, auto }) => (
          <div key={key}>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#c4a0a8' }}>
              {label}
            </label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required
              autoComplete={auto}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#10050a', border: '1px solid rgba(139,58,82,0.3)', color: '#f0e4e7' }}
              onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
            />
          </div>
        ))}

        {error && (
          <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#e85c6a', background: 'rgba(232,92,106,0.08)', border: '1px solid rgba(232,92,106,0.25)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm mt-2 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7', opacity: loading ? 0.65 : 1 }}
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center" style={{ color: '#7a5a62' }}>
        Hesabın yok mu?{' '}
        <Link href="/register" className="font-semibold hover:underline" style={{ color: '#c96b82' }}>
          Kayıt Ol
        </Link>
      </p>
    </div>
  )
}
