'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { useSocket } from '@/hooks/useSocket'
import api from '@/lib/api'
import CommunitySidebar from '@/components/server/CommunitySidebar'
import ChannelSidebar from '@/components/server/ChannelSidebar'
import DMSidebar from '@/components/server/DMSidebar'
import { Background } from '@/components/ui/Background'
import type { Community } from '@/store/app'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { setCommunities } = useAppStore()
  useSocket()

  const isDM = pathname.startsWith('/app/dm')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
    api.get('/communities').then(({ data }) => setCommunities(data as Community[]))
  }, [user, router, setCommunities])

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080305', color: '#f0e4e7', fontFamily: "'Lora', Georgia, serif" }}>
      <Background />
      <CommunitySidebar />
      {isDM ? <DMSidebar /> : <ChannelSidebar />}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
