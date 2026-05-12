import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: string
  username: string
  displayName: string
  avatar: string | null
  status: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>
  loadAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setAuth: async (user, accessToken, refreshToken) => {
    await AsyncStorage.setItem('user', JSON.stringify(user))
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken, refreshToken })
  },

  loadAuth: async () => {
    const userStr = await AsyncStorage.getItem('user')
    const accessToken = await AsyncStorage.getItem('accessToken')
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    const user = userStr ? JSON.parse(userStr) as User : null
    set({ user, accessToken, refreshToken })
  },

  logout: async () => {
    await AsyncStorage.removeItem('user')
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('refreshToken')
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))
