import { create } from 'zustand'

export interface FriendUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
  status: string
}

export interface FriendRequest {
  id: string
  senderId?: string
  receiverId?: string
  status: string
  sender?: FriendUser
  receiver?: FriendUser
}

interface FriendsState {
  friends: FriendUser[]
  sentRequests: FriendRequest[]
  receivedRequests: FriendRequest[]
  setFriends: (f: FriendUser[]) => void
  setRequests: (sent: FriendRequest[], received: FriendRequest[]) => void
  addFriend: (f: FriendUser) => void
  removeFriend: (id: string) => void
  removeRequest: (id: string) => void
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  setFriends: (friends) => set({ friends }),
  setRequests: (sentRequests, receivedRequests) => set({ sentRequests, receivedRequests }),
  addFriend: (f) => set((s) => ({ friends: [...s.friends, f] })),
  removeFriend: (id) => set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
  removeRequest: (id) => set((s) => ({
    sentRequests: s.sentRequests.filter((r) => r.id !== id),
    receivedRequests: s.receivedRequests.filter((r) => r.id !== id)
  }))
}))
