import { useEffect, useRef, useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import api from '../lib/api'
import { getSocket } from '../lib/socket'
import { useAppStore, type Message } from '../store/app'
import { useAuthStore } from '../store/auth'
import type { RootStackParamList } from '../../App'
import { colors } from '../theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Channel'>

export default function ChannelScreen() {
  const route = useRoute<Props['route']>()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { communityId, channelId, communityName, channelName } = route.params
  const { messages, setMessages, addMessage } = useAppStore()
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const flatRef = useRef<FlatList>(null)

  const channelMessages = messages[channelId] || []

  useEffect(() => {
    navigation.setOptions({ title: `#${channelName}`, headerBackTitle: communityName })
    api.get(`/channels/${channelId}/messages`).then(({ data }) => setMessages(channelId, data as Message[]))
    const socket = getSocket()
    socket?.emit('channel:join', channelId)
    socket?.on('message:new', (msg: Message) => { if (msg.channelId === channelId) addMessage(msg) })
    return () => {
      socket?.emit('channel:leave', channelId)
      socket?.off('message:new')
    }
  }, [channelId])

  function send() {
    const text = content.trim()
    if (!text || sending) return
    const socket = getSocket()
    if (!socket) return
    setSending(true)
    socket.emit('message:send', { channelId, content: text }, () => setSending(false))
    setContent('')
  }

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const prev = channelMessages[index - 1]
    const grouped = prev?.author.id === item.author.id &&
      new Date(item.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
    const isMe = item.author.id === user?.id

    return (
      <View style={[s.msgRow, !grouped && s.msgRowFirst]}>
        {!grouped ? (
          <View style={[s.avatar, isMe && s.avatarMe]}>
            <Text style={s.avatarText}>{item.author.displayName[0].toUpperCase()}</Text>
          </View>
        ) : <View style={s.avatarSpacer} />}
        <View style={s.msgContent}>
          {!grouped && (
            <View style={s.msgMeta}>
              <Text style={[s.msgAuthor, isMe && s.msgAuthorMe]}>{item.author.displayName}</Text>
              <Text style={s.msgTime}>
                {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          <Text style={s.msgText}>
            {item.content}
            {item.edited && <Text style={s.msgEdited}> (düzenlendi)</Text>}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {channelMessages.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.empty}>Bu kanalda henüz mesaj yok. İlk mesajı sen gönder!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={channelMessages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          style={s.list}
        />
      )}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={`#${channelName} kanalına yaz...`}
          placeholderTextColor={colors.textFaint}
          value={content}
          onChangeText={setContent}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!content.trim() || sending) && s.sendBtnDisabled]}
          onPress={send}
          disabled={!content.trim() || sending}
        >
          <Text style={s.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1, paddingHorizontal: 12 },
  emptyContainer: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  empty: { color: colors.textMuted, fontSize: 14 },
  msgRow: { flexDirection: 'row', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 4 },
  msgRowFirst: { marginTop: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.seal, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  avatarMe: { backgroundColor: colors.accent },
  avatarSpacer: { width: 36, marginRight: 10 },
  avatarText: { color: colors.ink, fontWeight: 'bold', fontSize: 13 },
  msgContent: { flex: 1 },
  msgMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 2 },
  msgAuthor: { color: colors.text, fontWeight: '600', fontSize: 14 },
  msgAuthorMe: { color: colors.accent },
  msgTime: { color: colors.textMuted, fontSize: 11 },
  msgText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  msgEdited: { color: colors.textMuted, fontSize: 11 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: colors.inset, gap: 8 },
  input: { flex: 1, backgroundColor: colors.elevated, color: colors.text, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { backgroundColor: colors.accent, width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.ink, fontSize: 16 },
})
