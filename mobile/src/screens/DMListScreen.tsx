import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import api from '../lib/api'
import { useDMStore, type Conversation } from '../store/dm'
import { useAuthStore } from '../store/auth'
import type { RootStackParamList } from '../../App'

type Nav = NativeStackNavigationProp<RootStackParamList, 'DMList'>

export default function DMListScreen() {
  const navigation = useNavigation<Nav>()
  const { user } = useAuthStore()
  const { conversations, setConversations, addConversation } = useDMStore()
  const [addInput, setAddInput] = useState('')

  useEffect(() => {
    api.get('/conversations').then(({ data }) => setConversations(data))
  }, [setConversations])

  async function sendFriendRequest() {
    if (!addInput.trim()) return
    try {
      await api.post('/friends/request', { username: addInput.trim() })
      Alert.alert('Başarılı', `${addInput} adlı kullanıcıya arkadaşlık isteği gönderildi`)
      setAddInput('')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      Alert.alert('Hata', e.response?.data?.error || 'Hata oluştu')
    }
  }

  async function openDM(conv: Conversation) {
    const other = conv.participants.find((p) => p.userId !== user?.id)
    if (!other) return
    navigation.navigate('DMConversation', {
      conversationId: conv.id,
      otherName: other.user.displayName,
      otherUsername: other.user.username,
    })
  }

  return (
    <View style={s.container}>
      <View style={s.addRow}>
        <TextInput
          style={s.input}
          placeholder="Arkadaş ekle (kullanıcı adı)"
          placeholderTextColor="#6d6f78"
          value={addInput}
          onChangeText={setAddInput}
          autoCapitalize="none"
        />
        <TouchableOpacity style={[s.addBtn, !addInput.trim() && s.addBtnDisabled]} onPress={sendFriendRequest} disabled={!addInput.trim()}>
          <Text style={s.addBtnText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <Text style={s.empty}>Henüz DM konuşman yok</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => {
            const other = item.participants.find((p) => p.userId !== user?.id)
            if (!other) return null
            return (
              <TouchableOpacity style={s.convItem} onPress={() => openDM(item)}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{other.user.displayName[0].toUpperCase()}</Text>
                </View>
                <View style={s.convInfo}>
                  <Text style={s.convName}>{other.user.displayName}</Text>
                  <Text style={s.convSub}>@{other.user.username}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#313338' },
  addRow: { flexDirection: 'row', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e1f22' },
  input: { flex: 1, backgroundColor: '#383a40', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14 },
  addBtn: { backgroundColor: '#5865f2', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { color: '#96989d', fontSize: 14, textAlign: 'center', padding: 32 },
  convItem: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2b2d31' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#5865f2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  convInfo: { flex: 1 },
  convName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  convSub: { color: '#96989d', fontSize: 13 },
  chevron: { color: '#96989d', fontSize: 20 },
})
