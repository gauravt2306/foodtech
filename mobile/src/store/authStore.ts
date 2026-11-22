import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens, UserRole } from '../types/api';
import { apiClient } from '../api/client';
import { setTokens, clearTokens, initializeTokens, getTokens } from '../api/tokens';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      clearError: () => set({ error: null }),

      setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),

      login: async (email: string, password: string) => {
        console.log('[AuthStore] login attempt:', email);
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await apiClient.login(email, password);
          console.log('[AuthStore] login success:', user);
          setTokens(tokens);
          set({ user, tokens, isAuthenticated: true, isLoading: false, isInitialized: true });
        } catch (error: any) {
          console.log('[AuthStore] login error:', error);
          set({ error: error.message || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, role: UserRole, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await apiClient.register(email, password, role, name);
          setTokens(tokens);
          set({ user, tokens, isAuthenticated: true, isLoading: false, isInitialized: true });
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          clearTokens();
          set({ user: null, tokens: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
      },

      refreshAuth: async () => {
        console.log('[AuthStore] refreshAuth called');
        const tokens = getTokens();
        console.log('[AuthStore] refreshAuth tokens:', tokens ? 'exist' : 'none');
        if (!tokens?.refreshToken) {
          console.log('[AuthStore] refreshAuth no refresh token, setting initialized');
          set({ isInitialized: true });
          return;
        }

        try {
          console.log('[AuthStore] refreshAuth calling getMe');
          const { user } = await apiClient.getMe();
          console.log('[AuthStore] refreshAuth getMe success:', user);
          set({ user, isAuthenticated: true, isInitialized: true });
        } catch (error) {
          console.log('[AuthStore] refreshAuth getMe error:', error);
          // If me call fails, try to refresh token
          try {
            console.log('[AuthStore] refreshAuth trying refreshToken');
            const { accessToken, refreshToken } = await apiClient.refreshToken(tokens.refreshToken);
            setTokens({ accessToken, refreshToken });
            const { user } = await apiClient.getMe();
            set({ user, isAuthenticated: true, isInitialized: true });
          } catch (refreshError) {
            // Refresh failed, clear auth
            console.log('[AuthStore] refreshAuth refreshToken failed:', refreshError);
            clearTokens();
            set({ user: null, tokens: null, isAuthenticated: false, isInitialized: true });
          }
        }
      },

      refreshAccessToken: async () => {
        console.log('[AuthStore] refreshAccessToken called');
        const tokens = getTokens();
        console.log('[AuthStore] refreshAccessToken tokens:', tokens ? 'exist' : 'none');
        if (!tokens?.refreshToken) {
          console.log('[AuthStore] refreshAccessToken no refresh token');
          return null;
        }

        try {
          console.log('[AuthStore] refreshAccessToken trying refreshToken');
          const { accessToken, refreshToken } = await apiClient.refreshToken(tokens.refreshToken);
          setTokens({ accessToken, refreshToken });
          set({ tokens: { accessToken, refreshToken } });
          console.log('[AuthStore] refreshAccessToken success');
          return accessToken;
        } catch (refreshError) {
          console.log('[AuthStore] refreshAccessToken refreshToken failed:', refreshError);
          clearTokens();
          set({ user: null, tokens: null, isAuthenticated: false, isInitialized: true });
          return null;
        }
      },

      setUser: (user: User) => set({ user, isAuthenticated: true, isInitialized: true }),

      setTokens: (tokens: AuthTokens) => {
        setTokens(tokens);
        set({ tokens });
      },

      initialize: async () => {
        console.log('[AuthStore] initialize called');
        const tokens = await initializeTokens();
        console.log('[AuthStore] initialize tokens result:', tokens ? 'exist' : 'none');
        if (tokens?.accessToken) {
          try {
            await get().refreshAuth();
          } catch (error) {
            console.warn('[AuthStore] Auth initialization failed:', error);
            clearTokens();
            set({ user: null, tokens: null, isAuthenticated: false, isInitialized: true });
          }
        } else {
          console.log('[AuthStore] No valid tokens, clearing auth state');
          clearTokens();
          set({ user: null, tokens: null, isAuthenticated: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'foodtech-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);