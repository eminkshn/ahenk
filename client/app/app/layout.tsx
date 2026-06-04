'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { useDMStore } from '@/store/dm'
import { useSocket } from '@/hooks/useSocket'
import api from '@/lib/api'
import CommunitySidebar from '@/components/server/CommunitySidebar'
import ChannelSidebar from '@/components/server/ChannelSidebar'
import DMSidebar from '@/components/server/DMSidebar'
import { Background } from '@/components/ui/Background'
import type { Community } from '@/store/app'
import type { Conversation } from '@/store/dm'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, _hasHydrated } = useAuthStore()
  const { setCommunities } = useAppStore()
  const { setConversations } = useDMStore()
  const [channelOpen, setChannelOpen] = useState(true)
  useSocket()

  const isDM = pathname.startsWith('/app/dm')

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.replace('/login')
      return
    }
    api.get('/communities').then(({ data }) => setCommunities(data as Community[]))
    api.get('/conversations').then(({ data }) => setConversations(data as Conversation[])).catch(() => {})
  }, [user, _hasHydrated, router, setCommunities, setConversations])

  if (!_hasHydrated) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)',
      fontFamily: "'Lora', Georgia, serif",
    }}>
      <div style={{ color: 'var(--accent-muted)', fontSize: '0.875rem' }}>Yükleniyor...</div>
    </div>
  )

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080305', color: '#f0e4e7', fontFamily: "'Lora', Georgia, serif" }}>
      <Background />
      <CommunitySidebar channelOpen={channelOpen} onToggle={() => setChannelOpen(v => !v)} />

      {channelOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setChannelOpen(false)}
          />
          {/* sidebar-wrapper: display:contents on desktop (direct flex child),
              position:fixed overlay on mobile — see globals.css */}
          <div className="sidebar-wrapper">
            {isDM ? <DMSidebar /> : <ChannelSidebar />}
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
