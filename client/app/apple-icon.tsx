import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'linear-gradient(145deg, #0d0410, #060208)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#c96b82', opacity: 0.92, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center' }} />
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#c96b82', opacity: 0.88, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center', transform: 'rotate(60deg)' }} />
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#b05a72', opacity: 0.88, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center', transform: 'rotate(120deg)' }} />
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#b05a72', opacity: 0.84, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center', transform: 'rotate(180deg)' }} />
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#c96b82', opacity: 0.84, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center', transform: 'rotate(240deg)' }} />
          <div style={{ position: 'absolute', width: 26, height: 42, borderRadius: '50%', background: '#c96b82', opacity: 0.88, top: 0, left: '50%', marginLeft: -13, transformOrigin: 'bottom center', transform: 'rotate(300deg)' }} />
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f5dde5', zIndex: 1, position: 'absolute' }} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f0e4e7', zIndex: 2, position: 'absolute' }} />
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
