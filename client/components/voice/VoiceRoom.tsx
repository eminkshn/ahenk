'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Room, RoomEvent,
  type RemoteParticipant
} from 'livekit-client'
import { Mic, MicOff, PhoneOff } from 'lucide-react'
import api from '@/lib/api'

interface VoiceParticipant {
  identity: string
  name: string
  isMuted: boolean
  isSpeaking: boolean
  isLocal: boolean
}

export default function VoiceRoom({ roomName, onLeave }: {
  roomName: string
  onLeave: () => void
}) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const roomRef = useRef<Room | null>(null)
  // Stable ref so onLeave never triggers effect re-run
  const onLeaveRef = useRef(onLeave)
  useEffect(() => { onLeaveRef.current = onLeave })

  const sync = useCallback(() => {
    const room = roomRef.current
    if (!room) return
    const lp = room.localParticipant
    const parts: VoiceParticipant[] = [{
      identity: lp.identity,
      name: lp.name || lp.identity,
      isMuted: !lp.isMicrophoneEnabled,
      isSpeaking: lp.isSpeaking,
      isLocal: true,
    }]
    room.remoteParticipants.forEach((rp: RemoteParticipant) => {
      parts.push({
        identity: rp.identity,
        name: rp.name || rp.identity,
        isMuted: !rp.isMicrophoneEnabled,
        isSpeaking: rp.isSpeaking,
        isLocal: false,
      })
    })
    setParticipants([...parts])
  }, [])

  useEffect(() => {
    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room

    const events = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.ActiveSpeakersChanged,
      RoomEvent.LocalTrackPublished,
    ]
    events.forEach((ev) => room.on(ev, sync))
    room.on(RoomEvent.Disconnected, () => onLeaveRef.current())

    async function connect() {
      try {
        const { data } = await api.post('/voice/token', { roomName })
        if (!data?.token || !data?.url) {
          setErrorMsg('Sunucu geçerli bir token döndürmedi.')
          setStatus('error')
          return
        }
        await room.connect(data.url, data.token)
        setStatus('connected')
        sync()
        // Enable mic separately — failure doesn't break the connection
        try {
          await room.localParticipant.setMicrophoneEnabled(true)
          sync()
        } catch {
          setIsMuted(true)
        }
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        setErrorMsg(msg || 'LiveKit bağlantısı kurulamadı. Railway\'de LIVEKIT_URL, LIVEKIT_API_KEY ve LIVEKIT_API_SECRET değişkenlerini kontrol et.')
        setStatus('error')
      }
    }
    connect()

    return () => {
      events.forEach((ev) => room.off(ev, sync))
      room.disconnect()
      roomRef.current = null
    }
    // Only re-run if the roomName changes — onLeave is stable via ref
  }, [roomName, sync])

  async function toggleMute() {
    const room = roomRef.current
    if (!room) return
    const next = !room.localParticipant.isMicrophoneEnabled
    await room.localParticipant.setMicrophoneEnabled(next)
    setIsMuted(!next)
    sync()
  }

  function leave() {
    roomRef.current?.disconnect()
    onLeaveRef.current()
  }

  if (status === 'error') return (
    <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ color: '#e85c6a', fontSize: '0.875rem', maxWidth: 320, lineHeight: 1.5 }}>{errorMsg}</p>
      <button onClick={() => onLeaveRef.current()} style={{ color: '#c96b82', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Kapat</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '40px 24px 32px', gap: 32 }}>
      {status === 'connecting' && (
        <p style={{ color: '#8a6870', fontSize: '0.875rem', fontStyle: 'italic' }}>Bağlanıyor...</p>
      )}

      {/* Participants */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', flex: 1, alignContent: 'center' }}>
        {participants.map((p) => (
          <div key={p.identity} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              position: 'relative',
              width: 80, height: 80, borderRadius: '50%',
              background: p.isLocal ? 'linear-gradient(135deg, #8b3a52, #b04e6a)' : 'linear-gradient(135deg, #2d1420, #4a2030)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, color: '#f0e4e7',
              border: `3px solid ${p.isSpeaking ? '#43b581' : 'rgba(139,58,82,0.25)'}`,
              boxShadow: p.isSpeaking ? '0 0 20px rgba(67,181,93,0.5)' : '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              {p.name[0]?.toUpperCase()}
              {p.isMuted && (
                <div style={{
                  position: 'absolute', bottom: -3, right: -3,
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#ed4245', border: '2px solid var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MicOff size={11} color="#fff" />
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.8125rem', color: p.isLocal ? '#c96b82' : '#c4a0ab', maxWidth: 90, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}{p.isLocal ? ' (sen)' : ''}
            </span>
          </div>
        ))}
        {status === 'connected' && participants.length <= 1 && (
          <p style={{ fontSize: '0.8125rem', color: '#5a3d45', fontStyle: 'italic', textAlign: 'center', maxWidth: 200 }}>
            Başka kimse yok. Kanalı paylaş ve arkadaşlarını bekle.
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: 16, padding: '16px 28px',
        background: 'rgba(6,2,8,0.8)', borderRadius: 24,
        border: '1px solid rgba(139,58,82,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <button onClick={toggleMute} title={isMuted ? 'Sesi Aç' : 'Sessiz'}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isMuted ? '#ed4245' : 'rgba(139,58,82,0.25)', color: '#f0e4e7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s',
            boxShadow: isMuted ? '0 4px 16px rgba(237,66,69,0.4)' : 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button onClick={leave} title="Ayrıl"
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#ed4245', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(237,66,69,0.5)', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  )
}
