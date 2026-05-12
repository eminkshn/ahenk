import { create } from 'zustand'

export interface DMParticipant {
  conversationId: string
  userId: string
  user: { id: string; username: string; displayName: string; avatar: string | null; status: string }
}

export interface Conversation {
  id: string
  createdAt: string
  participants: DMParticipant[]
}

export interface DMMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  edited: boolean
  createdAt: string
  sender: { id: string; username: string; displayName: string; avatar: string | null }
}

interface DMState {
  conversations: Conversation[]
  messages: Record<string, DMMessage[]>
  setConversations: (c: Conversation[]) => void
  addConversation: (c: Conversation) => void
  setMessages: (id: string, msgs: DMMessage[]) => void
  addMessage: (msg: DMMessage) => void
}

export const useDMStore = create<DMState>((set) => ({
  conversations: [],
  messages: {},
  setConversations: (conversations) => set({ conversations }),
  addConversation: (c) => set((s) => ({ conversations: [c, ...s.conversations.filter((x) => x.id !== c.id)] })),
  setMessages: (id, msgs) => set((s) => ({ messages: { ...s.messages, [id]: msgs } })),
  addMessage: (msg) => set((s) => {
    const prev = s.messages[msg.conversationId] || []
    return { messages: { ...s.messages, [msg.conversationId]: [...prev, msg] } }
  }),
}))
