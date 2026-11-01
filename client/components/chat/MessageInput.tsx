'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Clock } from 'lucide-react'
import EmojiPicker from '@/components/ui/EmojiPicker'
import { getSocket } from '@/hooks/useSocket'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

export default function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [focused, setFocused] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [serverError, setServerError] = useState('')
  const { communities, selectedCommunityId } = useAppStore()
  const { user } = useAuthStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const community = communities.find((c) => c.id === selectedCommunityId)
  const channel = community?.channels.find((ch) => ch.id === channelId)

  // Check if current user has admin role (exempt from slow mode)
  const member = community?.members.find((m) => m.userId === user?.id)
  const ADMIN_BIT = 1
  const isAdmin = member?.roles.some((mr) => (parseInt(mr.role.permissions || '0') & ADMIN_BIT) !== 0) ?? false

  // Countdown tick
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function send() {
    const text = content.trim()
    if (!text || sending || (cooldown > 0 && !isAdmin)) return
    const socket = getSocket()
    if (!socket) return
    setSending(true)
    setServerError('')
    socket.emit('message:send', { channelId, content: text }, (result: { ok?: boolean; error?: string }) => {
      setSending(false)
      if (result?.error) {
        setServerError(result.error)
        // If server returns slow mode error, sync our cooldown
        const match = result.error.match(/(\d+) saniye/)
        if (match) setCooldown(parseInt(match[1]))
      } else {
        // Start client-side cooldown only if not admin
        if (channel?.slowMode && !isAdmin) setCooldown(channel.slowMode)
        inputRef.current?.focus()
      }
    })
    setContent('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const blocked = cooldown > 0 && !isAdmin
  const charCount = content.length
  const nearLimit = charCount > 1800

  return (
    <div style={{ padding: '0 16px 20px', flexShrink: 0 }}>
      {/* Slow mode indicator */}
      {channel?.slowMode ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', marginBottom: 6, borderRadius: 8,
          background: blocked ? 'rgba(242,181,68,0.12)' : 'rgba(79,209,165,0.08)',
          border: `1px solid ${blocked ? 'rgba(242,181,68,0.3)' : 'rgba(79,209,165,0.15)'}`,
          fontSize: '0.75rem',
          color: blocked ? '#F2B544' : '#5C626D',
          width: 'fit-content',
        }}>
          <Clock size={11} />
          {blocked
            ? `Yavaş mod: ${cooldown} saniye bekle`
            : isAdmin
              ? `Yavaş mod ${channel.slowMode}s (yönetici — muaf)`
              : `Yavaş mod: ${channel.slowMode}s`}
        </div>
      ) : null}

      {serverError && !blocked && (
        <div style={{ fontSize: '0.75rem', color: '#FF8A7A', marginBottom: 4, paddingLeft: 4 }}>
          {serverError}
        </div>
      )}

      <div style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${focused ? 'rgba(79,209,165,0.5)' : blocked ? 'rgba(242,181,68,0.3)' : 'rgba(79,209,165,0.2)'}`,
        borderRadius: 14,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: focused ? '0 0 0 3px rgba(79,209,165,0.1)' : 'none',
        opacity: blocked ? 0.7 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 14px' }}>
          <div style={{ marginBottom: 2 }}>
            <EmojiPicker onPick={(emoji) => {
              setContent((c) => c + emoji)
              inputRef.current?.focus()
            }} />
          </div>

          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={blocked
              ? `${cooldown} saniye sonra mesaj gönderebilirsin...`
              : `${channel?.name ? `#${channel.name}` : 'kanal'} kanalına mesaj gönder`}
            rows={1}
            maxLength={2000}
            disabled={sending || blocked}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', color: '#D5D8DE', fontSize: '0.9375rem',
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
            disabled={!content.trim() || sending || blocked}
            style={{
              padding: '6px', flexShrink: 0, marginBottom: 2,
              background: content.trim() && !blocked ? 'var(--accent)' : 'rgba(79,209,165,0.1)',
              border: 'none', borderRadius: 8, cursor: content.trim() && !blocked ? 'pointer' : 'not-allowed',
              color: content.trim() && !blocked ? 'var(--accent-ink)' : '#5C626D',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
              boxShadow: content.trim() && !blocked ? '0 2px 8px rgba(79,209,165,0.35)' : 'none',
            }}
            title={blocked ? `${cooldown}s bekle` : 'Gönder (Enter)'}
          >
            {blocked ? <Clock size={16} /> : <Send size={16} />}
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px 8px',
          fontSize: '0.7rem', color: '#5C626D',
        }}>
          <span>Enter → gönder &nbsp;·&nbsp; Shift+Enter → yeni satır</span>
          {nearLimit && (
            <span style={{ color: charCount > 1950 ? '#FF8A7A' : '#F2B544' }}>
              {charCount}/2000
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
