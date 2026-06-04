import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

const communityInclude = {
  channels: { include: { category: true }, orderBy: { position: 'asc' as const } },
  categories: { orderBy: { position: 'asc' as const } },
  roles: { orderBy: { position: 'asc' as const } },
  members: {
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true, status: true } },
      roles: { include: { role: true } }
    }
  }
}

// ─── Topluluk CRUD ────────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body
  if (!name) {
    res.status(400).json({ error: 'Topluluk adı zorunludur' })
    return
  }

  const community = await prisma.community.create({
    data: {
      name,
      description,
      ownerId: req.userId!,
      members: { create: { userId: req.userId! } },
      roles: { create: { name: '@everyone', permissions: BigInt(0), position: 0 } },
      channels: { create: { name: 'genel', type: 'TEXT', position: 0 } },
    },
    include: communityInclude
  })

  res.status(201).json(community)
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const communities = await prisma.community.findMany({
    where: { members: { some: { userId: req.userId! } } },
    include: communityInclude,
    orderBy: { createdAt: 'asc' }
  })
  res.json(communities)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const community = await prisma.community.findFirst({
    where: { id, members: { some: { userId: req.userId! } } },
    include: communityInclude
  })
  if (!community) {
    res.status(404).json({ error: 'Topluluk bulunamadı' })
    return
  }
  res.json(community)
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const community = await prisma.community.findFirst({
    where: { id, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, description } = req.body
  const updated = await prisma.community.update({
    where: { id },
    data: { ...(name && { name }), ...(description !== undefined && { description }) }
  })
  res.json(updated)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const community = await prisma.community.findFirst({
    where: { id, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }
  await prisma.community.delete({ where: { id } })
  res.json({ ok: true })
})

router.post('/join/:inviteCode', async (req: AuthRequest, res: Response) => {
  const inviteCode = String(req.params.inviteCode)
  const community = await prisma.community.findUnique({ where: { inviteCode } })
  if (!community) {
    res.status(404).json({ error: 'Geçersiz davet kodu' })
    return
  }

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: req.userId!, communityId: community.id } }
  })
  if (existing) {
    res.status(409).json({ error: 'Zaten bu topluluğun üyesisiniz' })
    return
  }

  await prisma.communityMember.create({
    data: { userId: req.userId!, communityId: community.id }
  })
  res.json(community)
})

router.post('/:id/leave', async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const community = await prisma.community.findUnique({ where: { id } })
  if (!community) {
    res.status(404).json({ error: 'Topluluk bulunamadı' })
    return
  }
  if (community.ownerId === req.userId) {
    res.status(400).json({ error: 'Topluluk sahibi ayrılamaz' })
    return
  }
  await prisma.communityMember.delete({
    where: { userId_communityId: { userId: req.userId!, communityId: id } }
  }).catch(() => {})
  res.json({ ok: true })
})

// ─── Kategoriler ──────────────────────────────────────────────────────────────

router.post('/:id/categories', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, position } = req.body
  if (!name) {
    res.status(400).json({ error: 'Kategori adı zorunludur' })
    return
  }

  const category = await prisma.category.create({
    data: { name, position: position ?? 0, communityId }
  })
  res.status(201).json(category)
})

router.patch('/:id/categories/:categoryId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const categoryId = String(req.params.categoryId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, position } = req.body
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { ...(name && { name }), ...(position !== undefined && { position }) }
  })
  res.json(category)
})

router.delete('/:id/categories/:categoryId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const categoryId = String(req.params.categoryId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }
  await prisma.category.delete({ where: { id: categoryId } })
  res.json({ ok: true })
})

// ─── Roller ───────────────────────────────────────────────────────────────────

router.post('/:id/roles', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, color, permissions, position } = req.body
  if (!name) {
    res.status(400).json({ error: 'Rol adı zorunludur' })
    return
  }

  const role = await prisma.role.create({
    data: {
      name,
      color: color ?? '#99AAB5',
      permissions: BigInt(permissions ?? 0),
      position: position ?? 1,
      communityId
    }
  })
  res.status(201).json(role)
})

router.patch('/:id/roles/:roleId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const roleId = String(req.params.roleId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }

  const { name, color, permissions, position } = req.body
  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(permissions !== undefined && { permissions: BigInt(permissions) }),
      ...(position !== undefined && { position })
    }
  })
  res.json(role)
})

router.delete('/:id/roles/:roleId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const roleId = String(req.params.roleId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }
  await prisma.role.delete({ where: { id: roleId } })
  res.json({ ok: true })
})

router.post('/:id/members/:memberId/roles/:roleId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const memberId = String(req.params.memberId)
  const roleId = String(req.params.roleId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }
  await prisma.memberRole.create({ data: { memberId, roleId } }).catch(() => {})
  res.json({ ok: true })
})

router.delete('/:id/members/:memberId/roles/:roleId', async (req: AuthRequest, res: Response) => {
  const communityId = String(req.params.id)
  const memberId = String(req.params.memberId)
  const roleId = String(req.params.roleId)
  const community = await prisma.community.findFirst({
    where: { id: communityId, ownerId: req.userId! }
  })
  if (!community) {
    res.status(403).json({ error: 'Yetki yok' })
    return
  }
  await prisma.memberRole.delete({
    where: { memberId_roleId: { memberId, roleId } }
  }).catch(() => {})
  res.json({ ok: true })
})

export default router
