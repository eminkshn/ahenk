import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tek-uçuşlu yenileme: aynı anda düşen birçok 401 tek bir /auth/refresh'i bekler.
// Sunucu refresh token'ı döndürdüğü (rotation) için yeni ikisini birden saklamazsak
// bir sonraki yenileme eski (silinmiş) token'la başarısız olup çıkışa düşürüyordu.
let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState()
  if (!refreshToken) { logout(); return null }
  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken as string
  } catch {
    logout()
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      // Eşzamanlı 401'ler aynı yenileme sözünü paylaşır
      if (!refreshing) {
        refreshing = refreshAccessToken().finally(() => { refreshing = null })
      }
      const newToken = await refreshing
      if (!newToken) return Promise.reject(error)
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    }
    return Promise.reject(error)
  }
)

export default api
