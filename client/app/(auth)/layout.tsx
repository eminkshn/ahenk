export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#080305',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(139,58,82,0.35), transparent 65%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 4 Q20 12 28 10 Q22 16 28 22 Q20 20 18 28 Q16 20 8 22 Q14 16 8 10 Q16 12 18 4Z' fill='rgba(201%2C107%2C130%2C0.07)'/%3E%3Ccircle cx='18' cy='18' r='1.5' fill='rgba(201%2C107%2C130%2C0.12)'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'auto, 36px 36px',
      }}
    >
      {children}
    </div>
  )
}
