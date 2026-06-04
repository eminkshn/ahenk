import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: 'linear-gradient(145deg, #0d0410, #060208)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 114,
          position: 'relative',
        }}
      >
        {/* Flower petals via positioned divs */}
        <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Petal 0° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#c96b82', opacity: 0.92, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center' }} />
          {/* Petal 60° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#c96b82', opacity: 0.88, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center', transform: 'rotate(60deg)' }} />
          {/* Petal 120° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#b05a72', opacity: 0.88, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center', transform: 'rotate(120deg)' }} />
          {/* Petal 180° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#b05a72', opacity: 0.84, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center', transform: 'rotate(180deg)' }} />
          {/* Petal 240° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#c96b82', opacity: 0.84, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center', transform: 'rotate(240deg)' }} />
          {/* Petal 300° */}
          <div style={{ position: 'absolute', width: 72, height: 118, borderRadius: '50%', background: '#c96b82', opacity: 0.88, top: 0, left: '50%', marginLeft: -36, transformOrigin: 'bottom center', transform: 'rotate(300deg)' }} />
          {/* Center circle */}
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#f5dde5', zIndex: 1, position: 'absolute' }} />
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0e4e7', zIndex: 2, position: 'absolute' }} />
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
