'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

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
      setError(e.response?.data?.error || 'E-posta veya şifre hatalı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-scale-in" style={{
      background: 'rgba(13,4,16,0.96)',
      border: '1px solid rgba(139,58,82,0.35)',
      borderRadius: '20px',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(139,58,82,0.06)',
      padding: '2.5rem',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 8px 24px rgba(139,58,82,0.4)',
          fontSize: '24px',
        }}>🌸</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0e4e7', marginBottom: '0.25rem' }}>
          Tekrar Hoş Geldin
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8a6870', fontStyle: 'italic' }}>
          Ahenk topluluğuna giriş yap
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#c4a0ab', marginBottom: '0.5rem' }}>
            E-Posta
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#5a3d45', pointerEvents: 'none' }} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
              placeholder="ornek@mail.com"
              className="input-base"
              style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.4rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#c4a0ab', marginBottom: '0.5rem' }}>
            Şifre
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#5a3d45', pointerEvents: 'none' }} />
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-base"
              style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 2.4rem', fontSize: '0.875rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a3d45', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4a0ab')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5a3d45')}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            fontSize: '0.8125rem', padding: '0.625rem 0.875rem',
            borderRadius: '8px', color: '#f07880',
            background: 'rgba(240,120,128,0.08)',
            border: '1px solid rgba(240,120,128,0.22)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1rem' }}>⚠</span> {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{
          width: '100%', padding: '0.8rem 1.5rem',
          fontSize: '0.9375rem', marginTop: '0.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="rose-divider" style={{ margin: '1.5rem 0' }} />

      <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#5a3d45' }}>
        Hesabın yok mu?{' '}
        <Link href="/register" style={{ color: '#c96b82', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
          onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>
          Kayıt Ol →
        </Link>
      </p>
    </div>
  )
}
