'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { getSocket } from '@/hooks/useSocket'

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function MessageList({ channelId }: { channelId: string }) {
  const { messages } = useAppStore()
  const { user } = useAuthStore()
  const channelMessages = messages[channelId] || []
  const bottomRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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
      <div className="flex-1 flex items-end px-6 pb-6 text-sm italic" style={{ color: '#7a5a62' }}>
        <p>Bu kanalda henüz mesaj yok. İlk mesajı sen gönder! 🌸</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4" style={{ gap: 0 }}>
      {channelMessages.map((msg, i) => {
        const prev = channelMessages[i - 1]
        const grouped = prev?.author.id === msg.author.id &&
          new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
        const isMe = msg.author.id === user?.id

        return (
          <div
            key={msg.id}
            className={`flex gap-3 rounded-xl px-3 py-1 group relative ${!grouped ? 'mt-5' : 'mt-0.5'}`}
            style={{ transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.07)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onDoubleClick={() => isMe && (setEditingId(msg.id), setEditContent(msg.content))}
          >
            {!grouped ? (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5"
                style={{ background: isMe ? 'linear-gradient(135deg, #8b3a52, #a84f68)' : 'rgba(139,58,82,0.3)', color: '#f0e4e7' }}
              >
                {msg.author.displayName[0].toUpperCase()}
              </div>
            ) : (
              <div className="w-9 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              {!grouped && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: isMe ? '#c96b82' : '#f0e4e7' }}>
                    {msg.author.displayName}
                  </span>
                  <span className="text-xs" style={{ color: '#7a5a62' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {editingId === msg.id ? (
                <div className="flex gap-2 mt-1">
                  <input
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(msg.id) }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ background: '#10050a', border: '1px solid #8b3a52', color: '#f0e4e7' }}
                  />
                  <button onClick={() => submitEdit(msg.id)} className="text-xs font-semibold hover:underline" style={{ color: '#c96b82' }}>Kaydet</button>
                  <button onClick={() => setEditingId(null)} className="text-xs hover:underline" style={{ color: '#7a5a62' }}>İptal</button>
                </div>
              ) : (
                <p className="text-sm leading-relaxed break-words" style={{ color: '#e4d0d4' }}>
                  {msg.content}
                  {msg.edited && <span className="text-xs ml-1.5 italic" style={{ color: '#7a5a62' }}>(düzenlendi)</span>}
                </p>
              )}
            </div>

            {/* Hover toolbar */}
            {editingId !== msg.id && (
              <div
                className="absolute right-3 top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 rounded-xl px-2 py-1 shadow-lg"
                style={{ background: '#180a0d', border: '1px solid rgba(139,58,82,0.35)' }}
              >
                {REACTIONS.map((emoji) => (
                  <button key={emoji} onClick={() => getSocket()?.emit('message:react', { messageId: msg.id, channelId, emoji })}
                    className="text-sm px-0.5 transition-transform hover:scale-125" title={emoji}>
                    {emoji}
                  </button>
                ))}
                {isMe && (
                  <>
                    <div className="w-px h-4 mx-1" style={{ background: 'rgba(139,58,82,0.3)' }} />
                    <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content) }}
                      className="text-xs px-1 transition-colors" style={{ color: '#9a7a82' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#f0e4e7')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}
                      title="Düzenle">✏️</button>
                    <button onClick={() => getSocket()?.emit('message:delete', { messageId: msg.id, channelId })}
                      className="text-xs px-1 transition-colors" style={{ color: '#9a7a82' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#e85c6a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}
                      title="Sil">🗑</button>
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
