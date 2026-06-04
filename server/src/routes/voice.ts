import { Router, Response } from 'express'
import { AccessToken } from 'livekit-server-sdk'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.post('/token', async (req: AuthRequest, res: Response) => {
  const { roomName } = req.body
  if (!roomName) { res.status(400).json({ error: 'roomName zorunludur' }); return }

  const userId = req.userId!

  // Validate access based on room prefix
  if (roomName.startsWith('channel-')) {
    const channelId = roomName.slice('channel-'.length)
    const channel = await prisma.channel.findUnique({ where: { id: channelId } })
    if (!channel || channel.type !== 'VOICE') { res.status(404).json({ error: 'Ses kanalı bulunamadı' }); return }
    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: channel.communityId } }
    })
    if (!member) { res.status(403).json({ error: 'Yetki yok' }); return }
  } else if (roomName.startsWith('dm-')) {
    const conversationId = roomName.slice('dm-'.length)
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } }
    })
    if (!participant) { res.status(403).json({ error: 'Yetki yok' }); return }
  } else {
    res.status(400).json({ error: 'Geçersiz oda adı' }); return
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const livekitUrl = process.env.LIVEKIT_URL
  if (!apiKey || !apiSecret || !livekitUrl) {
    res.status(503).json({ error: 'Ses servisi yapılandırılmamış' }); return
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } })

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: user?.displayName ?? userId,
    ttl: '4h',
  })
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true })

  res.json({ token: await at.toJwt(), url: livekitUrl })
})

export default router
