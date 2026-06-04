'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Menu, X, LogOut, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useDMStore } from '@/store/dm'
import CommunityModal from './CommunityModal'
import ProfileModal from '@/components/ui/ProfileModal'

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
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,82,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <FlowerIcon size={22} />
      </button>

      <Divider />

      {/* ── Hamburger ────────────────────────────────────── */}
      <button
        onClick={onToggle}
        title={channelOpen ? 'Kenar Çubuğunu Gizle' : 'Kenar Çubuğunu Göster'}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: channelOpen ? 'rgba(139,58,82,0.18)' : 'none',
          color: channelOpen ? '#c96b82' : '#5a3d45',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,58,82,0.25)'; e.currentTarget.style.color = '#f0e4e7' }}
        onMouseLeave={e => { e.currentTarget.style.background = channelOpen ? 'rgba(139,58,82,0.18)' : 'none'; e.currentTarget.style.color = channelOpen ? '#c96b82' : '#5a3d45' }}
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
          background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
          color: '#f0e4e7', border: 'none', cursor: 'pointer',
          borderRadius: '50%', fontSize: '0.875rem', fontWeight: 700,
          transition: 'opacity 0.15s, transform 0.15s',
          boxShadow: '0 2px 8px rgba(139,58,82,0.35)', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.07)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        {user?.displayName?.[0]?.toUpperCase()}
      </button>

      <button
        onClick={() => { logout(); router.push('/login') }}
        title="Çıkış Yap"
        style={{
          width: 40, height: 40, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', color: '#5a3d45', border: 'none', cursor: 'pointer',
          borderRadius: 10, transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#e85c6a'; e.currentTarget.style.background = 'rgba(232,92,106,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45'; e.currentTarget.style.background = 'none' }}
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
        background: '#f0e4e7', borderRadius: '0 4px 4px 0',
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
          color: active || hovered ? '#f0e4e7' : '#c4a0ab',
          background: active ? 'linear-gradient(135deg, #8b3a52, #b04e6a)' : hovered ? 'rgba(139,58,82,0.3)' : 'rgba(139,58,82,0.12)',
          borderRadius: active || hovered ? '30%' : '50%',
          border: 'none', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden', flexShrink: 0,
          boxShadow: active ? '0 4px 16px rgba(139,58,82,0.45)' : 'none',
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
      background: 'linear-gradient(to right, transparent, rgba(139,58,82,0.3), transparent)',
      borderRadius: 1, margin: '6px 0', flexShrink: 0,
    }} />
  )
}

function ThickDivider() {
  return (
    <div style={{
      width: 36, height: 2,
      background: 'linear-gradient(to right, transparent, rgba(139,58,82,0.45), transparent)',
      borderRadius: 1, margin: '8px 0', flexShrink: 0,
    }} />
  )
}

function FlowerIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g transform="translate(12,12)">
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.92" transform="rotate(0)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.88" transform="rotate(60)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#b05a72" opacity="0.88" transform="rotate(120)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#b05a72" opacity="0.84" transform="rotate(180)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.84" transform="rotate(240)" />
        <ellipse cx="0" cy="-5.2" rx="2.6" ry="4.2" fill="#c96b82" opacity="0.88" transform="rotate(300)" />
      </g>
      <circle cx="12" cy="12" r="3.8" fill="#f5dde5" />
      <circle cx="12" cy="12" r="2.2" fill="#f0e4e7" />
    </svg>
  )
}
