import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import 'dotenv/config'

import authRouter from './routes/auth'
import communityRouter from './routes/communities'
import channelRouter from './routes/channels'
import usersRouter from './routes/users'
import friendsRouter from './routes/friends'
import conversationsRouter from './routes/conversations'
import moderationRouter from './routes/moderation'
import voiceRouter from './routes/voice'
import { setupSocket } from './socket'
import { prisma } from './lib/prisma'

const app = express()
const httpServer = createServer(app)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const corsOptions = {
  origin: (origin: string | undefined, cb: (e: Error | null, ok?: boolean) => void) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('CORS: izin verilmeyen origin'))
    }
  },
  credentials: true,
}

const io = new Server(httpServer, { cors: corsOptions })

// BigInt'i JSON'da string olarak serileştir
app.set('json replacer', (_key: string, value: unknown) => {
  return typeof value === 'bigint' ? value.toString() : value
})

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/communities', communityRouter)
app.use('/api', channelRouter)
app.use('/api/users', usersRouter)
app.use('/api/friends', friendsRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api', moderationRouter)
app.use('/api/voice', voiceRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

async function cleanupOldMessages() {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const result = await prisma.message.deleteMany({
    where: {
      createdAt: { lt: oneYearAgo },
      stars: { none: {} },
    },
  })
  if (result.count > 0) console.log(`Temizlendi: ${result.count} yıldızsız eski mesaj silindi`)
}

cleanupOldMessages()
setInterval(cleanupOldMessages, 24 * 60 * 60 * 1000)

setupSocket(io)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Sunucu çalışıyor → http://localhost:${PORT}`)
})
