import { create } from 'zustand'

export interface User { id: string; username: string; displayName: string; avatar: string | null }
export interface Channel { id: string; name: string; type: string; topic: string | null; position: number; categoryId: string | null }
export interface Category { id: string; name: string; position: number }
export interface Community { id: string; name: string; description: string | null; icon: string | null; inviteCode: string; ownerId: string; channels: Channel[]; categories: Category[] }
export interface Message { id: string; content: string; channelId: string; edited: boolean; createdAt: string; author: User }

interface AppState {
  communities: Community[]
  messages: Record<string, Message[]>
  setCommunities: (c: Community[]) => void
  addCommunity: (c: Community) => void
  setMessages: (channelId: string, msgs: Message[]) => void
  addMessage: (msg: Message) => void
  updateMessage: (msg: Message) => void
  deleteMessage: (messageId: string, channelId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  communities: [],
  messages: {},
  setCommunities: (communities) => set({ communities }),
  addCommunity: (c) => set((s) => ({ communities: [...s.communities, c] })),
  setMessages: (channelId, msgs) => set((s) => ({ messages: { ...s.messages, [channelId]: msgs } })),
  addMessage: (msg) => set((s) => {
    const prev = s.messages[msg.channelId] || []
    return { messages: { ...s.messages, [msg.channelId]: [...prev, msg] } }
  }),
  updateMessage: (msg) => set((s) => {
    const prev = s.messages[msg.channelId] || []
    return { messages: { ...s.messages, [msg.channelId]: prev.map((m) => m.id === msg.id ? msg : m) } }
  }),
  deleteMessage: (messageId, channelId) => set((s) => {
    const prev = s.messages[channelId] || []
    return { messages: { ...s.messages, [channelId]: prev.filter((m) => m.id !== messageId) } }
  }),
}))
