'use client'

import { useEffect, use, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Hash, Megaphone, Users, Settings, Clock, Volume2 } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { getSocket } from '@/hooks/useSocket'
import api from '@/lib/api'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import MemberList from '@/components/server/MemberList'
import type { Message } from '@/store/app'

const VoiceRoom = dynamic(() => import('@/components/voice/VoiceRoom'), { ssr: false })

export default function ChannelPage({ params }: { params: Promise<{ communityId: string; channelId: string }> }) {
  const { communityId, channelId } = use(params)
  const { communities, setMessages, selectCommunity, selectChannel, setCommunities } = useAppStore()
  const { user } = useAuthStore()
  const [slowModalOpen, setSlowModalOpen] = useState(false)
  const [slowInput, setSlowInput] = useState('')
  const [showMembers, setShowMembers] = useState(false) // starts hidden; desktop opens via useEffect
  const [inVoice, setInVoice] = useState(false)
  const memberSwipeStart = useRef<{ x: number; y: number } | null>(null)

  // On desktop, show members by default
  useEffect(() => {
    if (window.innerWidth >= 768) setShowMembers(true)
  }, [])

  function handleMemberTouchStart(e: React.TouchEvent) {
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    // Track if starting from right edge (to open) OR anywhere (to close when open)
    if (x < window.innerWidth - 36 && !showMembers) return
    memberSwipeStart.current = { x, y }
  }

  function handleMemberTouchEnd(e: React.TouchEvent) {
    if (!memberSwipeStart.current) return
    const dx = e.changedTouches[0].clientX - memberSwipeStart.current.x
    const dy = e.changedTouches[0].clientY - memberSwipeStart.current.y
    memberSwipeStart.current = null
    if (Math.abs(dx) < 56 || Math.abs(dy) > 72) return
    if (dx < 0 && !showMembers) setShowMembers(true)
    else if (dx > 0 && showMembers) setShowMembers(false)
  }

  const community = communities.find((c) => c.id === communityId)
  const channel = community?.channels.find((ch) => ch.id === channelId)
  const isOwner = community?.ownerId === user?.id
  const isVoice = channel?.type === 'VOICE'
  const ChannelIcon = channel?.type === 'ANNOUNCEMENT' ? Megaphone : isVoice ? Volume2 : Hash

  useEffect(() => {
    selectCommunity(communityId)
    selectChannel(channelId)
    Promise.all([
      api.get(`/channels/${channelId}/messages`),
      api.get(`/channels/${channelId}/starred`).catch(() => ({ data: [] })),
    ]).then(([{ data: msgs }, { data: starred }]) => {
      const starredIds = new Set((starred as Message[]).map(m => m.id))
      setMessages(channelId, (msgs as Message[]).map(m => ({ ...m, starred: starredIds.has(m.id) })))
    })
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
    <div
      style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
      onTouchStart={handleMemberTouchStart}
      onTouchEnd={handleMemberTouchEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Channel header */}
        <div style={{
          height: 48,
          padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(6,2,8,0.6)',
          backdropFilter: 'blur(8px)',
        }}>
          <ChannelIcon size={17} style={{ color: '#8b3a52', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f0e4e7' }}>
            {channel?.name ?? channelId}
          </span>

          {channel?.topic && (
            <>
              <div style={{ width: 1, height: 16, background: 'rgba(139,58,82,0.3)', margin: '0 4px' }} />
              <span style={{ fontSize: '0.8125rem', color: '#5a3d45', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {channel.topic}
              </span>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {channel?.slowMode ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.75rem', color: '#8a6870',
                padding: '2px 8px', borderRadius: 12,
                background: 'rgba(139,58,82,0.1)',
                border: '1px solid rgba(139,58,82,0.2)',
              }}>
                <Clock size={11} />
                {channel.slowMode}s yavaş mod
              </div>
            ) : null}

            {isOwner && (
              <button
                onClick={() => { setSlowInput(String(channel?.slowMode ?? 0)); setSlowModalOpen(true) }}
                title="Kanal Ayarları"
                style={{
                  padding: '5px', background: 'none', border: 'none', cursor: 'pointer',
                  color: '#5a3d45', borderRadius: 6, display: 'flex', alignItems: 'center',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c4a0ab'; e.currentTarget.style.background = 'rgba(139,58,82,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45'; e.currentTarget.style.background = 'none' }}
              >
                <Settings size={15} />
              </button>
            )}

            <button
              onClick={() => setShowMembers(v => !v)}
              title={showMembers ? 'Üyeleri Gizle' : 'Üyeleri Göster'}
              style={{
                padding: '5px', border: 'none', cursor: 'pointer',
                color: showMembers ? '#c96b82' : '#5a3d45', borderRadius: 6, display: 'flex', alignItems: 'center',
                transition: 'color 0.15s, background 0.15s',
                background: showMembers ? 'rgba(139,58,82,0.12)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#c4a0ab' }}
              onMouseLeave={e => { e.currentTarget.style.color = showMembers ? '#c96b82' : '#5a3d45' }}
            >
              <Users size={15} />
            </button>
          </div>
        </div>

        {isVoice ? (
          inVoice ? (
            <VoiceRoom roomName={`channel-${channelId}`} onLeave={() => setInVoice(false)} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Volume2 size={48} style={{ color: '#5a3d45' }} />
              <p style={{ color: '#8a6870', fontSize: '0.9375rem' }}>Ses kanalına katıl</p>
              <button
                onClick={() => setInVoice(true)}
                style={{
                  padding: '12px 28px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
                  color: '#f0e4e7', border: 'none', cursor: 'pointer',
                  fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(139,58,82,0.45)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Kanala Katıl
              </button>
            </div>
          )
        ) : (
          <>
            <MessageList channelId={channelId} />
            <MessageInput channelId={channelId} />
          </>
        )}
      </div>

      {showMembers && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowMembers(false)}
          />
          {/* member-list-wrapper: display:contents on desktop, fixed right overlay on mobile */}
          <div className="member-list-wrapper">
            <MemberList communityId={communityId} />
          </div>
        </>
      )}

      {/* Slow mode modal */}
      {slowModalOpen && (
        <div
          onClick={() => setSlowModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-scale-in"
            style={{
              background: 'rgba(19,7,24,0.98)',
              border: '1px solid rgba(139,58,82,0.4)',
              borderRadius: 18,
              padding: '28px 28px 24px',
              width: 320,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Clock size={18} style={{ color: '#c96b82' }} />
              <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#f0e4e7' }}>Yavaş Mod</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#5a3d45', fontStyle: 'italic', marginBottom: 20 }}>
              Kullanıcılar arası mesaj aralığı (saniye). 0 = kapalı.
            </p>
            <input
              type="number" min={0} max={3600}
              value={slowInput}
              onChange={e => setSlowInput(e.target.value)}
              className="input-base"
              placeholder="Saniye (0 = kapalı)"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9375rem', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSlowModalOpen(false)} className="btn-ghost"
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                İptal
              </button>
              <button onClick={setSlowMode} className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
