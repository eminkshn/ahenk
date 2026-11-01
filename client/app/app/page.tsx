// /app her zaman son sohbete ya da mesajlar ekranına yönlendirilir (layout).
// Bu ekran yalnızca o yönlendirme sırasında kısa süre görünür.
export default function AppPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--accent-muted)' }}>
      <span className="text-sm">Yükleniyor...</span>
    </div>
  )
}
