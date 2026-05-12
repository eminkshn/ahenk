'use client'

import { useState, useRef } from 'react'
import { Send, SmilePlus } from 'lucide-react'
import { getSocket } from '@/hooks/useSocket'
import { useAppStore } from '@/store/app'

export default function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [focused, setFocused] = useState(false)
  const { communities, selectedCommunityId } = useAppStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const community = communities.find((c) => c.id === selectedCommunityId)
  const channel = community?.channels.find((ch) => ch.id === channelId)

  function send() {
    const text = content.trim()
    if (!text || sending) return
    const socket = getSocket()
    if (!socket) return
    setSending(true)
    socket.emit('message:send', { channelId, content: text }, () => {
      setSending(false)
      inputRef.current?.focus()
    })
    setContent('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const charCount = content.length
  const nearLimit = charCount > 1800

  return (
    <div style={{ padding: '0 16px 20px', flexShrink: 0 }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${focused ? 'rgba(139,58,82,0.5)' : 'rgba(139,58,82,0.2)'}`,
        borderRadius: 14,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: focused ? '0 0 0 3px rgba(139,58,82,0.1)' : 'none',
      }}>
        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 14px' }}>
          <button
            style={{
              padding: '4px', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5a3d45', borderRadius: 6,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
              marginBottom: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c96b82')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a3d45')}
            title="Emoji (yakında)"
          >
            <SmilePlus size={18} />
          </button>

          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`${channel?.name ? `#${channel.name}` : 'kanal'} kanalına mesaj gönder`}
            rows={1}
            maxLength={2000}
            disabled={sending}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', color: '#e4d0d4', fontSize: '0.9375rem',
              lineHeight: 1.5, fontFamily: 'inherit',
              maxHeight: 160, overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 160) + 'px'
            }}
          />

          <button
            onClick={send}
            disabled={!content.trim() || sending}
            style={{
              padding: '6px', flexShrink: 0, marginBottom: 2,
              background: content.trim() ? 'linear-gradient(135deg, #8b3a52, #b04e6a)' : 'rgba(139,58,82,0.1)',
              border: 'none', borderRadius: 8, cursor: content.trim() ? 'pointer' : 'not-allowed',
              color: content.trim() ? '#f0e4e7' : '#5a3d45',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
              boxShadow: content.trim() ? '0 2px 8px rgba(139,58,82,0.35)' : 'none',
            }}
            onMouseEnter={e => { if (content.trim()) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            title="Gönder (Enter)"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px 8px',
          fontSize: '0.7rem', color: '#5a3d45',
        }}>
          <span>Enter → gönder &nbsp;·&nbsp; Shift+Enter → yeni satır</span>
          {nearLimit && (
            <span style={{ color: charCount > 1950 ? '#e85c6a' : '#faa61a' }}>
              {charCount}/2000
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
