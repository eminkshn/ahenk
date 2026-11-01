'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Users } from 'lucide-react'
import { useDMStore } from '@/store/dm'
import { useAuthStore } from '@/store/auth'

const surface = { background: '#12151A', borderRight: '1px solid rgba(79,209,165,0.15)' }

export default function DMSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { conversations } = useDMStore()
  const { user } = useAuthStore()

  const activeId = pathname.split('/')[3]

  // Deduplicate: one entry per other participant (keep most recent)
  const seen = new Set<string>()
  const uniqueConversations = conversations.filter((conv) => {
    const other = conv.participants.find((p) => p.userId !== user?.id)
    if (!other || seen.has(other.userId)) return false
    seen.add(other.userId)
    return true
  })

  return (
    <div className="w-60 flex flex-col shrink-0" style={surface}>
      <div className="h-12 px-4 flex items-center shrink-0" style={{ borderBottom: '1px solid rgba(79,209,165,0.15)' }}>
        <span className="font-bold text-sm" style={{ color: '#E8EAEE' }}>Direkt Mesajlar</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        <button
          onClick={() => { router.push('/app/dm'); onNavigate?.() }}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all mb-1"
          style={{
            background: pathname === '/app/dm' ? 'rgba(79,209,165,0.22)' : 'transparent',
            color: pathname === '/app/dm' ? '#E8EAEE' : '#9AA1AD',
          }}
          onMouseEnter={(e) => { if (pathname !== '/app/dm') { e.currentTarget.style.background = 'rgba(79,209,165,0.1)'; e.currentTarget.style.color = '#C9CDD4' } }}
          onMouseLeave={(e) => { if (pathname !== '/app/dm') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9AA1AD' } }}
        >
          <Users size={18} />
          <span className="font-medium">Arkadaşlar</span>
        </button>

        {uniqueConversations.length > 0 && (
          <p className="px-2 mt-3 mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7C838F' }}>
            Mesajlar
          </p>
        )}

        {uniqueConversations.map((conv) => {
          const other = conv.participants.find((p) => p.userId !== user?.id)
          if (!other) return null
          const active = conv.id === activeId
          return (
            <button
              key={conv.id}
              onClick={() => { router.push(`/app/dm/${conv.id}`); onNavigate?.() }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: active ? 'rgba(79,209,165,0.22)' : 'transparent',
                color: active ? '#E8EAEE' : '#9AA1AD',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(79,209,165,0.1)'; e.currentTarget.style.color = '#C9CDD4' } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9AA1AD' } }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                {other.user.displayName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate font-medium" style={{ color: active ? '#E8EAEE' : '#C9CDD4' }}>
                  {other.user.displayName}
                </p>
                <p className="text-xs truncate" style={{ color: '#7C838F' }}>@{other.user.username}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
