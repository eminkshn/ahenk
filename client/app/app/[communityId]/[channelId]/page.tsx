'use client'

import { useEffect, use, useState } from 'react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { getSocket } from '@/hooks/useSocket'
import api from '@/lib/api'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import MemberList from '@/components/server/MemberList'
import type { Message } from '@/store/app'

export default function ChannelPage({ params }: { params: Promise<{ communityId: string; channelId: string }> }) {
  const { communityId, channelId } = use(params)
  const { communities, setMessages, selectCommunity, selectChannel, setCommunities } = useAppStore()
  const { user } = useAuthStore()
  const [slowModalOpen, setSlowModalOpen] = useState(false)
  const [slowInput, setSlowInput] = useState('')

  const community = communities.find((c) => c.id === communityId)
  const channel = community?.channels.find((ch) => ch.id === channelId)
  const isOwner = community?.ownerId === user?.id

  useEffect(() => {
    selectCommunity(communityId)
    selectChannel(channelId)
    api.get(`/channels/${channelId}/messages`).then(({ data }) => setMessages(channelId, data as Message[]))
    const socket = getSocket()
    socket?.emit('channel:join', channelId)
    return () => { socket?.emit('channel:leave', channelId) }
  }, [channelId, communityId, selectCommunity, selectChannel, setMessages])

  async function setSlowMode() {
    const seconds = parseInt(slowInput) || 0
    try {
      await api.patch(`/communities/${communityId}/channels/${channelId}/slowmode`, { seconds })
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, channels: c.channels.map((ch) => ch.id === channelId ? { ...ch, slowMode: seconds } : ch) }
        : c))
      setSlowModalOpen(false)
    } catch {}
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Channel header */}
        <div
          className="h-12 px-4 flex items-center gap-2 shrink-0"
          style={{ borderBottom: '1px solid rgba(139,58,82,0.15)', background: 'rgba(8,3,5,0.8)' }}
        >
          <span style={{ color: '#8b3a52' }}>{channel?.type === 'ANNOUNCEMENT' ? '📢' : '#'}</span>
          <span className="font-semibold text-sm" style={{ color: '#f0e4e7' }}>{channel?.name ?? channelId}</span>
          {channel?.topic && (
            <>
              <div className="w-px h-4 mx-1" style={{ background: 'rgba(139,58,82,0.3)' }} />
              <span className="text-sm truncate" style={{ color: '#9a7a82' }}>{channel.topic}</span>
            </>
          )}
          <div className="flex-1" />
          {channel?.slowMode ? (
            <span className="text-xs flex items-center gap-1" style={{ color: '#9a7a82' }}>🐌 {channel.slowMode}s</span>
          ) : null}
          {isOwner && (
            <button
              onClick={() => { setSlowInput(String(channel?.slowMode ?? 0)); setSlowModalOpen(true) }}
              title="Yavaş Mod Ayarla"
              className="text-sm transition-colors ml-1"
              style={{ color: '#7a5a62' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a0a8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7a5a62')}
            >
              ⚙️
            </button>
          )}
        </div>

        <MessageList channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>

      <MemberList communityId={communityId} />

      {/* Slow mode modal */}
      {slowModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSlowModalOpen(false)}
        >
          <div
            className="rounded-2xl p-7 w-80 shadow-2xl"
            style={{ background: 'rgba(26,9,15,0.99)', border: '1px solid rgba(139,58,82,0.42)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-1 text-lg" style={{ color: '#f0e4e7' }}>Yavaş Mod</h3>
            <p className="text-xs mb-4 italic" style={{ color: '#7a5a62' }}>Kullanıcılar arasındaki mesaj süresi (saniye). 0 = kapalı.</p>
            <input
              type="number" min={0} max={3600}
              value={slowInput}
              onChange={(e) => setSlowInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none mb-4"
              style={{ background: '#10050a', border: '1px solid rgba(139,58,82,0.3)', color: '#f0e4e7' }}
              onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
              placeholder="Saniye (0 = kapalı)"
            />
            <div className="flex gap-3">
              <button onClick={() => setSlowModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(139,58,82,0.1)', color: '#9a7a82', border: '1px solid rgba(139,58,82,0.2)' }}>
                İptal
              </button>
              <button onClick={setSlowMode}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
