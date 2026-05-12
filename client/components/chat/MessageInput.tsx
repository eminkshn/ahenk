'use client'

import { useState, useRef } from 'react'
import { getSocket } from '@/hooks/useSocket'
import { useAppStore } from '@/store/app'

export default function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const { communities, selectedCommunityId } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="px-4 pb-5 pt-2 shrink-0">
      <div
        className="flex items-center gap-3 px-4 rounded-2xl"
        style={{ background: '#180a0d', border: '1px solid rgba(139,58,82,0.25)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={`#${channel?.name ?? '...'} kanalına mesaj gönder`}
          className="flex-1 bg-transparent py-3.5 outline-none text-sm"
          style={{ color: '#e4d0d4' }}
          disabled={sending}
        />
        <button
          onClick={send}
          disabled={!content.trim() || sending}
          className="text-lg transition-all disabled:opacity-30"
          style={{ color: '#8b3a52' }}
          onMouseEnter={(e) => { if (content.trim()) e.currentTarget.style.color = '#c96b82' }}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8b3a52')}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
