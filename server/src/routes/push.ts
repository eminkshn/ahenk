import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { vapidPublicKey } from '../lib/push'

const router = Router()

router.get('/public-key', (_req, res: Response) => {
  if (!vapidPublicKey) { res.status(503).json({ error: 'Bildirimler bu sunucuda kapalı' }); return }
  res.json({ publicKey: vapidPublicKey })
})

router.use(requireAuth)

router.post('/subscribe', async (req: AuthRequest, res: Response) => {
  const { endpoint, keys } = req.body ?? {}
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') ||
      typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
    res.status(400).json({ error: 'Geçersiz abonelik' })
    return
  }

  // Aynı cihazda başka hesaba geçildiyse abonelik yeni kullanıcıya taşınır
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: req.userId! },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: req.userId! },
  })
  res.status(201).json({ ok: true })
})

router.post('/unsubscribe', async (req: AuthRequest, res: Response) => {
  const { endpoint } = req.body ?? {}
  if (typeof endpoint !== 'string') { res.status(400).json({ error: 'endpoint zorunludur' }); return }
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.userId! } })
  res.json({ ok: true })
})

export default router
