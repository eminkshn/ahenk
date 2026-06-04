'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2, Star } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { getSocket } from '@/hooks/useSocket'
import api from '@/lib/api'

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function MessageList({ channelId }: { channelId: string }) {
  const { messages, updateMessage } = useAppStore()
  const { user } = useAuthStore()
  const channelMessages = messages[channelId] || []
  const bottomRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  async function toggleStar(msg: typeof channelMessages[number]) {
    try {
      if (msg.starred) {
        await api.delete(`/channels/${channelId}/messages/${msg.id}/star`)
        updateMessage({ ...msg, starred: false })
      } else {
        await api.post(`/channels/${channelId}/messages/${msg.id}/star`)
        updateMessage({ ...msg, starred: true })
      }
    } catch {}
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length])

  function submitEdit(messageId: string) {
    const text = editContent.trim()
    if (!text) return
    getSocket()?.emit('message:edit', { messageId, channelId, content: text })
    setEditingId(null)
  }

  if (channelMessages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px 24px' }}>
        <div style={{ textAlign: 'center', padding: '32px 24px', maxWidth: 320 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
          <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#f0e4e7', marginBottom: 6 }}>
            Konuşmayı sen başlat!
          </p>
          <p style={{ fontSize: '0.875rem', color: '#5a3d45', fontStyle: 'italic' }}>
            Bu kanalda henüz mesaj yok. İlk mesajı gönder. 🌸
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0 8px' }}>
      {channelMessages.map((msg, i) => {
        const prev = channelMessages[i - 1]
        const grouped = prev?.author.id === msg.author.id &&
          new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
        const isMe = msg.author.id === user?.id
        const isHovered = hoveredId === msg.id

        return (
          <div
            key={msg.id}
            onMouseEnter={() => setHoveredId(msg.id)}
            onMouseLeave={() => setHoveredId(null)}
            onDoubleClick={() => isMe && editingId !== msg.id && (setEditingId(msg.id), setEditContent(msg.content))}
            style={{
              display: 'flex',
              gap: 12,
              padding: `${grouped ? 2 : 16}px 16px ${grouped ? 1 : 2}px`,
              background: isHovered ? 'rgba(139,58,82,0.05)' : 'transparent',
              transition: 'background 0.1s',
              position: 'relative',
              marginTop: grouped ? 0 : 4,
            }}
          >
            {/* Avatar */}
            {!grouped ? (
              <div style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: isMe
                  ? 'linear-gradient(135deg, #8b3a52, #b04e6a)'
                  : 'linear-gradient(135deg, #2d1420, #4a2030)',
                color: '#f0e4e7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700,
                flexShrink: 0, marginTop: 2,
                boxShadow: isMe ? '0 2px 8px rgba(139,58,82,0.3)' : 'none',
              }}>
                {msg.author.displayName[0].toUpperCase()}
              </div>
            ) : (
              <div style={{ width: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                {isHovered && (
                  <span style={{ fontSize: '0.625rem', color: '#5a3d45' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {msg.starred && !isHovered && (
                  <span style={{ fontSize: '0.625rem', color: '#faa61a' }}>★</span>
                )}
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!grouped && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: isMe ? '#c96b82' : '#f0e4e7' }}>
                    {msg.author.displayName}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#5a3d45' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.starred && (
                    <span title="Yıldızlanan mesaj" style={{ fontSize: '0.7rem', color: '#faa61a', lineHeight: 1 }}>★</span>
                  )}
                </div>
              )}

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && editingId !== msg.id && (() => {
                const grouped = msg.reactions.reduce<Record<string, { emoji: string; users: string[]; userIds: string[] }>>((acc, r) => {
                  if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, users: [], userIds: [] }
                  acc[r.emoji].users.push(r.user?.username ?? r.userId)
                  acc[r.emoji].userIds.push(r.userId)
                  return acc
                }, {})
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {Object.values(grouped).map(({ emoji, users, userIds }) => {
                      const iReacted = userIds.includes(user?.id ?? '')
                      return (
                        <button
                          key={emoji}
                          onClick={() => getSocket()?.emit('message:react', { messageId: msg.id, channelId, emoji })}
                          title={users.join(', ')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 12,
                            background: iReacted ? 'rgba(139,58,82,0.25)' : 'rgba(139,58,82,0.1)',
                            border: iReacted ? '1px solid rgba(139,58,82,0.5)' : '1px solid rgba(139,58,82,0.2)',
                            cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1,
                            transition: 'all 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,82,0.3)')}
                          onMouseLeave={e => (e.currentTarget.style.background = iReacted ? 'rgba(139,58,82,0.25)' : 'rgba(139,58,82,0.1)')}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: iReacted ? '#c96b82' : '#8a6870' }}>
                            {users.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })()}

              {editingId === msg.id ? (
                <div style={{ marginTop: 4 }}>
                  <textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(msg.id) }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    rows={2}
                    style={{
                      width: '100%', padding: '8px 12px',
                      background: 'var(--bg-input)', border: '1px solid #8b3a52',
                      borderRadius: 8, color: '#f0e4e7', fontSize: '0.9375rem',
                      outline: 'none', resize: 'none', fontFamily: 'inherit',
                      boxShadow: '0 0 0 3px rgba(139,58,82,0.15)',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem' }}>
                    <button onClick={() => submitEdit(msg.id)} style={{ color: '#c96b82', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      Kaydet
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ color: '#5a3d45', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      İptal (Esc)
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, color: '#ddc8cc', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  {msg.edited && <span style={{ fontSize: '0.7rem', marginLeft: 6, color: '#5a3d45', fontStyle: 'italic' }}>(düzenlendi)</span>}
                </p>
              )}
            </div>

            {/* Hover toolbar */}
            {editingId !== msg.id && isHovered && (
              <div style={{
                position: 'absolute',
                right: 16, top: -18,
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: 10,
                padding: '4px 6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                zIndex: 10,
              }}>
                <button
                  onClick={() => toggleStar(msg)}
                  title={msg.starred ? 'Yıldızı kaldır' : 'Yıldızla'}
                  style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 5, display: 'flex', transition: 'color 0.1s, background 0.1s', color: msg.starred ? '#faa61a' : '#8a6870' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#faa61a'; e.currentTarget.style.background = 'rgba(250,166,26,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = msg.starred ? '#faa61a' : '#8a6870'; e.currentTarget.style.background = 'none' }}
                >
                  <Star size={13} fill={msg.starred ? '#faa61a' : 'none'} />
                </button>
                <div style={{ width: 1, height: 16, background: 'rgba(139,58,82,0.3)', margin: '0 2px' }} />
                {REACTIONS.map((emoji) => (
                  <button key={emoji}
                    onClick={() => getSocket()?.emit('message:react', { messageId: msg.id, channelId, emoji })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.9375rem', padding: '2px 3px', borderRadius: 5,
                      transition: 'transform 0.1s, background 0.1s',
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.background = 'rgba(139,58,82,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'none' }}
                    title={emoji}>
                    {emoji}
                  </button>
                ))}
                {isMe && (
                  <>
                    <div style={{ width: 1, height: 16, background: 'rgba(139,58,82,0.3)', margin: '0 4px' }} />
                    <button
                      onClick={() => { setEditingId(msg.id); setEditContent(msg.content) }}
                      style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', color: '#8a6870', borderRadius: 5, display: 'flex', transition: 'color 0.1s, background 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f0e4e7'; e.currentTarget.style.background = 'rgba(139,58,82,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#8a6870'; e.currentTarget.style.background = 'none' }}
                      title="Düzenle"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => getSocket()?.emit('message:delete', { messageId: msg.id, channelId })}
                      style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', color: '#8a6870', borderRadius: 5, display: 'flex', transition: 'color 0.1s, background 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e85c6a'; e.currentTarget.style.background = 'rgba(232,92,106,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#8a6870'; e.currentTarget.style.background = 'none' }}
                      title="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
