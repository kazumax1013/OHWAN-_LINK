import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { Home, Users, MessageSquare, Building2 } from 'lucide-react-native'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'タイムライン',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'プロジェクト',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'メッセージ',
            tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="properties"
          options={{
            title: '物件管理',
            tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </>
  );
}