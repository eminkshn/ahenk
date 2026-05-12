import { Server, Socket } from 'socket.io'
import { verifyAccess } from '../lib/jwt'
import { prisma } from '../lib/prisma'

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string
    if (!token) return next(new Error('Unauthorized'))
    try {
      const payload = verifyAccess(token)
      socket.data.userId = payload.sub
      next()
    } catch {
      next(new Error('Token geçersiz'))
    }
  })

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId as string

    await prisma.user.update({ where: { id: userId }, data: { status: 'ONLINE' } }).catch(() => {})

    // Join community rooms
    const memberships = await prisma.communityMember.findMany({ where: { userId }, select: { communityId: true } })
    memberships.forEach((m: (typeof memberships)[number]) => socket.join(`community:${m.communityId}`))

    // Join DM conversation rooms
    const convParticipants = await prisma.conversationParticipant.findMany({ where: { userId }, select: { conversationId: true } })
    convParticipants.forEach((p: (typeof convParticipants)[number]) => socket.join(`conversation:${p.conversationId}`))

    // ─── Kanal ────────────────────────────────────────────────────────────────

    socket.on('channel:join', async (channelId: string) => {
      const channel = await prisma.channel.findUnique({ where: { id: channelId } })
      if (!channel) return
      const member = await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId: channel.communityId } }
      })
      if (!member) return
      socket.join(`channel:${channelId}`)
    })

    socket.on('channel:leave', (channelId: string) => socket.leave(`channel:${channelId}`))

    // ─── Kanal mesajları ──────────────────────────────────────────────────────

    socket.on('message:send', async (data: { channelId: string; content: string }, cb?: (r: object) => void) => {
      if (!data.channelId || !data.content?.trim()) { cb?.({ error: 'Geçersiz mesaj' }); return }

      const channel = await prisma.channel.findUnique({ where: { id: data.channelId } })
      if (!channel) { cb?.({ error: 'Kanal bulunamadı' }); return }

      // Yavaş mod kontrolü
      if (channel.slowMode > 0) {
        const recent = await prisma.message.findFirst({
          where: { channelId: data.channelId, authorId: userId },
          orderBy: { createdAt: 'desc' }
        })
        if (recent) {
          const elapsed = (Date.now() - new Date(recent.createdAt).getTime()) / 1000
          if (elapsed < channel.slowMode) {
            cb?.({ error: `Yavaş mod: ${Math.ceil(channel.slowMode - elapsed)} saniye bekleyin` }); return
          }
        }
      }

      const member = await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId: channel.communityId } }
      })
      if (!member) { cb?.({ error: 'Yetki yok' }); return }

      const message = await prisma.message.create({
        data: { content: data.content.trim(), authorId: userId, channelId: data.channelId },
        include: { author: { select: { id: true, username: true, displayName: true, avatar: true } }, reactions: true }
      })

      io.to(`channel:${data.channelId}`).emit('message:new', message)
      cb?.({ ok: true, message })
    })

    socket.on('message:edit', async (data: { messageId: string; content: string }, cb?: (r: object) => void) => {
      const message = await prisma.message.findFirst({ where: { id: data.messageId, authorId: userId } })
      if (!message) { cb?.({ error: 'Mesaj bulunamadı' }); return }

      const updated = await prisma.message.update({
        where: { id: data.messageId },
        data: { content: data.content.trim(), edited: true },
        include: { author: { select: { id: true, username: true, displayName: true, avatar: true } }, reactions: true }
      })

      io.to(`channel:${message.channelId}`).emit('message:updated', updated)
      cb?.({ ok: true, message: updated })
    })

    socket.on('message:delete', async (data: { messageId: string }, cb?: (r: object) => void) => {
      const message = await prisma.message.findFirst({ where: { id: data.messageId, authorId: userId } })
      if (!message) { cb?.({ error: 'Mesaj bulunamadı' }); return }
      await prisma.message.delete({ where: { id: data.messageId } })
      io.to(`channel:${message.channelId}`).emit('message:deleted', { messageId: data.messageId, channelId: message.channelId })
      cb?.({ ok: true })
    })

    socket.on('message:react', async (data: { messageId: string; emoji: string }, cb?: (r: object) => void) => {
      const message = await prisma.message.findUnique({ where: { id: data.messageId } })
      if (!message) { cb?.({ error: 'Mesaj bulunamadı' }); return }

      const existing = await prisma.messageReaction.findUnique({
        where: { messageId_userId_emoji: { messageId: data.messageId, userId, emoji: data.emoji } }
      })

      if (existing) {
        await prisma.messageReaction.delete({ where: { id: existing.id } })
      } else {
        await prisma.messageReaction.create({ data: { messageId: data.messageId, userId, emoji: data.emoji } })
      }

      const reactions = await prisma.messageReaction.findMany({
        where: { messageId: data.messageId },
        include: { user: { select: { id: true, username: true } } }
      })

      io.to(`channel:${message.channelId}`).emit('message:reactions', { messageId: data.messageId, reactions })
      cb?.({ ok: true })
    })

    // ─── DM ───────────────────────────────────────────────────────────────────

    socket.on('dm:send', async (data: { conversationId: string; content: string }, cb?: (r: object) => void) => {
      if (!data.conversationId || !data.content?.trim()) { cb?.({ error: 'Geçersiz mesaj' }); return }

      const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: data.conversationId, userId } }
      })
      if (!participant) { cb?.({ error: 'Yetki yok' }); return }

      const dm = await prisma.directMessage.create({
        data: { content: data.content.trim(), senderId: userId, conversationId: data.conversationId },
        include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } }
      })

      io.to(`conversation:${data.conversationId}`).emit('dm:new', dm)
      cb?.({ ok: true, message: dm })
    })

    socket.on('dm:edit', async (data: { messageId: string; content: string }, cb?: (r: object) => void) => {
      const dm = await prisma.directMessage.findFirst({ where: { id: data.messageId, senderId: userId } })
      if (!dm) { cb?.({ error: 'Mesaj bulunamadı' }); return }

      const updated = await prisma.directMessage.update({
        where: { id: data.messageId },
        data: { content: data.content.trim(), edited: true },
        include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } }
      })

      io.to(`conversation:${dm.conversationId}`).emit('dm:updated', updated)
      cb?.({ ok: true, message: updated })
    })

    socket.on('dm:delete', async (data: { messageId: string }, cb?: (r: object) => void) => {
      const dm = await prisma.directMessage.findFirst({ where: { id: data.messageId, senderId: userId } })
      if (!dm) { cb?.({ error: 'Mesaj bulunamadı' }); return }
      await prisma.directMessage.delete({ where: { id: data.messageId } })
      io.to(`conversation:${dm.conversationId}`).emit('dm:deleted', { messageId: data.messageId, conversationId: dm.conversationId })
      cb?.({ ok: true })
    })

    // ─── Arkadaşlık bildirimleri ───────────────────────────────────────────────

    socket.on('friend:request', async (data: { targetUserId: string }, cb?: (r: object) => void) => {
      const targetSocket = [...io.sockets.sockets.values()].find(
        (s) => s.data.userId === data.targetUserId
      )
      if (targetSocket) {
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true, displayName: true, avatar: true }
        })
        targetSocket.emit('friend:request_received', { sender })
      }
      cb?.({ ok: true })
    })

    // ─── Disconnect ────────────────────────────────────────────────────────────

    socket.on('disconnect', async () => {
      await prisma.user.update({ where: { id: userId }, data: { status: 'OFFLINE' } }).catch(() => {})
    })
  })
}
