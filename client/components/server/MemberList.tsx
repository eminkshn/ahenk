'use client'

import { useState } from 'react'
import { Shield, UserX, Ban, ChevronDown, ChevronRight } from 'lucide-react'
import { useAppStore, type Member, type Role } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

const STATUS_COLOR: Record<string, string> = {
  ONLINE:  '#3ba55d',
  IDLE:    '#faa61a',
  DND:     '#ed4245',
  OFFLINE: '#4f545c',
}

export default function MemberList({ communityId }: { communityId: string }) {
  const { communities, setCommunities } = useAppStore()
  const { user } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showOffline, setShowOffline] = useState(true)

  const community = communities.find((c) => c.id === communityId)
  if (!community) return null

  const isOwner = community.ownerId === user?.id
  const online = community.members.filter((m) => m.user.status !== 'OFFLINE')
  const offline = community.members.filter((m) => m.user.status === 'OFFLINE')

  async function kickMember(userId: string) {
    try {
      await api.delete(`/communities/${communityId}/members/${userId}/kick`)
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setExpandedId(null)
    } catch {}
  }

  async function banMember(userId: string) {
    const reason = prompt('Ban sebebi (opsiyonel):') ?? ''
    try {
      await api.post(`/communities/${communityId}/members/${userId}/ban`, { reason })
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setExpandedId(null)
    } catch {}
  }

  async function toggleRole(memberId: string, roleId: string, has: boolean) {
    try {
      if (has) {
        await api.delete(`/communities/${communityId}/members/${memberId}/roles/${roleId}`)
        setCommunities(communities.map((c) => c.id !== communityId ? c : {
          ...c, members: c.members.map((m) => m.id !== memberId ? m : { ...m, roles: m.roles.filter((r) => r.role.id !== roleId) })
        }))
      } else {
        await api.post(`/communities/${communityId}/members/${memberId}/roles/${roleId}`)
        setCommunities(communities.map((c) => c.id !== communityId ? c : {
          ...c, members: c.members.map((m) => m.id !== memberId ? m : { ...m, roles: [...m.roles, { role: c.roles.find((r) => r.id === roleId)! }] })
        }))
      }
    } catch {}
  }

  return (
    <div style={{
      width: 224,
      flexShrink: 0,
      overflowY: 'auto',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      padding: '16px 0',
    }}>
      <Section
        label={`Çevrimiçi`}
        count={online.length}
        defaultOpen
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
        <Section
          label="Çevrimdışı"
          count={offline.length}
          defaultOpen={showOffline}
          onToggle={() => setShowOffline(v => !v)}
          members={offline}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          isOwner={isOwner}
          currentUserId={user?.id}
          roles={community.roles}
          onKick={kickMember}
          onBan={banMember}
          onToggleRole={toggleRole}
          muted
        />
      )}
    </div>
  )
}

function Section({
  label, count, defaultOpen, onToggle, members, expandedId, setExpandedId,
  isOwner, currentUserId, roles, onKick, onBan, onToggleRole, muted
}: {
  label: string; count: number; defaultOpen: boolean; onToggle?: () => void
  members: Member[]; expandedId: string | null; setExpandedId: (id: string | null) => void
  isOwner: boolean; currentUserId?: string; roles: Role[]
  onKick: (id: string) => void; onBan: (id: string) => void
  onToggleRole: (memberId: string, roleId: string, has: boolean) => void
  muted?: boolean
}) {
  const open = defaultOpen

  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          width: '100%', padding: '2px 12px 6px',
          background: 'none', border: 'none', cursor: onToggle ? 'pointer' : 'default',
          color: '#5a3d45',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { if (onToggle) e.currentTarget.style.color = '#8a6870' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45' }}
      >
        {onToggle ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          {label} — {count}
        </span>
      </button>

      {open && members.map((m) => (
        <MemberRow
          key={m.id}
          member={m}
          expanded={expandedId === m.id}
          onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
          isOwner={isOwner}
          isMe={m.userId === currentUserId}
          roles={roles}
          onKick={() => onKick(m.userId)}
          onBan={() => onBan(m.userId)}
          onToggleRole={(roleId, has) => onToggleRole(m.id, roleId, has)}
          muted={muted}
        />
      ))}
    </div>
  )
}

function MemberRow({ member: m, expanded, onToggle, isOwner, isMe, roles, onKick, onBan, onToggleRole, muted }: {
  member: Member; expanded: boolean; onToggle: () => void
  isOwner: boolean; isMe: boolean; roles: Role[]
  onKick: () => void; onBan: () => void
  onToggleRole: (roleId: string, has: boolean) => void
  muted?: boolean
}) {
  const status = m.user.status ?? 'OFFLINE'
  const topRole = m.roles[0]?.role

  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', transition: 'background 0.12s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,82,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b3a52, #b04e6a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#f0e4e7',
            opacity: muted ? 0.5 : 1,
          }}>
            {m.user.displayName[0].toUpperCase()}
          </div>
          <span style={{
            position: 'absolute', bottom: -1, right: -1,
            width: 11, height: 11, borderRadius: '50%',
            background: STATUS_COLOR[status] ?? STATUS_COLOR.OFFLINE,
            border: '2px solid var(--bg-surface)',
          }} />
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: '0.8125rem', fontWeight: 600,
              color: muted ? '#5a3d45' : (topRole?.color ?? '#f0e4e7'),
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {m.nickname ?? m.user.displayName}
            </span>
            {isOwner && m.userId === m.userId && topRole && (
              <Shield size={10} style={{ color: topRole.color, flexShrink: 0 }} />
            )}
          </div>
          {topRole && (
            <span style={{ fontSize: '0.65rem', color: muted ? '#3d2030' : topRole.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {topRole.name}
            </span>
          )}
        </div>
      </button>

      {expanded && isOwner && !isMe && (
        <div style={{
          margin: '2px 8px 4px',
          background: 'rgba(139,58,82,0.06)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: '0.75rem',
        }}>
          <p style={{ color: '#8a6870', marginBottom: 8 }}>@{m.user.username}</p>

          {roles.filter(r => r.name !== '@everyone').length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5a3d45', marginBottom: 6 }}>Roller</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {roles.filter(r => r.name !== '@everyone').map(r => {
                  const has = m.roles.some(mr => mr.role.id === r.id)
                  return (
                    <button key={r.id} onClick={() => onToggleRole(r.id, has)}
                      style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600,
                        fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.12s',
                        ...(has
                          ? { background: r.color + '22', color: r.color, border: `1px solid ${r.color}55` }
                          : { background: 'transparent', color: '#5a3d45', border: '1px solid rgba(139,58,82,0.2)' }
                        )
                      }}>
                      {r.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onKick} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', color: '#faa61a',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: 0,
              transition: 'color 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0c040')}
              onMouseLeave={e => (e.currentTarget.style.color = '#faa61a')}>
              <UserX size={12} /> At
            </button>
            <button onClick={onBan} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', color: '#ed4245',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: 0,
              transition: 'color 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff6670')}
              onMouseLeave={e => (e.currentTarget.style.color = '#ed4245')}>
              <Ban size={12} /> Banla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
