'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, User, AtSign, Lock, ArrowRight, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { LogoMark } from '@/components/ui/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', displayName: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/app')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Kayıt sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'email',       label: 'E-Posta',      type: 'email',    auto: 'email',        icon: Mail,    placeholder: 'ornek@mail.com' },
    { key: 'displayName', label: 'Görünen Ad',    type: 'text',     auto: 'name',         icon: User,    placeholder: 'Adın Soyadın' },
    { key: 'username',    label: 'Kullanıcı Adı', type: 'text',     auto: 'username',     icon: AtSign,  placeholder: 'kullanici_adi' },
    { key: 'password',    label: 'Şifre',         type: 'password', auto: 'new-password', icon: Lock,    placeholder: '••••••••' },
  ]

  return (
    <div className="w-full max-w-md animate-scale-in" style={{
      background: 'rgba(22,25,32,0.96)',
      border: '1px solid rgba(79,209,165,0.35)',
      borderRadius: '20px',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(79,209,165,0.06)',
      padding: '2.5rem',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          width: 56, height: 56,
          background: 'var(--accent)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 8px 24px rgba(79,209,165,0.4)',
          }}><LogoMark size={34} bubble="var(--accent-ink)" bars="var(--accent)" /></div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E8EAEE', marginBottom: '0.25rem' }}>
          Hesap Oluştur
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8A919C', fontStyle: 'italic' }}>
          Ahenk topluluğuna katıl
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {fields.map(({ key, label, type, auto, icon: Icon, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#C9CDD4', marginBottom: '0.5rem' }}>
              {label}
            </label>
            <div style={{ position: 'relative' }}>
              <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#5C626D', pointerEvents: 'none' }} />
              <input
                type={key === 'password' && showPw ? 'text' : type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
                autoComplete={auto}
                placeholder={placeholder}
                className="input-base"
                style={{ width: '100%', padding: `0.7rem ${key === 'password' ? '2.5rem' : '0.875rem'} 0.7rem 2.4rem`, fontSize: '0.875rem' }}
              />
              {key === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#5C626D', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9CDD4')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5C626D')}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div style={{
            fontSize: '0.8125rem', padding: '0.625rem 0.875rem',
            borderRadius: '8px', color: '#FFA597',
            background: 'rgba(255,165,151,0.08)',
            border: '1px solid rgba(255,165,151,0.22)',
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
          {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="rose-divider" style={{ margin: '1.5rem 0' }} />

      <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#5C626D' }}>
        Zaten hesabın var mı?{' '}
        <Link href="/login" style={{ color: '#4FD1A5', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
          onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>
          Giriş Yap →
        </Link>
      </p>
    </div>
  )
}
