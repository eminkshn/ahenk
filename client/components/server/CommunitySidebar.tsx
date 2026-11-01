'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Menu, X, LogOut, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useDMStore } from '@/store/dm'
import CommunityModal from './CommunityModal'
import ProfileModal from '@/components/ui/ProfileModal'
import { LogoMark } from '@/components/ui/Logo'
import { disablePush } from '@/lib/push'

export default function CommunitySidebar({ channelOpen, onToggle }: {
  channelOpen: boolean
  onToggle: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { communities, selectedCommunityId, selectCommunity } = useAppStore()
  const { user, logout } = useAuthStore()
  const { conversations } = useDMStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  function handleSelect(communityId: string) {
    if (!channelOpen) onToggle()
    selectCommunity(communityId)
    const community = communities.find((c) => c.id === communityId)
    const first = community?.channels.slice().sort((a, b) => a.position - b.position)[0]
    router.push(first ? `/app/${communityId}/${first.id}` : `/app`)
  }

  function handleDM() {
    if (!channelOpen) onToggle()
    // Navigate to most recent conversation if any, otherwise to DM home
    const last = conversations[0]
    router.push(last ? `/app/dm/${last.id}` : '/app/dm')
  }

  const activeCommunityId = pathname.split('/')[2] || selectedCommunityId || undefined
  const isDM = pathname.startsWith('/app/dm')

  return (
    <div style={{
      width: 72,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 10,
      gap: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      flexShrink: 0,
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border)',
    }}>

      {/* ── Brand ────────────────────────────────────────── */}
      <button
        onClick={() => router.push('/app')}
        title="Ana Sayfa"
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          borderRadius: 12, transition: 'background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,209,165,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <LogoMark size={26} />
      </button>

      <Divider />

      {/* ── Hamburger ────────────────────────────────────── */}
      <button
        onClick={onToggle}
        title={channelOpen ? 'Kenar Çubuğunu Gizle' : 'Kenar Çubuğunu Göster'}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: channelOpen ? 'rgba(79,209,165,0.18)' : 'none',
          color: channelOpen ? '#4FD1A5' : '#5C626D',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,209,165,0.25)'; e.currentTarget.style.color = '#E8EAEE' }}
        onMouseLeave={e => { e.currentTarget.style.background = channelOpen ? 'rgba(79,209,165,0.18)' : 'none'; e.currentTarget.style.color = channelOpen ? '#4FD1A5' : '#5C626D' }}
      >
        {channelOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      <ThickDivider />

      {/* ── DM ───────────────────────────────────────────── */}
      <NavIcon active={isDM} title="Direkt Mesajlar" onClick={handleDM}>
        <MessageCircle size={20} />
      </NavIcon>

      <ThickDivider />

      {/* ── Communities ──────────────────────────────────── */}
      {communities.map((c) => (
        <NavIcon
          key={c.id}
          active={activeCommunityId === c.id && !isDM}
          title={c.name}
          onClick={() => handleSelect(c.id)}
        >
          {c.icon
            ? <img src={c.icon} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            : <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{c.name[0].toUpperCase()}</span>
          }
        </NavIcon>
      ))}

      <button
        onClick={() => setModalOpen(true)}
        title="Topluluk Oluştur / Katıl"
        style={{
          width: 44, height: 44, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(59,165,93,0.1)', color: '#3ba55d',
          border: '1.5px dashed rgba(59,165,93,0.35)',
          borderRadius: '50%', cursor: 'pointer',
          transition: 'all 0.2s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,165,93,0.22)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderRadius = '30%' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,165,93,0.1)'; e.currentTarget.style.color = '#3ba55d'; e.currentTarget.style.borderRadius = '50%' }}
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      {/* spacer */}
      <div style={{ flex: 1, minHeight: 8 }} />

      <Divider />

      {/* ── User ─────────────────────────────────────────── */}
      <button
        onClick={() => setProfileModalOpen(true)}
        title={`${user?.displayName} — Profil`}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent)',
          color: 'var(--accent-ink)', border: 'none', cursor: 'pointer',
          borderRadius: '50%', fontSize: '0.875rem', fontWeight: 700,
          transition: 'opacity 0.15s, transform 0.15s',
          boxShadow: '0 2px 8px rgba(79,209,165,0.35)', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.07)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        {user?.displayName?.[0]?.toUpperCase()}
      </button>

      <button
        onClick={async () => { await disablePush(); logout(); router.push('/login') }}
        title="Çıkış Yap"
        style={{
          width: 40, height: 40, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', color: '#5C626D', border: 'none', cursor: 'pointer',
          borderRadius: 10, transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#FF8A7A'; e.currentTarget.style.background = 'rgba(255,138,122,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5C626D'; e.currentTarget.style.background = 'none' }}
      >
        <LogOut size={17} />
      </button>

      <CommunityModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function NavIcon({ active, title, onClick, children }: {
  active: boolean; title: string; onClick: () => void; children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', flexShrink: 0, marginBottom: 4 }}>
      <div style={{
        position: 'absolute', left: -12, top: '50%',
        transform: `translateY(-50%) scaleY(${active ? 1 : hovered ? 0.5 : 0})`,
        width: 4, height: active ? 36 : 18,
        background: '#E8EAEE', borderRadius: '0 4px 4px 0',
        transition: 'transform 0.15s, height 0.15s',
      }} />
      <button
        onClick={onClick}
        title={title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 48, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: active ? 'var(--accent-ink)' : hovered ? '#E8EAEE' : '#C9CDD4',
          background: active ? 'var(--accent)' : hovered ? 'rgba(79,209,165,0.3)' : 'rgba(79,209,165,0.12)',
          borderRadius: active || hovered ? '30%' : '50%',
          border: 'none', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden', flexShrink: 0,
          boxShadow: active ? '0 4px 16px rgba(79,209,165,0.45)' : 'none',
        }}
      >
        {children}
      </button>
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      width: 32, height: 1.5,
      background: 'linear-gradient(to right, transparent, rgba(79,209,165,0.3), transparent)',
      borderRadius: 1, margin: '6px 0', flexShrink: 0,
    }} />
  )
}

function ThickDivider() {
  return (
    <div style={{
      width: 36, height: 2,
      background: 'linear-gradient(to right, transparent, rgba(79,209,165,0.45), transparent)',
      borderRadius: 1, margin: '8px 0', flexShrink: 0,
    }} />
  )
}

