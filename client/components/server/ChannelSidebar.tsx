'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Hash, Megaphone, ChevronDown, ChevronRight, UserPlus, Plus, Trash2, LogOut, Settings, LogIn } from 'lucide-react'
import { useAppStore, type Channel, type Category } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import ChannelModal from './ChannelModal'
import InviteModal from './InviteModal'
import ProfileModal from '@/components/ui/ProfileModal'

export default function ChannelSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { communities, setCommunities } = useAppStore()
  const { user, logout } = useAuthStore()
  const [channelModalOpen, setChannelModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())

  const parts = pathname.split('/')
  const activeCommunityId = parts[2]
  const activeChannelId = parts[3]

  const community = communities.find((c) => c.id === activeCommunityId)
  const isOwner = community?.ownerId === user?.id

  if (!community) {
    return (
      <div style={sidebarStyle}>
        <div style={headerStyle}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#c96b82' }}>Ahenk</span>
        </div>
      </div>
    )
  }

  const uncategorized = community.channels.filter((ch) => !ch.categoryId).sort((a, b) => a.position - b.position)
  const categorized = community.categories.slice().sort((a, b) => a.position - b.position).map((cat: Category) => ({
    ...cat,
    channels: community.channels.filter((ch: Channel) => ch.categoryId === cat.id).sort((a, b) => a.position - b.position),
  }))

  function toggleCat(id: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteChannel(channelId: string) {
    try {
      await api.delete(`/communities/${community!.id}/channels/${channelId}`)
      setCommunities(communities.map((c) => c.id === community!.id ? { ...c, channels: c.channels.filter((ch) => ch.id !== channelId) } : c))
      if (activeChannelId === channelId) router.push('/app')
    } catch {}
  }

  async function leaveCommunity() {
    try {
      await api.post(`/communities/${community!.id}/leave`)
      setCommunities(communities.filter((c) => c.id !== community!.id))
      router.push('/app')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      alert(e.response?.data?.error || 'Hata oluştu')
    }
  }

  async function deleteCommunity() {
    if (!confirm(`"${community!.name}" topluluğunu silmek istediğine emin misin?`)) return
    try {
      await api.delete(`/communities/${community!.id}`)
      setCommunities(communities.filter((c) => c.id !== community!.id))
      router.push('/app')
    } catch {}
  }

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={{
        ...headerStyle,
        flexDirection: 'column',
        alignItems: 'stretch',
        height: 'auto',
        padding: '12px 16px 10px',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f0e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {community.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HeaderBtn onClick={() => setInviteModalOpen(true)} title="Davet Linki"><UserPlus size={14} /></HeaderBtn>
            {isOwner && <>
              <HeaderBtn onClick={() => setChannelModalOpen(true)} title="Kanal Ekle"><Plus size={14} /></HeaderBtn>
              <HeaderBtn onClick={deleteCommunity} title="Topluluğu Sil" danger><Trash2 size={13} /></HeaderBtn>
            </>}
            {!isOwner && <HeaderBtn onClick={leaveCommunity} title="Ayrıl" danger><LogOut size={13} /></HeaderBtn>}
          </div>
        </div>
        {/* Member count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#5a3d45' }}>
            <span style={{ color: '#3ba55d' }}>●</span> {community.members?.filter(m => m.user.status !== 'OFFLINE').length ?? 0} çevrimiçi
          </span>
          <span style={{ fontSize: '0.7rem', color: '#5a3d45' }}>·</span>
          <span style={{ fontSize: '0.7rem', color: '#5a3d45' }}>{community.members?.length ?? 0} üye</span>
        </div>
      </div>

      {/* Channels */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {uncategorized.map((ch) => (
          <ChannelItem key={ch.id} channel={ch} active={ch.id === activeChannelId} isOwner={isOwner}
            onClick={() => router.push(`/app/${community.id}/${ch.id}`)}
            onDelete={() => deleteChannel(ch.id)} />
        ))}

        {categorized.map((cat) => {
          const collapsed = collapsedCats.has(cat.id)
          return (
            <div key={cat.id} style={{ marginTop: 16 }}>
              <button
                onClick={() => toggleCat(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  width: '100%', padding: '2px 6px 4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#5a3d45',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c4a0ab')}
                onMouseLeave={e => (e.currentTarget.style.color = '#5a3d45')}
              >
                {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  {cat.name}
                </span>
              </button>
              {!collapsed && cat.channels.map((ch: Channel) => (
                <ChannelItem key={ch.id} channel={ch} active={ch.id === activeChannelId} isOwner={isOwner}
                  onClick={() => router.push(`/app/${community.id}/${ch.id}`)}
                  onDelete={() => deleteChannel(ch.id)} />
              ))}
            </div>
          )
        })}

        {community.channels.length === 0 && (
          <div style={{ padding: '24px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📡</div>
            <p style={{ fontSize: '0.8125rem', color: '#5a3d45', marginBottom: 8 }}>Henüz kanal yok</p>
            {isOwner && (
              <button onClick={() => setChannelModalOpen(true)}
                style={{ fontSize: '0.8125rem', color: '#c96b82', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                İlk kanalı oluştur
              </button>
            )}
          </div>
        )}
      </div>

      {/* User bar */}
      <div style={{
        height: 56, padding: '0 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(6,2,8,0.8)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setProfileModalOpen(true)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
            background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
            color: '#f0e4e7', border: 'none', cursor: 'pointer',
            transition: 'opacity 0.15s, transform 0.15s',
            boxShadow: '0 2px 8px rgba(139,58,82,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          {user?.displayName?.[0]?.toUpperCase()}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f0e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#5a3d45', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            @{user?.username}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconAction onClick={() => setProfileModalOpen(true)} title="Ayarlar"><Settings size={15} /></IconAction>
          <IconAction onClick={() => { logout(); router.push('/login') }} title="Çıkış" danger><LogIn size={15} style={{ transform: 'rotate(180deg)' }} /></IconAction>
        </div>
      </div>

      <ChannelModal open={channelModalOpen} onClose={() => setChannelModalOpen(false)} communityId={community.id} />
      <InviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} inviteCode={community.inviteCode} communityName={community.name} />
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}

const sidebarStyle: React.CSSProperties = {
  width: 240,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  background: 'var(--bg-surface)',
  borderRight: '1px solid var(--border)',
}

const headerStyle: React.CSSProperties = {
  height: 48,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderBottom: '1px solid var(--border)',
  boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
}

function HeaderBtn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      padding: '4px 5px', background: 'none', border: 'none', cursor: 'pointer',
      color: '#5a3d45', display: 'flex', alignItems: 'center', borderRadius: 6,
      transition: 'color 0.15s, background 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = danger ? '#e85c6a' : '#f0e4e7'; e.currentTarget.style.background = danger ? 'rgba(232,92,106,0.1)' : 'rgba(139,58,82,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45'; e.currentTarget.style.background = 'none' }}>
      {children}
    </button>
  )
}

function IconAction({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      padding: '5px', background: 'none', border: 'none', cursor: 'pointer',
      color: '#5a3d45', display: 'flex', alignItems: 'center', borderRadius: 6,
      transition: 'color 0.15s, background 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = danger ? '#e85c6a' : '#c4a0ab'; e.currentTarget.style.background = danger ? 'rgba(232,92,106,0.1)' : 'rgba(139,58,82,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45'; e.currentTarget.style.background = 'none' }}>
      {children}
    </button>
  )
}

function ChannelItem({ channel, active, isOwner, onClick, onDelete }: {
  channel: Channel; active: boolean; isOwner: boolean; onClick: () => void; onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = channel.type === 'ANNOUNCEMENT' ? Megaphone : Hash

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onClick}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px', borderRadius: 6,
          background: active ? 'rgba(139,58,82,0.2)' : hovered ? 'rgba(139,58,82,0.1)' : 'transparent',
          color: active ? '#f0e4e7' : hovered ? '#c4a0ab' : '#8a6870',
          border: active ? '1px solid rgba(139,58,82,0.25)' : '1px solid transparent',
          cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
          transition: 'all 0.12s',
          fontFamily: 'inherit',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Icon size={15} style={{ color: active ? '#c96b82' : hovered ? '#8b3a52' : '#5a3d45', flexShrink: 0, transition: 'color 0.12s' }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{channel.name}</span>
        {channel.type === 'ANNOUNCEMENT' && (
          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(139,58,82,0.2)', color: '#c96b82', flexShrink: 0 }}>
            duyuru
          </span>
        )}
      </button>
      {isOwner && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute', right: 4,
            padding: '3px', background: 'rgba(232,92,106,0.1)', border: 'none',
            borderRadius: 4, cursor: 'pointer', color: '#e85c6a',
            display: 'flex', alignItems: 'center',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,92,106,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(232,92,106,0.1)')}
          title="Kanalı Sil"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
