import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.post('/communities/:communityId/channels', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, type, topic, position, categoryId } = req.body
  if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
    res.status(400).json({ error: 'Kanal adı 1-100 karakter olmalıdır' })
    return
  }
  const ALLOWED_TYPES = ['TEXT', 'ANNOUNCEMENT', 'VOICE']
  if (type && !ALLOWED_TYPES.includes(type)) {
    res.status(400).json({ error: 'Geçersiz kanal türü' })
    return
  }

  const channel = await prisma.channel.create({
    data: {
      name: name.trim(),
      type: type ?? 'TEXT',
      topic: topic ? String(topic).slice(0, 1024) : null,
      position: position ?? 0,
      communityId,
      categoryId: categoryId ?? null
    }
  })
  res.status(201).json(channel)
})

router.patch('/communities/:communityId/channels/:channelId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const channelId = String(req.params.channelId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }

  // IDOR fix: verify channel belongs to this community
  const existing = await prisma.channel.findFirst({ where: { id: channelId, communityId } })
  if (!existing) { res.status(404).json({ error: 'Kanal bulunamadı' }); return }

  const { name, topic, position, categoryId } = req.body
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100)) {
    res.status(400).json({ error: 'Kanal adı 1-100 karakter olmalıdır' }); return
  }
  const channel = await prisma.channel.update({
    where: { id: channelId },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(topic !== undefined && { topic: topic ? String(topic).slice(0, 1024) : null }),
      ...(position !== undefined && { position }),
      ...(categoryId !== undefined && { categoryId })
    }
  })
  res.json(channel)
})

router.delete('/communities/:communityId/channels/:channelId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const channelId = String(req.params.channelId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }

  // IDOR fix: verify channel belongs to this community
  const existing = await prisma.channel.findFirst({ where: { id: channelId, communityId } })
  if (!existing) { res.status(404).json({ error: 'Kanal bulunamadı' }); return }

  await prisma.channel.delete({ where: { id: channelId } })
  res.json({ ok: true })
})

// ─── Mesaj Yıldızlama ────────────────────────────────────────────────────────

router.post('/channels/:channelId/messages/:messageId/star', async (req: AuthRequest, res: Response) => {
  const messageId = String(req.params.messageId)
  await prisma.starredMessage.upsert({
    where: { userId_messageId: { userId: req.userId!, messageId } },
    create: { userId: req.userId!, messageId },
    update: {},
  })
  res.json({ ok: true })
})

router.delete('/channels/:channelId/messages/:messageId/star', async (req: AuthRequest, res: Response) => {
  const messageId = String(req.params.messageId)
  await prisma.starredMessage.delete({
    where: { userId_messageId: { userId: req.userId!, messageId } }
  }).catch(() => {})
  res.json({ ok: true })
})

router.get('/channels/:channelId/starred', async (req: AuthRequest, res: Response) => {
  const channelId = String(req.params.channelId)
  const starred = await prisma.starredMessage.findMany({
    where: { userId: req.userId!, message: { channelId } },
    include: {
      message: {
        include: { author: { select: { id: true, username: true, displayName: true, avatar: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(starred.map((s: (typeof starred)[number]) => s.message))
})

router.get('/channels/:channelId/messages', async (req: AuthRequest, res: Response) => {
  const channelId = String(req.params.channelId)
  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    res.status(404).json({ error: 'Kanal bulunamadı' })
    return
  }

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: req.userId!, communityId: channel.communityId } }
  })
  if (!member) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { before, limit = '50' } = req.query
  const messages = await prisma.message.findMany({
    where: {
      channelId,
      ...(before && { createdAt: { lt: new Date(before as string) } })
    },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Number(limit), 100)
  })

  res.json(messages.reverse())
})

export default router
