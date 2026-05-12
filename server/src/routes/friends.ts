import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  const requests = await prisma.friendRequest.findMany({
    where: { status: 'ACCEPTED', OR: [{ senderId: req.userId! }, { receiverId: req.userId! }] },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatar: true, status: true } },
      receiver: { select: { id: true, username: true, displayName: true, avatar: true, status: true } }
    }
  })
  const friends = requests.map((r: (typeof requests)[number]) => (r.senderId === req.userId ? r.receiver : r.sender))
  res.json(friends)
})

router.get('/requests', async (req: AuthRequest, res: Response) => {
  const [sent, received] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { senderId: req.userId!, status: 'PENDING' },
      include: { receiver: { select: { id: true, username: true, displayName: true, avatar: true } } }
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: req.userId!, status: 'PENDING' },
      include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } }
    })
  ])
  res.json({ sent, received })
})

router.post('/request', async (req: AuthRequest, res: Response) => {
  const { username } = req.body
  if (!username) { res.status(400).json({ error: 'Kullanıcı adı zorunludur' }); return }

  const target = await prisma.user.findUnique({ where: { username } })
  if (!target) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }
  if (target.id === req.userId) { res.status(400).json({ error: 'Kendinize istek gönderemezsiniz' }); return }

  const blocked = await prisma.block.findFirst({
    where: { OR: [{ blockerId: req.userId!, blockedId: target.id }, { blockerId: target.id, blockedId: req.userId! }] }
  })
  if (blocked) { res.status(403).json({ error: 'Bu kullanıcıya istek gönderilemiyor' }); return }

  const existing = await prisma.friendRequest.findFirst({
    where: { OR: [{ senderId: req.userId!, receiverId: target.id }, { senderId: target.id, receiverId: req.userId! }] }
  })
  if (existing) {
    if (existing.status === 'ACCEPTED') { res.status(409).json({ error: 'Zaten arkadaşsınız' }); return }
    if (existing.status === 'PENDING') { res.status(409).json({ error: 'Zaten bekleyen bir istek var' }); return }
    await prisma.friendRequest.delete({ where: { id: existing.id } })
  }

  const request = await prisma.friendRequest.create({
    data: { senderId: req.userId!, receiverId: target.id },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatar: true } },
      receiver: { select: { id: true, username: true, displayName: true, avatar: true } }
    }
  })
  res.status(201).json(request)
})

router.patch('/request/:id', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const { action } = req.body
  const request = await prisma.friendRequest.findFirst({ where: { id, receiverId: req.userId!, status: 'PENDING' } })
  if (!request) { res.status(404).json({ error: 'İstek bulunamadı' }); return }
  const updated = await prisma.friendRequest.update({
    where: { id },
    data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
  })
  res.json(updated)
})

router.delete('/:userId', async (req: AuthRequest, res: Response) => {
  const userId = String(req.params.userId)
  await prisma.friendRequest.deleteMany({
    where: { status: 'ACCEPTED', OR: [{ senderId: req.userId!, receiverId: userId }, { senderId: userId, receiverId: req.userId! }] }
  })
  res.json({ ok: true })
})

router.post('/block/:userId', async (req: AuthRequest, res: Response) => {
  const blockedId = String(req.params.userId)
  await prisma.block.create({ data: { blockerId: req.userId!, blockedId } }).catch(() => {})
  await prisma.friendRequest.deleteMany({
    where: { OR: [{ senderId: req.userId!, receiverId: blockedId }, { senderId: blockedId, receiverId: req.userId! }] }
  })
  res.json({ ok: true })
})

router.delete('/block/:userId', async (req: AuthRequest, res: Response) => {
  const blockedId = String(req.params.userId)
  await prisma.block.delete({ where: { blockerId_blockedId: { blockerId: req.userId!, blockedId } } }).catch(() => {})
  res.json({ ok: true })
})

export default router
