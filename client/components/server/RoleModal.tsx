'use client'

import { useState } from 'react'
import { Shield, Plus, Trash2, Check, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'
import { useAppStore, type Role, type Member } from '@/store/app'

const inputStyle = { background: '#0B0D10', border: '1px solid rgba(79,209,165,0.3)', color: '#E8EAEE' }
const focusOn = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#4FD1A5')
const focusOff = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(79,209,165,0.3)')

const PRESET_COLORS = ['#4FD1A5', '#FF8A7A', '#F2B544', '#43b581', '#8EA8FF', '#9b59b6', '#99AAB5', '#E8EAEE']

export default function RoleModal({ open, onClose, communityId }: { open: boolean; onClose: () => void; communityId: string }) {
  const { communities, setCommunities } = useAppStore()
  const community = communities.find((c) => c.id === communityId)
  const [tab, setTab] = useState<'roles' | 'assign'>('roles')
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({ name: '', color: '#4FD1A5' })
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!community) return null

  async function createRole() {
    if (!newRole.name.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post(`/communities/${communityId}/roles`, { name: newRole.name, color: newRole.color })
      setCommunities(communities.map((c) => c.id === communityId ? { ...c, roles: [...c.roles, data] } : c))
      setNewRole({ name: '', color: '#4FD1A5' })
      setCreating(false)
    } catch {} finally { setLoading(false) }
  }

  const ADMIN_BIT = 1
  function roleIsAdmin(role: Role) { return (parseInt(role.permissions || '0') & ADMIN_BIT) !== 0 }
  function toggleAdmin(role: Role) {
    const current = parseInt(role.permissions || '0')
    const next = roleIsAdmin(role) ? current & ~ADMIN_BIT : current | ADMIN_BIT
    setEditingRole({ ...role, permissions: String(next) })
  }

  async function updateRole(role: Role) {
    setLoading(true)
    try {
      await api.patch(`/communities/${communityId}/roles/${role.id}`, { name: role.name, color: role.color, permissions: parseInt(role.permissions || '0') })
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, roles: c.roles.map((r) => r.id === role.id ? role : r) }
        : c))
      setEditingRole(null)
    } catch {} finally { setLoading(false) }
  }

  async function deleteRole(roleId: string) {
    try {
      await api.delete(`/communities/${communityId}/roles/${roleId}`)
      setCommunities(communities.map((c) => c.id === communityId
        ? { ...c, roles: c.roles.filter((r) => r.id !== roleId) }
        : c))
    } catch {}
  }

  async function toggleMemberRole(member: Member, role: Role) {
    const hasRole = member.roles.some((mr) => mr.role.id === role.id)
    try {
      if (hasRole) {
        await api.delete(`/communities/${communityId}/members/${member.id}/roles/${role.id}`)
        setCommunities(communities.map((c) => c.id === communityId ? {
          ...c,
          members: c.members.map((m) => m.id === member.id
            ? { ...m, roles: m.roles.filter((mr) => mr.role.id !== role.id) }
            : m)
        } : c))
      } else {
        await api.post(`/communities/${communityId}/members/${member.id}/roles/${role.id}`, {})
        setCommunities(communities.map((c) => c.id === communityId ? {
          ...c,
          members: c.members.map((m) => m.id === member.id
            ? { ...m, roles: [...m.roles, { role }] }
            : m)
        } : c))
      }
    } catch {}
  }

  const editableRoles = community.roles.filter((r) => r.name !== '@everyone')

  return (
    <Modal open={open} onClose={onClose} title="Rol Yönetimi">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, marginTop: 4, padding: '4px', background: 'rgba(79,209,165,0.1)', borderRadius: 12 }}>
        {([['roles', 'Roller'], ['assign', 'Üye Atama']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              background: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? 'var(--accent-ink)' : '#9AA1AD' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {editableRoles.map((role) => (
            <div key={role.id}>
              {editingRole?.id === role.id ? (
                <div style={{ padding: '10px 12px', background: 'rgba(79,209,165,0.1)', border: '1px solid rgba(79,209,165,0.3)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={editingRole.name} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                    className="input-base" style={{ ...inputStyle, padding: '8px 12px', width: '100%' }} onFocus={focusOn} onBlur={focusOff} />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setEditingRole({ ...editingRole, color: c })}
                        style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: editingRole.color === c ? '2px solid #E8EAEE' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                  {/* Permissions */}
                  <button
                    onClick={() => toggleAdmin(editingRole)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: roleIsAdmin(editingRole) ? 'rgba(79,209,165,0.2)' : 'rgba(79,209,165,0.08)',
                      color: roleIsAdmin(editingRole) ? '#4FD1A5' : '#8A919C',
                      fontSize: '0.8125rem', transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid', borderColor: roleIsAdmin(editingRole) ? '#4FD1A5' : '#5C626D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: roleIsAdmin(editingRole) ? '#4FD1A5' : 'transparent' }}>
                      {roleIsAdmin(editingRole) && <Check size={9} color="#0B1A14" />}
                    </span>
                    <span>
                      <strong>Yönetici</strong>
                      <span style={{ fontSize: '0.7rem', color: '#5C626D', marginLeft: 6 }}>yavaş moddan muaf · kanal yönetimi</span>
                    </span>
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => updateRole(editingRole)} disabled={loading} style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}>Kaydet</button>
                    <button onClick={() => setEditingRole(null)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(79,209,165,0.15)', color: '#9AA1AD', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(79,209,165,0.06)', border: '1px solid rgba(79,209,165,0.15)' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.875rem', color: '#E8EAEE' }}>{role.name}</span>
                  {roleIsAdmin(role) && (
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 6, background: 'rgba(79,209,165,0.2)', color: '#4FD1A5', fontWeight: 600 }}>YÖNETİCİ</span>
                  )}
                  <button onClick={() => setEditingRole({ ...role })} style={{ padding: '4px 8px', background: 'rgba(79,209,165,0.15)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#C9CDD4', fontSize: '0.75rem', fontFamily: 'inherit' }}>Düzenle</button>
                  <button onClick={() => deleteRole(role.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#FF8A7A', display: 'flex' }} title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {creating ? (
            <div style={{ padding: '10px 12px', background: 'rgba(79,209,165,0.1)', border: '1px dashed rgba(79,209,165,0.4)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={newRole.name} onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
                placeholder="Rol adı..." autoFocus className="input-base" style={{ ...inputStyle, padding: '8px 12px', width: '100%' }} onFocus={focusOn} onBlur={focusOff} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewRole(r => ({ ...r, color: c }))}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: newRole.color === c ? '2px solid #E8EAEE' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={createRole} disabled={loading || !newRole.name.trim()} style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', opacity: !newRole.name.trim() ? 0.5 : 1 }}>Oluştur</button>
                <button onClick={() => setCreating(false)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(79,209,165,0.15)', color: '#9AA1AD', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'none', border: '1px dashed rgba(79,209,165,0.3)', cursor: 'pointer', color: '#4FD1A5', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4FD1A5'; e.currentTarget.style.color = '#E8EAEE' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,209,165,0.3)'; e.currentTarget.style.color = '#4FD1A5' }}>
              <Plus size={15} /> Yeni Rol Ekle
            </button>
          )}
        </div>
      )}

      {tab === 'assign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {editableRoles.length === 0 && (
            <p style={{ fontSize: '0.875rem', color: '#7C838F', textAlign: 'center', padding: '16px 0' }}>Önce bir rol oluşturun.</p>
          )}
          {community.members.map((member) => (
            <div key={member.id} style={{ padding: '10px 12px', background: 'rgba(79,209,165,0.06)', border: '1px solid rgba(79,209,165,0.15)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: editableRoles.length ? 10 : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>
                  {member.user.displayName[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E8EAEE' }}>{member.user.displayName}</p>
                  <p style={{ fontSize: '0.7rem', color: '#7C838F' }}>@{member.user.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {editableRoles.map((role) => {
                  const has = member.roles.some((mr) => mr.role.id === role.id)
                  return (
                    <button key={role.id} onClick={() => toggleMemberRole(member, role)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.15s',
                        background: has ? role.color + '33' : 'rgba(79,209,165,0.1)',
                        color: has ? role.color : '#9AA1AD',
                        boxShadow: has ? `0 0 0 1px ${role.color}55` : 'none' }}>
                      {has ? <Check size={11} /> : <Plus size={11} />}
                      {role.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
