import api from '@/lib/api'

export type PushState = 'unsupported' | 'needs-install' | 'default' | 'granted' | 'denied'

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function getPushState(): PushState {
  if (typeof window === 'undefined') return 'unsupported'
  // iOS'ta push yalnızca Ana Ekrana eklenmiş uygulamada çalışır
  if (isIOS() && !isStandalone()) return 'needs-install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

async function subscribe() {
  const registration = await navigator.serviceWorker.ready
  let sub = await registration.pushManager.getSubscription()
  if (!sub) {
    const { data } = await api.get('/push/public-key')
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    })
  }
  await api.post('/push/subscribe', sub.toJSON())
}

/** Kullanıcı düğmeye bastığında çağrılır (iOS izin penceresi için şart). */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission()
  if (permission === 'granted') await subscribe()
  return permission
}

/** İzin zaten verilmişse aboneliği sunucuyla eşitler (giriş sonrası, hesap değişince). */
export async function syncPush() {
  if (getPushState() !== 'granted') return
  await subscribe().catch(() => {})
}

/** Çıkışta bu cihazın bildirimlerini kapatır; token silinmeden önce çağrılmalı. */
export async function disablePush() {
  if (getPushState() !== 'granted') return
  try {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    if (!sub) return
    await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {})
    await sub.unsubscribe()
  } catch {
    // service worker yoksa yapılacak bir şey yok
  }
}
