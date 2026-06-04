import { Server, Socket } from 'socket.io'
import { verifyAccess } from '../lib/jwt'
import { prisma } from '../lib/prisma'

const MAX_MSG_LEN = 2000

/** Wraps an async socket handler so unhandled rejections don't crash the process */
function safe<T>(event: string, fn: (data: T, cb?: (r: object) => void) => Promise<void>) {
  return async (data: T, cb?: (r: object) => void) => {
    try {
      await fn(data, cb)
    } catch (err) {
      console.error(`[socket:${event}]`, err)
      cb?.({ error: 'Sunucu hatası' })
    }
  }
}

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

    const memberships = await prisma.communityMember.findMany({ where: { userId }, select: { communityId: true } })
    memberships.forEach((m: (typeof memberships)[number]) => socket.join(`community:${m.communityId}`))

    const convParticipants = await prisma.conversationParticipant.findMany({ where: { userId }, select: { conversationId: true } })
    convParticipants.forEach((p: (typeof convParticipants)[number]) => socket.join(`conversation:${p.conversationId}`))

    // ─── Kanal ────────────────────────────────────────────────────────────────

    socket.on('channel:join', safe('channel:join', async (channelId: string) => {
      const channel = await prisma.channel.findUnique({ where: { id: channelId } })
      if (!channel) return
      const member = await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId: channel.communityId } }
      })
      if (!member) return
      socket.join(`channel:${channelId}`)
    }))

    socket.on('channel:leave', (channelId: string) => socket.leave(`channel:${channelId}`))

    socket.on('conversation:join', safe('conversation:join', async (conversationId: string) => {
      const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } }
      })
      if (participant) socket.join(`conversation:${conversationId}`)
    }))

    socket.on('conversation:leave', (conversationId: string) => socket.leave(`conversation:${conversationId}`))

    // ─── Kanal mesajları ──────────────────────────────────────────────────────

    socket.on('message:send', safe('message:send', async (data: { channelId: string; content: string }, cb) => {
      const content = data.content?.trim()
      if (!data.channelId || !content) { cb?.({ error: 'Geçersiz mesaj' }); return }
      if (content.length > MAX_MSG_LEN) { cb?.({ error: `Mesaj çok uzun (max ${MAX_MSG_LEN})` }); return }

      const channel = await prisma.channel.findUnique({ where: { id: data.channelId } })
      if (!channel) { cb?.({ error: 'Kanal bulunamadı' }); return }

      const member = await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId: channel.communityId } },
        include: { roles: { include: { role: { select: { permissions: true } } } } }
      })
      if (!member) { cb?.({ error: 'Yetki yok' }); return }

      // Ban kontrolü
      const ban = await prisma.communityBan.findUnique({
        where: { communityId_userId: { communityId: channel.communityId, userId } }
      })
      if (ban) { cb?.({ error: 'Bu topluluktan yasaklandınız' }); return }

      // Yavaş mod kontrolü (adminler muaf)
      const ADMIN_BIT = 1n
      const isAdmin = member.roles.some((mr: { role: { permissions: bigint } }) => (BigInt(mr.role.permissions) & ADMIN_BIT) !== 0n)
      if (channel.slowMode > 0 && !isAdmin) {
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

      const message = await prisma.message.create({
        data: { content, authorId: userId, channelId: data.channelId },
        include: { author: { select: { id: true, username: true, displayName: true, avatar: true } }, reactions: true }
      })

      io.to(`channel:${data.channelId}`).emit('message:new', message)
      cb?.({ ok: true, message })
    }))

    socket.on('message:edit', safe('message:edit', async (data: { messageId: string; content: string }, cb) => {
      const content = data.content?.trim()
      if (!content || content.length > MAX_MSG_LEN) { cb?.({ error: 'Geçersiz içerik' }); return }
      const message = await prisma.message.findFirst({ where: { id: data.messageId, authorId: userId } })
      if (!message) { cb?.({ error: 'Mesaj bulunamadı' }); return }

      const updated = await prisma.message.update({
        where: { id: data.messageId },
        data: { content, edited: true },
        include: { author: { select: { id: true, username: true, displayName: true, avatar: true } }, reactions: true }
      })

      io.to(`channel:${message.channelId}`).emit('message:updated', updated)
      cb?.({ ok: true, message: updated })
    }))

    socket.on('message:delete', safe('message:delete', async (data: { messageId: string }, cb) => {
      const message = await prisma.message.findFirst({ where: { id: data.messageId, authorId: userId } })
      if (!message) { cb?.({ error: 'Mesaj bulunamadı' }); return }
      await prisma.message.delete({ where: { id: data.messageId } })
      io.to(`channel:${message.channelId}`).emit('message:deleted', { messageId: data.messageId, channelId: message.channelId })
      cb?.({ ok: true })
    }))

    socket.on('message:react', safe('message:react', async (data: { messageId: string; emoji: string }, cb) => {
      if (!data.emoji || data.emoji.length > 10) { cb?.({ error: 'Geçersiz emoji' }); return }
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

      io.to(`channel:${message.channelId}`).emit('message:reactions', { messageId: data.messageId, channelId: message.channelId, reactions })
      cb?.({ ok: true })
    }))

    // ─── DM ───────────────────────────────────────────────────────────────────

    socket.on('dm:send', safe('dm:send', async (data: { conversationId: string; content: string }, cb) => {
      const content = data.content?.trim()
      if (!data.conversationId || !content) { cb?.({ error: 'Geçersiz mesaj' }); return }
      if (content.length > MAX_MSG_LEN) { cb?.({ error: `Mesaj çok uzun (max ${MAX_MSG_LEN})` }); return }

      const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: data.conversationId, userId } }
      })
      if (!participant) { cb?.({ error: 'Yetki yok' }); return }

      const dm = await prisma.directMessage.create({
        data: { content, senderId: userId, conversationId: data.conversationId },
        include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } }
      })

      io.to(`conversation:${data.conversationId}`).emit('dm:new', dm)
      cb?.({ ok: true, message: dm })
    }))

    socket.on('dm:edit', safe('dm:edit', async (data: { messageId: string; content: string }, cb) => {
      const content = data.content?.trim()
      if (!content || content.length > MAX_MSG_LEN) { cb?.({ error: 'Geçersiz içerik' }); return }
      const dm = await prisma.directMessage.findFirst({ where: { id: data.messageId, senderId: userId } })
      if (!dm) { cb?.({ error: 'Mesaj bulunamadı' }); return }

      const updated = await prisma.directMessage.update({
        where: { id: data.messageId },
        data: { content, edited: true },
        include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } }
      })

      io.to(`conversation:${dm.conversationId}`).emit('dm:updated', updated)
      cb?.({ ok: true, message: updated })
    }))

    socket.on('dm:delete', safe('dm:delete', async (data: { messageId: string }, cb) => {
      const dm = await prisma.directMessage.findFirst({ where: { id: data.messageId, senderId: userId } })
      if (!dm) { cb?.({ error: 'Mesaj bulunamadı' }); return }
      await prisma.directMessage.delete({ where: { id: data.messageId } })
      io.to(`conversation:${dm.conversationId}`).emit('dm:deleted', { messageId: data.messageId, conversationId: dm.conversationId })
      cb?.({ ok: true })
    }))

    // ─── Arkadaşlık bildirimleri ───────────────────────────────────────────────

    socket.on('friend:request', safe('friend:request', async (data: { targetUserId: string }, cb) => {
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
    }))

    // ─── Disconnect ────────────────────────────────────────────────────────────

    socket.on('disconnect', async () => {
      await prisma.user.update({ where: { id: userId }, data: { status: 'OFFLINE' } }).catch(() => {})
    })
  })
}
