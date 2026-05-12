'use client'

import { useState } from 'react'
import { useAppStore, type Member, type Role } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#43b581',
  IDLE: '#faa61a',
  DND: '#ed4245',
  OFFLINE: '#747f8d',
}

export default function MemberList({ communityId }: { communityId: string }) {
  const { communities, setCommunities } = useAppStore()
  const { user } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const community = communities.find((c) => c.id === communityId)
  if (!community) return null

  const isOwner = community.ownerId === user?.id
  const online = community.members.filter((m) => m.user.status !== 'OFFLINE')
  const offline = community.members.filter((m) => m.user.status === 'OFFLINE')

  async function kickMember(userId: string) {
    try {
      await api.delete(`/communities/${communityId}/members/${userId}/kick`)
      setCommunities(communities.map((c) => c.id === communityId ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setExpandedId(null)
    } catch {}
  }

  async function banMember(userId: string) {
    const reason = prompt('Ban sebebi (opsiyonel):') ?? ''
    try {
      await api.post(`/communities/${communityId}/members/${userId}/ban`, { reason })
      setCommunities(communities.map((c) => c.id === communityId ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setExpandedId(null)
    } catch {}
  }

  async function toggleRole(memberId: string, roleId: string, has: boolean) {
    try {
      if (has) {
        await api.delete(`/communities/${communityId}/members/${memberId}/roles/${roleId}`)
        setCommunities(communities.map((c) => c.id !== communityId ? c : { ...c, members: c.members.map((m) => m.id !== memberId ? m : { ...m, roles: m.roles.filter((r) => r.role.id !== roleId) }) }))
      } else {
        await api.post(`/communities/${communityId}/members/${memberId}/roles/${roleId}`)
        setCommunities(communities.map((c) => c.id !== communityId ? c : { ...c, members: c.members.map((m) => m.id !== memberId ? m : { ...m, roles: [...m.roles, { role: c.roles.find((r) => r.id === roleId)! }] }) }))
      }
    } catch {}
  }

  return (
    <div
      className="w-56 flex flex-col shrink-0 overflow-y-auto py-4"
      style={{ background: '#0a0407', borderLeft: '1px solid rgba(139,58,82,0.12)' }}
    >
      <MemberSection
        label={`Çevrimiçi — ${online.length}`}
        members={online}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        isOwner={isOwner}
        currentUserId={user?.id}
        roles={community.roles}
        onKick={kickMember}
        onBan={banMember}
        onToggleRole={toggleRole}
      />
      {offline.length > 0 && (
        <MemberSection
          label={`Çevrimdışı — ${offline.length}`}
          members={offline}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          isOwner={isOwner}
          currentUserId={user?.id}
          roles={community.roles}
          onKick={kickMember}
          onBan={banMember}
          onToggleRole={toggleRole}
        />
      )}
    </div>
  )
}

function MemberSection({
  label, members, expandedId, setExpandedId, isOwner, currentUserId, roles, onKick, onBan, onToggleRole
}: {
  label: string
  members: Member[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  isOwner: boolean
  currentUserId?: string
  roles: Role[]
  onKick: (id: string) => void
  onBan: (id: string) => void
  onToggleRole: (memberId: string, roleId: string, has: boolean) => void
}) {
  return (
    <div className="mb-5">
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7a5a62' }}>
        {label}
      </p>
      {members.map((m) => (
        <div key={m.id}>
          <button
            onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg mx-0 transition-colors text-left"
            style={{ color: '#c4a0a8' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="relative shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}
              >
                {m.user.displayName[0].toUpperCase()}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                style={{
                  background: STATUS_COLORS[m.user.status ?? 'OFFLINE'] ?? STATUS_COLORS.OFFLINE,
                  border: '2px solid #0a0407',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: '#f0e4e7' }}>{m.nickname ?? m.user.displayName}</p>
              {m.roles.length > 0 && (
                <p className="text-xs truncate" style={{ color: m.roles[0].role.color }}>
                  {m.roles[0].role.name}
                </p>
              )}
            </div>
          </button>

          {expandedId === m.id && (
            <div
              className="mx-2 mb-1 rounded-xl p-3 text-xs space-y-2"
              style={{ background: 'rgba(139,58,82,0.08)', border: '1px solid rgba(139,58,82,0.18)' }}
            >
              <p className="font-medium" style={{ color: '#c4a0a8' }}>@{m.user.username}</p>
              {isOwner && m.userId !== currentUserId && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: '#7a5a62' }}>Roller</p>
                    <div className="flex flex-wrap gap-1">
                      {roles.filter((r) => r.name !== '@everyone').map((r) => {
                        const has = m.roles.some((mr) => mr.role.id === r.id)
                        return (
                          <button
                            key={r.id}
                            onClick={() => onToggleRole(m.id, r.id, has)}
                            className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                            style={has
                              ? { background: r.color + '30', color: r.color, border: `1px solid ${r.color}` }
                              : { background: 'transparent', color: '#7a5a62', border: '1px solid rgba(139,58,82,0.3)' }
                            }
                          >
                            {r.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => onKick(m.userId)} className="text-xs transition-colors" style={{ color: '#e8a83c' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#f0c040')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#e8a83c')}>
                      At (kick)
                    </button>
                    <button onClick={() => onBan(m.userId)} className="text-xs transition-colors" style={{ color: '#e85c6a' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff7080')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#e85c6a')}>
                      Banla
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
