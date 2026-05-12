export function Background() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 4 Q20 12 28 10 Q22 16 28 22 Q20 20 18 28 Q16 20 8 22 Q14 16 8 10 Q16 12 18 4Z' fill='rgba(201%2C107%2C130%2C0.07)'/%3E%3Ccircle cx='18' cy='18' r='1.5' fill='rgba(201%2C107%2C130%2C0.12)'/%3E%3C/svg%3E")`,
        backgroundSize: '36px 36px',
        backgroundColor: '#080305',
      }}
    />
  )
}
