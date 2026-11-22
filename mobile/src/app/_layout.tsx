import { Slot } from 'expo-router';
import { Providers } from '@/providers';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState, useRef } from 'react';
import { RootNavigator } from '@/navigation/RootNavigator';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();
  const [initCalled, setInitCalled] = useState(false);
  const initCalledRef = useRef(false);

  console.log('[RootLayout] Render:', { isInitialized, initCalled });

  useEffect(() => {
    if (!initCalledRef.current) {
      console.log('[RootLayout] Calling initialize');
      initCalledRef.current = true;
      setInitCalled(true);
      // Defer initialize to next tick to avoid synchronous setState in effect
      setTimeout(() => initialize(), 0);
    }
  }, [initialize]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <Providers>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Initializing app...</Text>
        </View>
      </Providers>
    );
  }

  return (
    <Providers>
      <RootNavigator />
      <Slot />
    </Providers>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});