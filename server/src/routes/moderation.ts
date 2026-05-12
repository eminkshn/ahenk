import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// Üyeyi at (kick)
router.delete('/communities/:communityId/members/:userId/kick', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const userId = String(req.params.userId)
  const community = await prisma.community.findFirst({ where: { id: communityId, ownerId: req.userId! } })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }
  if (userId === req.userId) { res.status(400).json({ error: 'Kendinizi atamazsınız' }); return }
  await prisma.communityMember.delete({
    where: { userId_communityId: { userId, communityId } }
  }).catch(() => {})
  res.json({ ok: true })
})

// Üyeyi banla
router.post('/communities/:communityId/members/:userId/ban', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const userId = String(req.params.userId)
  const community = await prisma.community.findFirst({ where: { id: communityId, ownerId: req.userId! } })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }
  if (userId === req.userId) { res.status(400).json({ error: 'Kendinizi banlayamazsınız' }); return }
  const { reason } = req.body

  await prisma.communityMember.delete({ where: { userId_communityId: { userId, communityId } } }).catch(() => {})
  await prisma.communityBan.create({ data: { communityId, userId, bannedById: req.userId!, reason } }).catch(() => {})
  res.json({ ok: true })
})

// Banı kaldır
router.delete('/communities/:communityId/bans/:userId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const userId = String(req.params.userId)
  const community = await prisma.community.findFirst({ where: { id: communityId, ownerId: req.userId! } })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }
  await prisma.communityBan.delete({ where: { communityId_userId: { communityId, userId } } }).catch(() => {})
  res.json({ ok: true })
})

// Ban listesi
router.get('/communities/:communityId/bans', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const community = await prisma.community.findFirst({ where: { id: communityId, ownerId: req.userId! } })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }
  const bans = await prisma.communityBan.findMany({
    where: { communityId },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true } },
      bannedBy: { select: { id: true, username: true, displayName: true } }
    }
  })
  res.json(bans)
})

// Kanal yavaş modu
router.patch('/communities/:communityId/channels/:channelId/slowmode', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.communityId)
  const channelId = String(req.params.channelId)
  const community = await prisma.community.findFirst({ where: { id: communityId, ownerId: req.userId! } })
  if (!community) { res.status(403).json({ error: 'Yetki yok' }); return }
  const { seconds } = req.body
  const channel = await prisma.channel.update({
    where: { id: channelId },
    data: { slowMode: Math.max(0, Number(seconds) || 0) }
  })
  res.json(channel)
})

// Reaksiyon ekle/kaldır (toggle)
router.post('/messages/:messageId/reactions', async (req: AuthRequest, res: Response) => {
  const messageId = String(req.params.messageId)
  const { emoji } = req.body
  if (!emoji) { res.status(400).json({ error: 'Emoji zorunludur' }); return }

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) { res.status(404).json({ error: 'Mesaj bulunamadı' }); return }

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: req.userId!, emoji } }
  })

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } })
    res.json({ removed: true, emoji })
  } else {
    await prisma.messageReaction.create({ data: { messageId, userId: req.userId!, emoji } })
    res.json({ added: true, emoji })
  }
})

// Mesaj reaksiyonları
router.get('/messages/:messageId/reactions', async (req: AuthRequest, res: Response) => {
  const messageId = String(req.params.messageId)
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
    include: { user: { select: { id: true, username: true, displayName: true } } }
  })
  res.json(reactions)
})

export default router
