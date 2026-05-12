import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useAuthStore } from './src/store/auth'
import { connectSocket } from './src/lib/socket'

import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'
import ChannelScreen from './src/screens/ChannelScreen'
import DMListScreen from './src/screens/DMListScreen'
import DMConversationScreen from './src/screens/DMConversationScreen'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Channel: { communityId: string; channelId: string; communityName: string; channelName: string }
  DMList: undefined
  DMConversation: { conversationId: string; otherName: string; otherUsername: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const DARK = {
  dark: true,
  colors: {
    primary: '#5865f2',
    background: '#313338',
    card: '#2b2d31',
    text: '#ffffff',
    border: '#1e1f22',
    notification: '#5865f2',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
}

export default function App() {
  const { user, accessToken, loadAuth } = useAuthStore()

  useEffect(() => {
    loadAuth().then(() => {
      if (accessToken) connectSocket(accessToken)
    })
  }, [])

  return (
    <NavigationContainer theme={DARK}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2b2d31' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'Ahenk',
                headerRight: () => (
                  <StatusBar style="light" />
                ),
              })}
            />
            <Stack.Screen name="Channel" component={ChannelScreen} />
            <Stack.Screen name="DMList" component={DMListScreen} options={{ title: 'Direkt Mesajlar' }} />
            <Stack.Screen name="DMConversation" component={DMConversationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
