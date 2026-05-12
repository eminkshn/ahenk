'use client'

import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { useDMStore, type DMMessage } from '@/store/dm'
import type { Message } from '@/store/app'

let socket: Socket | null = null

export function getSocket() {
  return socket
}

export function useSocket() {
  const { accessToken } = useAuthStore()
  const { addMessage, updateMessage, deleteMessage } = useAppStore()
  const { addMessage: addDM, updateMessage: updateDM, deleteMessage: deleteDM } = useDMStore()

  useEffect(() => {
    if (!accessToken || socket) return

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token: accessToken }
    })

    socket.on('message:new', (msg: Message) => addMessage(msg))
    socket.on('message:updated', (msg: Message) => updateMessage(msg))
    socket.on('message:deleted', ({ messageId, channelId }: { messageId: string; channelId: string }) =>
      deleteMessage(messageId, channelId)
    )

    socket.on('dm:new', (msg: DMMessage) => addDM(msg))
    socket.on('dm:updated', (msg: DMMessage) => updateDM(msg))
    socket.on('dm:deleted', ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      deleteDM(messageId, conversationId)
    )

    return () => {
      socket?.disconnect()
      socket = null
    }
  }, [accessToken, addMessage, updateMessage, deleteMessage, addDM, updateDM, deleteDM])

  return socket
}
