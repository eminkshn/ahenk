'use client'

import { useEffect, useState, useRef } from 'react'
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
import NotificationPrompt from '@/components/ui/NotificationPrompt'
import type { Community } from '@/store/app'
import type { Conversation } from '@/store/dm'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, _hasHydrated } = useAuthStore()
  const { setCommunities } = useAppStore()
  const { setConversations } = useDMStore()
  const [channelOpen, setChannelOpen] = useState(true)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  useSocket()

  function handleTouchStart(e: React.TouchEvent) {
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    // Track if starting from left edge (to open) OR anywhere (to close when open)
    if (x > 36 && !channelOpen) return
    swipeStart.current = { x, y }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!swipeStart.current) return
    const dx = e.changedTouches[0].clientX - swipeStart.current.x
    const dy = e.changedTouches[0].clientY - swipeStart.current.y
    swipeStart.current = null
    if (Math.abs(dx) < 56 || Math.abs(dy) > 72) return
    if (dx > 0 && !channelOpen) setChannelOpen(true)
    else if (dx < 0 && channelOpen) setChannelOpen(false)
  }

  const isDM = pathname.startsWith('/app/dm')

  // Kanal/sohbet seçilince mobilde kenar çubuğunu kapat (içerik görünsün)
  function closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setChannelOpen(false)
    }
  }

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.replace('/login')
      return
    }
    api.get('/communities').then(({ data }) => setCommunities(data as Community[])).catch(() => {})
    api.get('/conversations').then(({ data }) => {
      setConversations(data as Conversation[])
      // İlk açılışta boş /app yerine en son sohbet (yoksa mesajlar ekranı)
      if (window.location.pathname === '/app') {
        const last = (data as Conversation[])[0]
        router.replace(last ? `/app/dm/${last.id}` : '/app/dm')
      }
    }).catch(() => {
      if (window.location.pathname === '/app') router.replace('/app/dm')
    })
  }, [user, _hasHydrated, router, setCommunities, setConversations])

  // Logo/geri gibi yollarla boş /app'e gelinirse de anlamlı ekrana götür
  useEffect(() => {
    if (!_hasHydrated || !user || pathname !== '/app') return
    const last = useDMStore.getState().conversations[0]
    router.replace(last ? `/app/dm/${last.id}` : '/app/dm')
  }, [pathname, _hasHydrated, user, router])

  if (!_hasHydrated) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ color: 'var(--accent-muted)', fontSize: '0.875rem' }}>Yükleniyor...</div>
    </div>
  )

  if (!user) return null

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0B0D10', color: '#E8EAEE', fontFamily: 'var(--font-body)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
            {isDM ? <DMSidebar onNavigate={closeSidebarOnMobile} /> : <ChannelSidebar onNavigate={closeSidebarOnMobile} />}
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <NotificationPrompt />
        {children}
      </main>
    </div>
  )
}
