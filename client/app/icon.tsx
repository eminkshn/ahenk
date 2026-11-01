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
          background: '#4FD1A5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 114,
        }}
      >
        {/* Ahenk mark: bubble in night ink, voice bars in mint */}
        <svg width={358} height={358} viewBox="0 0 64 64">
          <path d="M20 7h24a14 14 0 0 1 14 14v13a14 14 0 0 1-14 14H25l-11 9v-10A14 14 0 0 1 6 34V21A14 14 0 0 1 20 7z" fill="#0F1115" />
          <rect x="19.5" y="22" width="5.5" height="13" rx="2.75" fill="#4FD1A5" />
          <rect x="29.25" y="16" width="5.5" height="25" rx="2.75" fill="#4FD1A5" />
          <rect x="39" y="20" width="5.5" height="17" rx="2.75" fill="#4FD1A5" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
