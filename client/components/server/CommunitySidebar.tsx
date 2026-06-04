'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageCircle, Plus, Menu, X, LogOut, Settings } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
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
  const [modalOpen, setModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  function handleSelect(communityId: string) {
    if (!channelOpen) onToggle()
    selectCommunity(communityId)
    const community = communities.find((c) => c.id === communityId)
    const first = community?.channels.slice().sort((a, b) => a.position - b.position)[0]
    router.push(first ? `/app/${communityId}/${first.id}` : `/app`)
  }

  const activeCommunityId = pathname.split('/')[2] || selectedCommunityId || undefined
  const isDM = pathname.startsWith('/app/dm')

  return (
    <div style={{
      width: 72,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      gap: 6,
      overflowY: 'auto',
      overflowX: 'hidden',
      flexShrink: 0,
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Hamburger toggle */}
      <button
        onClick={onToggle}
        title={channelOpen ? 'Kenar Çubuğunu Gizle' : 'Kenar Çubuğunu Göster'}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: channelOpen ? 'rgba(139,58,82,0.18)' : 'rgba(139,58,82,0.08)',
          color: channelOpen ? '#c96b82' : '#8a6870',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,58,82,0.28)'; e.currentTarget.style.color = '#f0e4e7' }}
        onMouseLeave={e => { e.currentTarget.style.background = channelOpen ? 'rgba(139,58,82,0.18)' : 'rgba(139,58,82,0.08)'; e.currentTarget.style.color = channelOpen ? '#c96b82' : '#8a6870' }}
      >
        {channelOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Divider */}
      <div style={{
        width: 32, height: 2,
        background: 'linear-gradient(to right, transparent, rgba(139,58,82,0.4), transparent)',
        borderRadius: 1, margin: '2px 0',
        flexShrink: 0,
      }} />

      {/* DM button */}
      <NavIcon
        active={isDM}
        title="Direkt Mesajlar"
        onClick={() => router.push('/app/dm')}
      >
        <MessageCircle size={20} />
      </NavIcon>

      {/* Divider */}
      <div style={{
        width: 32, height: 2,
        background: 'linear-gradient(to right, transparent, rgba(139,58,82,0.4), transparent)',
        borderRadius: 1, margin: '2px 0',
        flexShrink: 0,
      }} />

      {/* Communities */}
      {communities.map((c) => (
        <NavIcon
          key={c.id}
          active={activeCommunityId === c.id}
          title={c.name}
          onClick={() => handleSelect(c.id)}
        >
          {c.icon
            ? <img src={c.icon} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            : <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{c.name[0].toUpperCase()}</span>
          }
        </NavIcon>
      ))}

      {/* Add community */}
      <AddButton onClick={() => setModalOpen(true)} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Divider before profile */}
      <div style={{
        width: 32, height: 2,
        background: 'linear-gradient(to right, transparent, rgba(139,58,82,0.4), transparent)',
        borderRadius: 1, margin: '2px 0',
        flexShrink: 0,
      }} />

      {/* Settings / Profile */}
      <button
        onClick={() => setProfileModalOpen(true)}
        title={`${user?.displayName} — Profil Ayarları`}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
          color: '#f0e4e7', border: 'none', cursor: 'pointer',
          borderRadius: '50%',
          fontSize: '0.875rem', fontWeight: 700,
          transition: 'opacity 0.15s, transform 0.15s',
          boxShadow: '0 2px 8px rgba(139,58,82,0.35)',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.07)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        {user?.displayName?.[0]?.toUpperCase()}
      </button>

      {/* Settings icon */}
      <button
        onClick={() => setProfileModalOpen(true)}
        title="Profil Ayarları"
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', color: '#5a3d45', border: 'none', cursor: 'pointer',
          borderRadius: 10, transition: 'all 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#c4a0ab'; e.currentTarget.style.background = 'rgba(139,58,82,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45'; e.currentTarget.style.background = 'none' }}
      >
        <Settings size={17} />
      </button>

      {/* Logout */}
      <button
        onClick={() => { logout(); router.push('/login') }}
        title="Çıkış Yap"
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', color: '#5a3d45', border: 'none', cursor: 'pointer',
          borderRadius: 10, transition: 'all 0.15s',
          flexShrink: 0,
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

function NavIcon({ active, title, onClick, children }: {
  active: boolean; title: string; onClick: () => void; children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Active indicator */}
      <div style={{
        position: 'absolute',
        left: -12,
        top: '50%',
        transform: `translateY(-50%) scaleY(${active ? 1 : hovered ? 0.5 : 0})`,
        width: 4,
        height: active ? 36 : 18,
        background: '#f0e4e7',
        borderRadius: '0 4px 4px 0',
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
          color: active ? '#f0e4e7' : hovered ? '#f0e4e7' : '#c4a0ab',
          background: active
            ? 'linear-gradient(135deg, #8b3a52, #b04e6a)'
            : hovered ? 'rgba(139,58,82,0.3)' : 'rgba(139,58,82,0.12)',
          borderRadius: active ? '30%' : hovered ? '30%' : '50%',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: active ? '0 4px 16px rgba(139,58,82,0.45)' : 'none',
        }}
      >
        {children}
      </button>
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title="Topluluk Oluştur / Katıl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 48, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? '#f0e4e7' : '#3ba55d',
        background: hovered ? 'rgba(59,165,93,0.25)' : 'rgba(59,165,93,0.12)',
        borderRadius: hovered ? '30%' : '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}
    >
      <Plus size={22} strokeWidth={2.5} />
    </button>
  )
}
