import webpush from 'web-push'
import type { Server } from 'socket.io'
import { prisma } from './prisma'
import 'dotenv/config'

const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
// Anahtarlar yoksa bildirimler sessizce kapalı kalır, sunucu yine çalışır
export const pushEnabled = Boolean(publicKey && privateKey)

if (pushEnabled) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@ahenk.app', publicKey!, privateKey!)
} else {
  console.warn('VAPID anahtarları tanımlı değil: push bildirimleri kapalı')
}

export const vapidPublicKey = publicKey ?? null

export interface PushPayload {
  title: string
  body: string
  url: string
  tag: string
}

// Uygulaması o an ekranda açık olanlara push gönderme; mesajı zaten canlı görüyorlar
async function isActivelyViewing(io: Server, userId: string) {
  const sockets = await io.in(`user:${userId}`).fetchSockets()
  return sockets.some((s) => s.data.visible === true)
}

export async function notifyUsers(io: Server, userIds: string[], payload: PushPayload) {
  if (!pushEnabled || userIds.length === 0) return

  const targets: string[] = []
  for (const id of new Set(userIds)) {
    if (!(await isActivelyViewing(io, id))) targets.push(id)
  }
  if (targets.length === 0) return

  const subs = await prisma.pushSubscription.findMany({ where: { userId: { in: targets } } })
  const body = JSON.stringify({ ...payload, body: payload.body.slice(0, 140) })

  await Promise.all(subs.map(async (sub: (typeof subs)[number]) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body,
        { TTL: 60 * 60 * 24, urgency: 'high' }
      )
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode
      // Tarayıcı aboneliği iptal etmiş: kaydı temizle
      if (status === 404 || status === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      } else {
        console.error('Push gönderilemedi:', status ?? err)
      }
    }
  }))
}
