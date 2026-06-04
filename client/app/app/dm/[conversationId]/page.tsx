'use client'

import { useEffect, use, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Phone, PhoneOff } from 'lucide-react'
import { getSocket } from '@/hooks/useSocket'
import { useDMStore, type DMMessage } from '@/store/dm'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

const VoiceRoom = dynamic(() => import('@/components/voice/VoiceRoom'), { ssr: false })

export default function DMConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params)
  const { conversations, messages, setMessages } = useDMStore()
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inCall, setInCall] = useState(false)
  const [editContent, setEditContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversation = conversations.find((c) => c.id === conversationId)
  const other = conversation?.participants.find((p) => p.userId !== user?.id)
  const dmMessages = messages[conversationId] || []

  useEffect(() => {
    api.get(`/conversations/${conversationId}/messages`).then(({ data }) => setMessages(conversationId, data as DMMessage[]))
    const socket = getSocket()
    socket?.emit('conversation:join', conversationId)
    return () => { socket?.emit('conversation:leave', conversationId) }
  }, [conversationId, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dmMessages.length])

  function send() {
    const text = content.trim()
    if (!text || sending) return
    const socket = getSocket()
    if (!socket) return
    setSending(true)
    socket.emit('dm:send', { conversationId, content: text }, () => setSending(false))
    setContent('')
  }

  function submitEdit(messageId: string) {
    const text = editContent.trim()
    if (!text) return
    getSocket()?.emit('dm:edit', { messageId, conversationId, content: text })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(139,58,82,0.15)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}>
          {other?.user.displayName[0].toUpperCase()}
        </div>
        <span className="font-semibold text-sm" style={{ color: '#f0e4e7' }}>{other?.user.displayName ?? 'DM'}</span>
        <span className="text-xs" style={{ color: '#7a5a62' }}>@{other?.user.username}</span>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setInCall(v => !v)}
            title={inCall ? 'Aramayı Bitir' : 'Sesli Ara'}
            style={{
              padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              background: inCall ? '#ed4245' : 'rgba(139,58,82,0.15)',
              color: inCall ? '#fff' : '#c96b82',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {inCall ? <PhoneOff size={13} /> : <Phone size={13} />}
            {inCall ? 'Bitir' : 'Sesli Ara'}
          </button>
        </div>
      </div>

      {/* Voice call panel */}
      {inCall && (
        <div style={{
          height: 220, borderBottom: '1px solid rgba(139,58,82,0.2)',
          background: 'rgba(6,2,8,0.7)', flexShrink: 0,
        }}>
          <VoiceRoom roomName={`dm-${conversationId}`} onLeave={() => setInCall(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {dmMessages.length === 0 && (
          <div className="flex items-end h-full pb-2">
            <p className="text-sm italic" style={{ color: '#7a5a62' }}>
              {other?.user.displayName ?? '...'} ile konuşmanın başlangıcı. Merhaba de! 🌸
            </p>
          </div>
        )}
        {dmMessages.map((msg, i) => {
          const prev = dmMessages[i - 1]
          const grouped = prev?.senderId === msg.senderId &&
            new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
          const isMe = msg.senderId === user?.id

          return (
            <div
              key={msg.id}
              className={`flex gap-3 rounded-xl px-3 py-1 group relative ${!grouped ? 'mt-5' : 'mt-0.5'}`}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onDoubleClick={() => isMe && (setEditingId(msg.id), setEditContent(msg.content))}
            >
              {!grouped ? (
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5"
                  style={{ background: isMe ? 'linear-gradient(135deg, #8b3a52, #a84f68)' : 'rgba(139,58,82,0.3)', color: '#f0e4e7' }}>
                  {msg.sender.displayName[0].toUpperCase()}
                </div>
              ) : <div className="w-9 shrink-0" />}

              <div className="flex-1 min-w-0">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-semibold text-sm" style={{ color: isMe ? '#c96b82' : '#f0e4e7' }}>{msg.sender.displayName}</span>
                    <span className="text-xs" style={{ color: '#7a5a62' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {editingId === msg.id ? (
                  <div className="flex gap-2 mt-1">
                    <input autoFocus value={editContent} onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(msg.id) } if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ background: '#10050a', border: '1px solid #8b3a52', color: '#f0e4e7' }} />
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

              {isMe && editingId !== msg.id && (
                <div className="absolute right-3 top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 rounded-xl px-2 py-1 shadow-lg"
                  style={{ background: '#180a0d', border: '1px solid rgba(139,58,82,0.35)' }}>
                  <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content) }}
                    className="text-xs px-1 transition-colors" style={{ color: '#9a7a82' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f0e4e7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}
                    title="Düzenle">✏️</button>
                  <button onClick={() => getSocket()?.emit('dm:delete', { messageId: msg.id, conversationId })}
                    className="text-xs px-1 transition-colors" style={{ color: '#9a7a82' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e85c6a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}
                    title="Sil">🗑</button>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-2 shrink-0">
        <div className="flex items-center gap-3 px-4 rounded-2xl"
          style={{ background: '#180a0d', border: '1px solid rgba(139,58,82,0.25)' }}>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`${other?.user.displayName ?? '...'} kullanıcısına mesaj gönder`}
            className="flex-1 bg-transparent py-3.5 outline-none text-sm"
            style={{ color: '#e4d0d4' }}
            disabled={sending}
          />
          <button onClick={send} disabled={!content.trim() || sending}
            className="text-lg transition-all disabled:opacity-30"
            style={{ color: '#8b3a52' }}
            onMouseEnter={(e) => { if (content.trim()) e.currentTarget.style.color = '#c96b82' }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8b3a52')}>
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
