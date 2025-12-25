// Novel Reader - App Entry Point

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { useUIStore } from './src/stores/uiStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/stores/settingsStore';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

function AppContent() {
  const theme = useSettingsStore((state) => state.reader.theme);
  const setIsReaderOpen = useUIStore((state) => state.setIsReaderOpen);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        setIsReaderOpen(currentRouteName === 'ChapterReader');
      }}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
