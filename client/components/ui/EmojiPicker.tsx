'use client'

import { useEffect, useRef, useState } from 'react'
import { SmilePlus, Heart, Cat, Coffee, Rocket, Lightbulb, Hand } from 'lucide-react'

// Hafif, bağımsız emoji seçici — mesaj kutusuna modern emojiler eklemek için.
type Category = { id: string; icon: React.ReactNode; emojis: string[] }

const CATEGORIES: Category[] = [
  { id: 'yuz', icon: <SmilePlus size={16} />, emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😚','😋','😜','🤪','😝','🤗','🤭','🤔','🤨','😐','😑','😶','🙄','😏','😮','😴','😌','😔','😪','🤤','😷','🤒','🥳','🥺','😢','😭','😤','😠','😡','🤯','😳','🥵','🥶','😱','😨','😰','😓'] },
  { id: 'el', icon: <Hand size={16} />, emojis: ['👍','👎','👌','🤌','✌️','🤞','🤟','🤘','👏','🙌','👐','🙏','🤝','💪','👋','🤙','☝️','👆','👇','👈','👉','✋','🖐️','🖖','🫶','👊','✊','🤛','🤜'] },
  { id: 'kalp', icon: <Heart size={16} />, emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💯','✨','⭐','🌟','💫','🔥'] },
  { id: 'hayvan', icon: <Cat size={16} />, emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦉','🦄','🐝','🦋','🐢','🐙','🐬','🐳','🐠','🌸','🌺','🌻','🌈'] },
  { id: 'yemek', icon: <Coffee size={16} />, emojis: ['🍏','🍎','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🍍','🥝','🍅','🥑','🌽','🍕','🍔','🍟','🌭','🥪','🌮','🍿','🍩','🍪','🎂','🍰','🍫','🍬','🍭','☕','🍵','🧃','🍺','🥤'] },
  { id: 'aktivite', icon: <Rocket size={16} />, emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🥊','🎮','🎲','🎯','🎸','🎧','🎤','🎬','🚀','✈️','🚗','🏆','🥇','🎉','🎊','🎁','🎈','🎄','🔮','💎','🗿'] },
  { id: 'simge', icon: <Lightbulb size={16} />, emojis: ['💡','✅','❌','⚠️','❓','❗','💬','💭','👀','🧠','💰','📌','📎','🔒','🔑','⏰','📅','📈','📉','🔔','🔕','♻️','⚡','🌙','☀️','❄️','💧','🎶','🆗','🔥'] },
]

export default function EmojiPicker({ onPick, align = 'left' }: { onPick: (e: string) => void; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Emoji"
        aria-label="Emoji ekle"
        style={{
          width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer',
          color: open ? '#4FD1A5' : '#5C626D', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#4FD1A5')}
        onMouseLeave={(e) => (e.currentTarget.style.color = open ? '#4FD1A5' : '#5C626D')}
      >
        <SmilePlus size={18} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Emoji seçici"
          style={{
            position: 'absolute', bottom: 40, [align]: 0,
            width: 296, height: 280, zIndex: 60,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
            borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', gap: 2, padding: 6, borderBottom: '1px solid var(--border)' }}>
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(i)}
                aria-label={c.id}
                style={{
                  flex: 1, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cat === i ? 'rgba(79,209,165,0.18)' : 'transparent',
                  color: cat === i ? '#4FD1A5' : '#7C838F', transition: 'all 0.15s',
                }}
              >
                {c.icon}
              </button>
            ))}
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2,
          }}>
            {CATEGORIES[cat].emojis.map((e, i) => (
              <button
                key={e + i}
                type="button"
                onClick={() => { onPick(e); setOpen(false) }}
                style={{
                  height: 32, border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 20, lineHeight: 1, borderRadius: 8, padding: 0,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(79,209,165,0.15)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'none')}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
