'use client'

import { useState, useRef } from 'react'
import { Shield, UserX, Ban, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore, type Member, type Role } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useDMStore } from '@/store/dm'
import api from '@/lib/api'

const STATUS_COLOR: Record<string, string> = {
  ONLINE:  '#3ba55d',
  IDLE:    '#faa61a',
  DND:     '#ed4245',
  OFFLINE: '#4f545c',
}
const STATUS_LABEL: Record<string, string> = {
  ONLINE: 'Çevrimiçi', IDLE: 'Boşta', DND: 'Rahatsız Etme', OFFLINE: 'Çevrimdışı',
}

export default function MemberList({ communityId }: { communityId: string }) {
  const { communities, setCommunities } = useAppStore()
  const { user } = useAuthStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cardAnchor, setCardAnchor] = useState<{ top: number; right: number } | null>(null)
  const [showOffline, setShowOffline] = useState(true)

  const community = communities.find((c) => c.id === communityId)
  if (!community) return null

  const isOwner = community.ownerId === user?.id
  const online = community.members.filter((m) => m.user.status !== 'OFFLINE')
  const offline = community.members.filter((m) => m.user.status === 'OFFLINE')
  const hoveredMember = community.members.find((m) => m.id === hoveredId)

  async function kickMember(userId: string) {
    try {
      await api.delete(`/communities/${communityId}/members/${userId}/kick`)
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setHoveredId(null)
    } catch {}
  }

  async function banMember(userId: string) {
    const reason = prompt('Ban sebebi (opsiyonel):') ?? ''
    try {
      await api.post(`/communities/${communityId}/members/${userId}/ban`, { reason })
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, members: c.members.filter((m) => m.userId !== userId) } : c))
      setHoveredId(null)
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

  function showCard(memberId: string, el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    setHoveredId(memberId)
    setCardAnchor({ top: rect.top, right: window.innerWidth - rect.left + 8 })
  }

  return (
    <div style={{ width: 224, flexShrink: 0, overflowY: 'auto', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', padding: '16px 0', position: 'relative' }}>
      <Section
        label="Çevrimiçi"
        members={online}
        hoveredId={hoveredId}
        isOwner={isOwner}
        currentUserId={user?.id}
        onHover={showCard}
        onLeave={() => setHoveredId(null)}
      />
      {offline.length > 0 && (
        <Section
          label="Çevrimdışı"
          members={offline}
          hoveredId={hoveredId}
          isOwner={isOwner}
          currentUserId={user?.id}
          onHover={showCard}
          onLeave={() => setHoveredId(null)}
          muted
          collapsed={!showOffline}
          onToggle={() => setShowOffline(v => !v)}
        />
      )}

      {/* Floating profile card */}
      {hoveredMember && cardAnchor && (
        <ProfileCard
          member={hoveredMember}
          roles={community.roles}
          isOwner={isOwner}
          isMe={hoveredMember.userId === user?.id}
          anchor={cardAnchor}
          onClose={() => setHoveredId(null)}
          onKick={() => kickMember(hoveredMember.userId)}
          onBan={() => banMember(hoveredMember.userId)}
          onToggleRole={(roleId, has) => toggleRole(hoveredMember.id, roleId, has)}
          targetUserId={hoveredMember.userId}
        />
      )}
    </div>
  )
}

function Section({ label, members, hoveredId, isOwner, currentUserId, onHover, onLeave, muted, collapsed, onToggle }: {
  label: string; members: Member[]; hoveredId: string | null
  isOwner: boolean; currentUserId?: string
  onHover: (id: string, el: HTMLElement) => void; onLeave: () => void
  muted?: boolean; collapsed?: boolean; onToggle?: () => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '2px 12px 6px', background: 'none', border: 'none', cursor: onToggle ? 'pointer' : 'default', color: '#5a3d45', transition: 'color 0.15s' }}
        onMouseEnter={e => { if (onToggle) e.currentTarget.style.color = '#8a6870' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a3d45' }}
      >
        {onToggle ? (collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />) : null}
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          {label} — {members.length}
        </span>
      </button>
      {!collapsed && members.map((m) => (
        <MemberRow
          key={m.id}
          member={m}
          hovered={hoveredId === m.id}
          isMe={m.userId === currentUserId}
          onHover={onHover}
          onLeave={onLeave}
          muted={muted}
        />
      ))}
    </div>
  )
}

function MemberRow({ member: m, hovered, isMe, onHover, onLeave, muted }: {
  member: Member; hovered: boolean; isMe: boolean
  onHover: (id: string, el: HTMLElement) => void; onLeave: () => void
  muted?: boolean
}) {
  const rowRef = useRef<HTMLButtonElement>(null)
  const status = m.user.status ?? 'OFFLINE'
  const topRole = m.roles[0]?.role

  return (
    <button
      ref={rowRef}
      onMouseEnter={() => rowRef.current && onHover(m.id, rowRef.current)}
      onMouseLeave={onLeave}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 12px', background: hovered ? 'rgba(139,58,82,0.1)' : 'none',
        border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b3a52, #b04e6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#f0e4e7', opacity: muted ? 0.5 : 1 }}>
          {m.user.displayName[0].toUpperCase()}
        </div>
        <span style={{ position: 'absolute', bottom: -1, right: -1, width: 11, height: 11, borderRadius: '50%', background: STATUS_COLOR[status] ?? STATUS_COLOR.OFFLINE, border: '2px solid var(--bg-surface)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: muted ? '#5a3d45' : (topRole?.color ?? '#f0e4e7'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.nickname ?? m.user.displayName}
          </span>
          {topRole && <Shield size={10} style={{ color: topRole.color, flexShrink: 0 }} />}
        </div>
        {topRole && <span style={{ fontSize: '0.65rem', color: muted ? '#3d2030' : topRole.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{topRole.name}</span>}
      </div>
    </button>
  )
}

function ProfileCard({ member: m, roles, isOwner, isMe, anchor, onClose, onKick, onBan, onToggleRole, targetUserId }: {
  member: Member; roles: Role[]; isOwner: boolean; isMe: boolean
  anchor: { top: number; right: number }
  onClose: () => void; onKick: () => void; onBan: () => void
  onToggleRole: (roleId: string, has: boolean) => void
  targetUserId: string
}) {
  const router = useRouter()
  const { addConversation } = useDMStore()
  const status = m.user.status ?? 'OFFLINE'
  const topRole = m.roles[0]?.role

  async function startDM() {
    try {
      const { data } = await api.post('/conversations', { userId: targetUserId })
      addConversation(data)
      router.push(`/app/dm/${data.id}`)
      onClose()
    } catch {}
  }

  const cardTop = Math.min(anchor.top, window.innerHeight - 340)

  return (
    <div
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
      style={{
        position: 'fixed',
        top: cardTop,
        right: anchor.right,
        width: 240,
        background: 'rgba(19,7,24,0.98)',
        border: '1px solid rgba(139,58,82,0.35)',
        borderRadius: 16,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        zIndex: 200,
        overflow: 'hidden',
        animation: 'scaleIn 0.12s ease',
      }}
    >
      {/* Banner */}
      <div style={{ height: 60, background: 'linear-gradient(135deg, #2d0d1a, #4a1530)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: -22, left: 14, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #8b3a52, #b04e6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 700, color: '#f0e4e7', border: '3px solid rgba(19,7,24,0.98)' }}>
          {m.user.displayName[0].toUpperCase()}
        </div>
        <div style={{ position: 'absolute', bottom: -8, right: 10, width: 16, height: 16, borderRadius: '50%', background: STATUS_COLOR[status], border: '3px solid rgba(19,7,24,0.98)' }} />
      </div>

      <div style={{ padding: '28px 14px 14px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: topRole?.color ?? '#f0e4e7', marginBottom: 2 }}>{m.nickname ?? m.user.displayName}</p>
        <p style={{ fontSize: '0.75rem', color: '#7a5a62', marginBottom: 4 }}>@{m.user.username}</p>
        <p style={{ fontSize: '0.7rem', color: STATUS_COLOR[status], marginBottom: 12 }}>{STATUS_LABEL[status]}</p>

        {m.roles.filter(mr => mr.role.name !== '@everyone').length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5a3d45', marginBottom: 5 }}>Roller</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {m.roles.filter(mr => mr.role.name !== '@everyone').map(mr => (
                <span key={mr.role.id} style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: mr.role.color + '22', color: mr.role.color, border: `1px solid ${mr.role.color}55` }}>
                  {mr.role.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {!isMe && (
            <button onClick={startDM} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 9, background: 'rgba(139,58,82,0.15)', border: '1px solid rgba(139,58,82,0.25)', color: '#f0e4e7', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,82,0.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,58,82,0.15)')}>
              <MessageCircle size={14} style={{ color: '#c96b82' }} /> Mesaj Gönder
            </button>
          )}
          {isOwner && !isMe && (
            <>
              <div style={{ width: '100%', height: 1, background: 'rgba(139,58,82,0.2)', margin: '2px 0' }} />
              {roles.filter(r => r.name !== '@everyone').length > 0 && (
                <div>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5a3d45', marginBottom: 5 }}>Rol Ata</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {roles.filter(r => r.name !== '@everyone').map(r => {
                      const has = m.roles.some(mr => mr.role.id === r.id)
                      return (
                        <button key={r.id} onClick={() => onToggleRole(r.id, has)}
                          style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', border: 'none', transition: 'all 0.12s',
                            background: has ? r.color + '33' : 'rgba(139,58,82,0.12)', color: has ? r.color : '#9a7a82' }}>
                          {r.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={onKick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', borderRadius: 8, background: 'rgba(250,166,26,0.12)', border: 'none', color: '#faa61a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,166,26,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(250,166,26,0.12)')}>
                  <UserX size={12} /> At
                </button>
                <button onClick={onBan} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', borderRadius: 8, background: 'rgba(237,66,69,0.12)', border: 'none', color: '#ed4245', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(237,66,69,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(237,66,69,0.12)')}>
                  <Ban size={12} /> Banla
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
