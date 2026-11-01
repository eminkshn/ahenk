export function Background() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Ccircle cx='18' cy='18' r='1' fill='rgba(255%2C255%2C255%2C0.05)'/%3E%3C/svg%3E")`,
        backgroundSize: '36px 36px',
        backgroundColor: '#0F1115',
      }}
    />
  )
}
