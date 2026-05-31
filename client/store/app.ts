import { create } from 'zustand'

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string | null
  status?: string
}

export interface Message {
  id: string
  content: string
  channelId: string
  edited: boolean
  createdAt: string
  author: User
  starred?: boolean
}

export interface Channel {
  id: string
  name: string
  type: string
  topic: string | null
  position: number
  communityId: string
  categoryId: string | null
  slowMode: number
}

export interface Category {
  id: string
  name: string
  position: number
  communityId: string
}

export interface Role {
  id: string
  name: string
  color: string
  permissions: string
  position: number
}

export interface Member {
  id: string
  userId: string
  communityId: string
  nickname: string | null
  user: User
  roles: { role: Role }[]
}

export interface Community {
  id: string
  name: string
  description: string | null
  icon: string | null
  inviteCode: string
  ownerId: string
  channels: Channel[]
  categories: Category[]
  roles: Role[]
  members: Member[]
}

interface AppState {
  communities: Community[]
  selectedCommunityId: string | null
  selectedChannelId: string | null
  messages: Record<string, Message[]>

  setCommunities: (c: Community[]) => void
  addCommunity: (c: Community) => void
  selectCommunity: (id: string | null) => void
  selectChannel: (id: string | null) => void
  setMessages: (channelId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (message: Message) => void
  deleteMessage: (messageId: string, channelId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  communities: [],
  selectedCommunityId: null,
  selectedChannelId: null,
  messages: {},

  setCommunities: (communities) => set({ communities }),
  addCommunity: (community) => set((s) => ({ communities: [...s.communities, community] })),
  selectCommunity: (id) => set({ selectedCommunityId: id, selectedChannelId: null }),
  selectChannel: (id) => set({ selectedChannelId: id }),

  setMessages: (channelId, messages) =>
    set((s) => ({ messages: { ...s.messages, [channelId]: messages } })),

  addMessage: (message) =>
    set((s) => {
      const prev = s.messages[message.channelId] || []
      return { messages: { ...s.messages, [message.channelId]: [...prev, message] } }
    }),

  updateMessage: (message) =>
    set((s) => {
      const prev = s.messages[message.channelId] || []
      return {
        messages: {
          ...s.messages,
          [message.channelId]: prev.map((m) => (m.id === message.id ? message : m))
        }
      }
    }),

  deleteMessage: (messageId, channelId) =>
    set((s) => {
      const prev = s.messages[channelId] || []
      return {
        messages: { ...s.messages, [channelId]: prev.filter((m) => m.id !== messageId) }
      }
    })
}))
