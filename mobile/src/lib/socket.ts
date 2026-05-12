import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://10.0.2.2:3001'

let socket: Socket | null = null

export function connectSocket(token: string) {
  if (socket?.connected) return socket
  socket = io(SOCKET_URL, { auth: { token } })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
