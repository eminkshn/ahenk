import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import api from '../lib/api'
import { connectSocket } from '../lib/socket'
import { useAuthStore } from '../store/auth'
import { colors } from '../theme'

export default function LoginScreen() {
  const { setAuth } = useAuthStore()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register'
      const body = tab === 'login' ? { username, password } : { username, displayName, password }
      const { data } = await api.post(endpoint, body)
      await setAuth(data.user, data.accessToken, data.refreshToken)
      connectSocket(data.accessToken)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      Alert.alert('Hata', e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>ahenk</Text>
        <Text style={s.subtitle}>Toplumsal İletişim Platformu</Text>

        <View style={s.tabs}>
          {(['login', 'register'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabActive]}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'login' ? 'Giriş' : 'Kayıt'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={s.input}
          placeholder="Kullanıcı adı"
          placeholderTextColor={colors.textFaint}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {tab === 'register' && (
          <TextInput
            style={s.input}
            placeholder="Görünen ad"
            placeholderTextColor={colors.textFaint}
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput
          style={s.input}
          placeholder="Şifre"
          placeholderTextColor={colors.textFaint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={submit} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Yükleniyor...' : tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: 20, padding: 24 },
  logo: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, color: colors.accent, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', backgroundColor: colors.inset, borderRadius: 14, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: colors.ink },
  input: { backgroundColor: colors.inset, color: colors.text, borderRadius: 14, padding: 12, marginBottom: 10, fontSize: 14 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.ink, fontWeight: '600', fontSize: 15 },
})
