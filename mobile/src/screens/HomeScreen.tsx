import { useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import api from '../lib/api'
import { useAppStore, type Community } from '../store/app'
import { useAuthStore } from '../store/auth'
import { disconnectSocket } from '../lib/socket'
import type { RootStackParamList } from '../../App'

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>

export default function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const { communities, setCommunities } = useAppStore()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    api.get('/communities').then(({ data }) => setCommunities(data))
  }, [setCommunities])

  async function handleLogout() {
    disconnectSocket()
    await logout()
  }

  async function joinCommunity() {
    Alert.prompt('Topluluğa Katıl', 'Davet kodunu gir:', async (code) => {
      if (!code) return
      try {
        const { data } = await api.post('/communities/join', { inviteCode: code })
        setCommunities([...communities, data])
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } } }
        Alert.alert('Hata', e.response?.data?.error || 'Geçersiz kod')
      }
    })
  }

  async function createCommunity() {
    Alert.prompt('Topluluk Oluştur', 'Topluluk adı:', async (name) => {
      if (!name) return
      try {
        const { data } = await api.post('/communities', { name })
        setCommunities([...communities, data])
      } catch {}
    })
  }

  function goToCommunity(community: Community) {
    const firstChannel = community.channels.sort((a, b) => a.position - b.position)[0]
    if (firstChannel) {
      navigation.navigate('Channel', {
        communityId: community.id,
        channelId: firstChannel.id,
        communityName: community.name,
        channelName: firstChannel.name,
      })
    }
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Merhaba, {user?.displayName}</Text>
          <Text style={s.subtext}>@{user?.username}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('DMList')} style={s.dmBtn}>
            <Text style={s.dmBtnText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
            <Text style={s.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={createCommunity}>
          <Text style={s.actionBtnText}>+ Topluluk Oluştur</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.actionBtnSecondary]} onPress={joinCommunity}>
          <Text style={s.actionBtnTextSecondary}>Katıl</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Toplulukların</Text>

      {communities.length === 0 ? (
        <Text style={s.empty}>Henüz topluluğun yok. Bir tane oluştur veya katıl!</Text>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.communityItem} onPress={() => goToCommunity(item)}>
              <View style={s.communityIcon}>
                <Text style={s.communityIconText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={s.communityInfo}>
                <Text style={s.communityName}>{item.name}</Text>
                <Text style={s.communityDesc}>{item.channels.length} kanal</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#313338' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  greeting: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subtext: { color: '#96989d', fontSize: 13 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dmBtn: { backgroundColor: '#383a40', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dmBtnText: { fontSize: 18 },
  logoutBtn: { backgroundColor: '#383a40', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#96989d', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  actionBtn: { flex: 1, backgroundColor: '#5865f2', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  actionBtnSecondary: { backgroundColor: '#383a40' },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  actionBtnTextSecondary: { color: '#dbdee1', fontWeight: '600', fontSize: 14 },
  sectionTitle: { color: '#96989d', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingVertical: 8 },
  empty: { color: '#96989d', fontSize: 14, textAlign: 'center', padding: 32 },
  communityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2b2d31' },
  communityIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#5865f2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  communityIconText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  communityInfo: { flex: 1 },
  communityName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  communityDesc: { color: '#96989d', fontSize: 13 },
  chevron: { color: '#96989d', fontSize: 20 },
})
