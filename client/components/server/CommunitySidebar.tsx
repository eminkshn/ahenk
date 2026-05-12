'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app'
import CommunityModal from './CommunityModal'

export default function CommunitySidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { communities } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)

  function handleSelect(communityId: string) {
    const community = communities.find((c) => c.id === communityId)
    const first = community?.channels.slice().sort((a, b) => a.position - b.position)[0]
    router.push(first ? `/app/${communityId}/${first.id}` : `/app`)
  }

  const activeCommunityId = pathname.split('/')[2]
  const isDM = pathname.startsWith('/app/dm')

  return (
    <div
      className="w-[72px] flex flex-col items-center pt-3 pb-3 gap-2 overflow-y-auto shrink-0"
      style={{ background: '#080305', borderRight: '1px solid rgba(139,58,82,0.12)' }}
    >
      {/* DM / Home */}
      <SidebarIcon
        active={isDM}
        title="Direkt Mesajlar"
        onClick={() => router.push('/app/dm')}
      >
        💬
      </SidebarIcon>

      <div className="w-8 h-px my-1" style={{ background: 'rgba(139,58,82,0.3)' }} />

      {communities.map((c) => (
        <SidebarIcon
          key={c.id}
          active={activeCommunityId === c.id}
          title={c.name}
          onClick={() => handleSelect(c.id)}
        >
          {c.icon
            ? <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
            : <span className="text-base font-bold">{c.name[0].toUpperCase()}</span>
          }
        </SidebarIcon>
      ))}

      {/* Add community */}
      <button
        onClick={() => setModalOpen(true)}
        title="Topluluk Oluştur / Katıl"
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shrink-0"
        style={{ background: 'rgba(139,58,82,0.12)', color: '#8b3a52' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderRadius = '30%'
          e.currentTarget.style.background = 'rgba(139,58,82,0.35)'
          e.currentTarget.style.color = '#f0e4e7'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderRadius = '50%'
          e.currentTarget.style.background = 'rgba(139,58,82,0.12)'
          e.currentTarget.style.color = '#8b3a52'
        }}
      >
        +
      </button>

      <CommunityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function SidebarIcon({
  active, title, onClick, children
}: {
  active: boolean; title: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-12 h-12 flex items-center justify-center text-[#f0e4e7] transition-all duration-200 overflow-hidden shrink-0"
      style={{
        background: active ? 'linear-gradient(135deg, #8b3a52, #a84f68)' : 'rgba(139,58,82,0.12)',
        borderRadius: active ? '30%' : '50%',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderRadius = '30%'
          e.currentTarget.style.background = 'rgba(139,58,82,0.28)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderRadius = '50%'
          e.currentTarget.style.background = 'rgba(139,58,82,0.12)'
        }
      }}
    >
      {children}
    </button>
  )
}
