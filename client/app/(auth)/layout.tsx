import Logo from '@/components/ui/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#0F1115',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(79,209,165,0.12), transparent 60%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Ccircle cx='18' cy='18' r='1' fill='rgba(255%2C255%2C255%2C0.05)'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'auto, 36px 36px',
      }}
    >
      <div style={{ position: 'fixed', top: 20, left: 24, zIndex: 10 }}>
        <Logo size="md" />
      </div>
      {children}
    </div>
  )
}
