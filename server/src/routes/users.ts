import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/me', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, username: true, displayName: true, email: true, avatar: true, status: true, createdAt: true }
  })
  if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }
  res.json(user)
})

router.patch('/me', async (req: AuthRequest, res: Response) => {
  const { displayName, avatar, status } = req.body
  const data: Record<string, string> = {}
  if (displayName) data.displayName = displayName
  if (avatar !== undefined) data.avatar = avatar
  if (status) data.status = status

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data,
    select: { id: true, username: true, displayName: true, email: true, avatar: true, status: true }
  })
  res.json(user)
})

router.get('/:username', async (req: AuthRequest, res: Response) => {
  const username = String(req.params.username)
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, displayName: true, avatar: true, status: true }
  })
  if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }
  res.json(user)
})

export default router
