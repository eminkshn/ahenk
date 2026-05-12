import { create } from 'zustand'
import type { Message } from './app'

export interface DMParticipant {
  conversationId: string
  userId: string
  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    status: string
  }
}

export interface Conversation {
  id: string
  createdAt: string
  participants: DMParticipant[]
  messages?: { id: string; content: string; sender: { id: string; displayName: string } }[]
}

export interface DMMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  edited: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
}

interface DMState {
  conversations: Conversation[]
  messages: Record<string, DMMessage[]>
  setConversations: (c: Conversation[]) => void
  addConversation: (c: Conversation) => void
  setMessages: (conversationId: string, messages: DMMessage[]) => void
  addMessage: (message: DMMessage) => void
  updateMessage: (message: DMMessage) => void
  deleteMessage: (messageId: string, conversationId: string) => void
}

export const useDMStore = create<DMState>((set) => ({
  conversations: [],
  messages: {},
  setConversations: (conversations) => set({ conversations }),
  addConversation: (c) => set((s) => ({ conversations: [c, ...s.conversations.filter((x) => x.id !== c.id)] })),
  setMessages: (conversationId, messages) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: messages } })),
  addMessage: (message) =>
    set((s) => {
      const prev = s.messages[message.conversationId] || []
      return { messages: { ...s.messages, [message.conversationId]: [...prev, message] } }
    }),
  updateMessage: (message) =>
    set((s) => {
      const prev = s.messages[message.conversationId] || []
      return { messages: { ...s.messages, [message.conversationId]: prev.map((m) => m.id === message.id ? message : m) } }
    }),
  deleteMessage: (messageId, conversationId) =>
    set((s) => {
      const prev = s.messages[conversationId] || []
      return { messages: { ...s.messages, [conversationId]: prev.filter((m) => m.id !== messageId) } }
    })
}))
