'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useFriendsStore, type FriendUser, type FriendRequest } from '@/store/friends'
import { useDMStore } from '@/store/dm'

const inputStyle = { background: '#10050a', border: '1px solid rgba(139,58,82,0.3)', color: '#f0e4e7' }

export default function DMPage() {
  const router = useRouter()
  const { friends, sentRequests, receivedRequests, setFriends, setRequests, removeFriend, removeRequest } = useFriendsStore()
  const { setConversations, addConversation } = useDMStore()
  const [tab, setTab] = useState<'friends' | 'requests'>('friends')
  const [addInput, setAddInput] = useState('')
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => {
    api.get('/friends').then(({ data }) => setFriends(data))
    api.get('/friends/requests').then(({ data }) => setRequests(data.sent, data.received))
    api.get('/conversations').then(({ data }) => setConversations(data))
  }, [setFriends, setRequests, setConversations])

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    try {
      await api.post('/friends/request', { username: addInput })
      setAddSuccess(`${addInput} adlı kullanıcıya istek gönderildi`)
      setAddInput('')
      api.get('/friends/requests').then(({ data }) => setRequests(data.sent, data.received))
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setAddError(e.response?.data?.error || 'Hata oluştu')
    }
  }

  async function handleRequest(id: string, action: 'accept' | 'reject') {
    await api.patch(`/friends/request/${id}`, { action })
    removeRequest(id)
    if (action === 'accept') api.get('/friends').then(({ data }) => setFriends(data))
  }

  async function removeFriendship(userId: string) {
    await api.delete(`/friends/${userId}`)
    removeFriend(userId)
  }

  async function startDM(userId: string) {
    const { data } = await api.post('/conversations', { userId })
    addConversation(data)
    router.push(`/app/dm/${data.id}`)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-4 shrink-0" style={{ borderBottom: '1px solid rgba(139,58,82,0.15)' }}>
        <span className="font-bold text-sm" style={{ color: '#f0e4e7' }}>Arkadaşlar</span>
        {[
          { key: 'friends', label: `Tümü (${friends.length})` },
          { key: 'requests', label: 'Bekleyen', badge: receivedRequests.length },
        ].map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'friends' | 'requests')}
            className="text-sm px-3 py-1 rounded-lg transition-all font-medium"
            style={{
              background: tab === key ? 'rgba(139,58,82,0.22)' : 'transparent',
              color: tab === key ? '#f0e4e7' : '#9a7a82',
            }}
          >
            {label}
            {badge ? (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#e85c6a', color: '#fff' }}>
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 max-w-2xl w-full mx-auto">
        {/* Add friend */}
        <form onSubmit={sendRequest} className="mb-6">
          <p className="font-semibold mb-2 text-sm" style={{ color: '#f0e4e7' }}>Arkadaş Ekle</p>
          <div className="flex gap-2">
            <input
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              placeholder="Kullanıcı adı gir"
              className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#8b3a52')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(139,58,82,0.3)')}
            />
            <button
              type="submit"
              disabled={!addInput.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity"
              style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7', opacity: !addInput.trim() ? 0.5 : 1 }}
            >
              Gönder
            </button>
          </div>
          {addError && <p className="text-xs mt-1.5" style={{ color: '#e85c6a' }}>{addError}</p>}
          {addSuccess && <p className="text-xs mt-1.5" style={{ color: '#43b581' }}>{addSuccess}</p>}
        </form>

        {tab === 'friends' && (
          <div className="space-y-1">
            {friends.length === 0 && (
              <p className="text-sm text-center py-10 italic" style={{ color: '#7a5a62' }}>Henüz arkadaşın yok</p>
            )}
            {friends.map((f: FriendUser) => (
              <div
                key={f.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all cursor-default"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,58,82,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}>
                  {f.displayName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#f0e4e7' }}>{f.displayName}</p>
                  <p className="text-xs" style={{ color: '#7a5a62' }}>@{f.username}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startDM(f.id)} title="Mesaj gönder"
                    className="text-xl transition-colors" style={{ color: '#9a7a82' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c96b82')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}>
                    💬
                  </button>
                  <button onClick={() => removeFriendship(f.id)} title="Arkadaşlıktan çıkar"
                    className="text-sm transition-colors" style={{ color: '#9a7a82' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e85c6a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7a82')}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-4">
            {receivedRequests.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#7a5a62' }}>Gelen İstekler</p>
                <div className="space-y-2">
                  {receivedRequests.map((r: FriendRequest) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(139,58,82,0.08)', border: '1px solid rgba(139,58,82,0.18)' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8b3a52, #a84f68)', color: '#f0e4e7' }}>
                        {r.sender!.displayName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#f0e4e7' }}>{r.sender!.displayName}</p>
                        <p className="text-xs" style={{ color: '#7a5a62' }}>@{r.sender!.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRequest(r.id, 'accept')}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity"
                          style={{ background: '#43b581', color: '#fff' }}>
                          Kabul
                        </button>
                        <button onClick={() => handleRequest(r.id, 'reject')}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                          style={{ background: 'rgba(232,92,106,0.15)', color: '#e85c6a', border: '1px solid rgba(232,92,106,0.3)' }}>
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sentRequests.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#7a5a62' }}>Gönderilen İstekler</p>
                <div className="space-y-2">
                  {sentRequests.map((r: FriendRequest) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(139,58,82,0.06)', border: '1px solid rgba(139,58,82,0.15)' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                        style={{ background: 'rgba(139,58,82,0.3)', color: '#f0e4e7' }}>
                        {r.receiver!.displayName[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#f0e4e7' }}>{r.receiver!.displayName}</p>
                        <p className="text-xs italic" style={{ color: '#7a5a62' }}>Bekliyor...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {receivedRequests.length === 0 && sentRequests.length === 0 && (
              <p className="text-sm text-center py-10 italic" style={{ color: '#7a5a62' }}>Bekleyen istek yok</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
