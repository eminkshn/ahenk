'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppStore, type Channel, type Category } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import ChannelModal from './ChannelModal'
import InviteModal from './InviteModal'
import ProfileModal from '@/components/ui/ProfileModal'

const surface = { background: '#0e0509', borderRight: '1px solid rgba(139,58,82,0.15)' }

export default function ChannelSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { communities, setCommunities } = useAppStore()
  const { user, logout } = useAuthStore()
  const [channelModalOpen, setChannelModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const parts = pathname.split('/')
  const activeCommunityId = parts[2]
  const activeChannelId = parts[3]

  const community = communities.find((c) => c.id === activeCommunityId)
  const isOwner = community?.ownerId === user?.id

  if (!community) {
    return (
      <div className="w-60 flex flex-col shrink-0" style={surface}>
        <div className="h-12 px-4 flex items-center" style={{ borderBottom: '1px solid rgba(139,58,82,0.15)' }}>
          <span className="font-bold text-sm" style={{ color: '#c96b82' }}>Ahenk</span>
        </div>
      </div>
    )
  }

  const uncategorized = community.channels.filter((ch) => !ch.categoryId).sort((a, b) => a.position - b.position)
  const categorized = community.categories.slice().sort((a, b) => a.position - b.position).map((cat: Category) => ({
    ...cat,
    channels: community.channels.filter((ch: Channel) => ch.categoryId === cat.id).sort((a, b) => a.position - b.position),
  }))

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
    <div className="w-60 flex flex-col shrink-0" style={surface}>
      {/* Header */}
      <div
        className="h-12 px-4 flex items-center justify-between shrink-0 group cursor-default"
        style={{ borderBottom: '1px solid rgba(139,58,82,0.15)' }}
      >
        <span className="font-bold truncate text-sm" style={{ color: '#f0e4e7' }}>{community.name}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconBtn onClick={() => setInviteModalOpen(true)} title="Davet Kodu">🔗</IconBtn>
          {isOwner && (
            <>
              <IconBtn onClick={() => setChannelModalOpen(true)} title="Kanal / Kategori Ekle">+</IconBtn>
              <IconBtn onClick={deleteCommunity} title="Topluluğu Sil" danger>🗑</IconBtn>
            </>
          )}
          {!isOwner && <IconBtn onClick={leaveCommunity} title="Topluluktan Ayrıl" danger>↩</IconBtn>}
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {uncategorized.map((ch) => (
          <ChannelItem key={ch.id} channel={ch} active={ch.id === activeChannelId} isOwner={isOwner}
            onClick={() => router.push(`/app/${community.id}/${ch.id}`)}
            onDelete={() => deleteChannel(ch.id)} />
        ))}

        {categorized.map((cat) => (
          <div key={cat.id} className="mt-4">
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7a5a62' }}>
              {cat.name}
            </p>
            {cat.channels.map((ch: Channel) => (
              <ChannelItem key={ch.id} channel={ch} active={ch.id === activeChannelId} isOwner={isOwner}
                onClick={() => router.push(`/app/${community.id}/${ch.id}`)}
                onDelete={() => deleteChannel(ch.id)} />
            ))}
          </div>
        ))}

        {community.channels.length === 0 && (
          <div className="px-2 py-6 text-center">
            <p className="text-xs mb-2" style={{ color: '#7a5a62' }}>Henüz kanal yok</p>
            {isOwner && (
              <button onClick={() => setChannelModalOpen(true)} className="text-xs hover:underline" style={{ color: '#c96b82' }}>
                İlk kanalı oluştur
              </button>
            )}
          </div>
        )}
      </div>

      {/* User bar */}
      <div className="h-14 px-3 flex items-center gap-2 shrink-0" style={{ background: '#080305', borderTop: '1px solid rgba(139,58,82,0.15)' }}>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}
        >
          {user?.displayName?.[0]?.toUpperCase()}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#f0e4e7' }}>{user?.displayName}</p>
          <p className="text-xs truncate" style={{ color: '#7a5a62' }}>@{user?.username}</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/login') }}
          title="Çıkış"
          className="transition-colors shrink-0 text-lg"
          style={{ color: '#7a5a62' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e85c6a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7a5a62')}
        >
          ⏻
        </button>
      </div>

      <ChannelModal open={channelModalOpen} onClose={() => setChannelModalOpen(false)} communityId={community.id} />
      <InviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} inviteCode={community.inviteCode} communityName={community.name} />
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}

function IconBtn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="text-sm px-1 py-0.5 transition-colors"
      style={{ color: '#7a5a62' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = danger ? '#e85c6a' : '#f0e4e7')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#7a5a62')}
    >
      {children}
    </button>
  )
}

function ChannelItem({ channel, active, isOwner, onClick, onDelete }: {
  channel: Channel; active: boolean; isOwner: boolean; onClick: () => void; onDelete: () => void
}) {
  return (
    <div className="group flex items-center rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-all text-left min-w-0"
        style={{
          background: active ? 'rgba(139,58,82,0.22)' : 'transparent',
          color: active ? '#f0e4e7' : '#9a7a82',
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(139,58,82,0.1)'; e.currentTarget.style.color = '#c4a0a8' } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a7a82' } }}
      >
        <span className="shrink-0 text-sm" style={{ color: active ? '#c96b82' : '#7a5a62' }}>
          {channel.type === 'ANNOUNCEMENT' ? '📢' : '#'}
        </span>
        <span className="truncate">{channel.name}</span>
      </button>
      {isOwner && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 text-xs px-1.5 py-1.5 shrink-0 transition-all"
          style={{ color: '#7a5a62' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e85c6a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7a5a62')}
          title="Kanalı Sil"
        >
          ✕
        </button>
      )}
    </div>
  )
}
