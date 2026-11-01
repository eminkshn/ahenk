// next-pwa bu dosyayı service worker'a ekler: push bildirimlerini gösterir ve tıklamayı karşılar.
export {}

interface PushPayload {
  title: string
  body: string
  url: string
  tag: string
}

const sw = self as unknown as ServiceWorkerGlobalScope

sw.addEventListener('push', (event) => {
  let data: PushPayload
  try {
    data = event.data?.json() as PushPayload
  } catch {
    return
  }
  if (!data?.title) return

  event.waitUntil(
    sw.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag, // aynı sohbetten gelenler üst üste biner
      icon: '/icon',
      badge: '/icon',
      data: { url: data.url },
    })
  )
})

sw.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL((event.notification.data?.url as string) || '/app', sw.location.origin).href

  event.waitUntil((async () => {
    const windows = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find((w) => new URL(w.url).origin === sw.location.origin)
    if (existing) {
      await existing.focus()
      await existing.navigate(url).catch(() => existing.postMessage({ type: 'navigate', url }))
      return
    }
    await sw.clients.openWindow(url)
  })())
})
