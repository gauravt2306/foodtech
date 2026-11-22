import { AuthTokens } from '../types/api';

let tokens: AuthTokens | null = null;

export const getTokens = (): AuthTokens | null => {
  console.log('[tokens.ts] getTokens called, returning:', tokens ? 'yes' : 'no');
  return tokens;
};

export const setTokens = (newTokens: AuthTokens | null): void => {
  console.log('[tokens.ts] setTokens called with:', newTokens ? 'yes' : 'no');
  tokens = newTokens;
};

export const clearTokens = (): void => {
  console.log('[tokens.ts] clearTokens called');
  tokens = null;
};

// Initialize tokens from AsyncStorage on app startup
// Zustand persist stores data as { state: { user, tokens, isAuthenticated }, version: 0 }
export const initializeTokens = async (): Promise<AuthTokens | null> => {
  console.log('[initializeTokens] Starting...');
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    console.log('[initializeTokens] AsyncStorage loaded');
    const stored = await AsyncStorage.getItem('foodtech-auth');
    console.log('[initializeTokens] Got stored:', stored ? 'yes' : 'no');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Zustand persist format: { state: { tokens, user, isAuthenticated }, version: 0 }
      tokens = parsed.state?.tokens || parsed.tokens || null;
      console.log('[initializeTokens] Tokens found:', tokens ? 'yes' : 'no');
      return tokens;
    }
  } catch (error) {
    console.warn('[initializeTokens] Failed to load tokens from storage:', error);
  }
  console.log('[initializeTokens] Returning null');
  return null;
};