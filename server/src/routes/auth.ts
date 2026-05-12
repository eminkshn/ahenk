import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt'

const router = Router()

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000

router.post('/register', async (req: Request, res: Response) => {
  const { username, displayName, email, password } = req.body
  if (!username || !displayName || !email || !password) {
    res.status(400).json({ error: 'Tüm alanlar zorunludur' })
    return
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })
  if (existing) {
    res.status(409).json({ error: 'Bu email veya kullanıcı adı zaten kullanılıyor' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { username, displayName, email, password: hashed }
  })

  const accessToken = signAccess(user.id)
  const refreshToken = signRefresh(user.id)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_MS) }
  })

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email }
  })
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email ve şifre zorunludur' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Geçersiz email veya şifre' })
    return
  }

  const accessToken = signAccess(user.id)
  const refreshToken = signRefresh(user.id)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_MS) }
  })

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email }
  })
})

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token gerekli' })
    return
  }

  try {
    const payload = verifyRefresh(refreshToken)
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Geçersiz refresh token' })
      return
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const newAccess = signAccess(payload.sub)
    const newRefresh = signRefresh(payload.sub)
    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: payload.sub, expiresAt: new Date(Date.now() + REFRESH_MS) }
    })

    res.json({ accessToken: newAccess, refreshToken: newRefresh })
  } catch {
    res.status(401).json({ error: 'Geçersiz refresh token' })
  }
})

router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {})
  }
  res.json({ ok: true })
})

export default router
