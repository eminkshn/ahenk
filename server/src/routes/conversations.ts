import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

const participantInclude = {
  user: { select: { id: true, username: true, displayName: true, avatar: true, status: true } }
}

router.get('/', async (req: AuthRequest, res: Response) => {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.userId! } } },
    include: {
      participants: { include: participantInclude },
      messages: { orderBy: { createdAt: 'desc' as const }, take: 1, include: { sender: { select: { id: true, displayName: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(conversations)
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { userId } = req.body
  if (!userId) { res.status(400).json({ error: 'userId zorunludur' }); return }
  if (userId === req.userId) { res.status(400).json({ error: 'Kendinizle mesajlaşamazsınız' }); return }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: req.userId! } } },
        { participants: { some: { userId } } }
      ]
    },
    include: { participants: { include: participantInclude } }
  })

  if (existing) { res.json(existing); return }

  const conversation = await prisma.conversation.create({
    data: { participants: { create: [{ userId: req.userId! }, { userId }] } },
    include: { participants: { include: participantInclude } }
  })
  res.status(201).json(conversation)
})

router.get('/:id/messages', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: req.userId! } }
  })
  if (!participant) { res.status(403).json({ error: 'Yetki yok' }); return }

  const { before, limit = '50' } = req.query
  const messages = await prisma.directMessage.findMany({
    where: { conversationId: id, ...(before && { createdAt: { lt: new Date(before as string) } }) },
    include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Number(limit), 100)
  })
  res.json(messages.reverse())
})

export default router
