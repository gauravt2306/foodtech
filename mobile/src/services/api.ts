import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokens, setTokens, clearTokens } from '@/api/tokens';

// Normalize .NET ApiResponse to expected format
// .NET: { success, data, errorInfo, meta: { timestamp, path } }
// Expected: { success, data, meta: { page, limit, total, totalPages } } or just { success, data }
const normalizeResponse = (response: AxiosResponse): AxiosResponse => {
  const { data } = response;

  // Handle .NET ApiResponse format (has success, data, and optionally errorInfo/meta)
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    const { success, data: responseData, errorInfo, meta } = data;

    if (!success && errorInfo) {
      // Create an error that can be caught by interceptors
      const error = new Error(errorInfo.Message || errorInfo.Message || 'API Error') as AxiosError & {
        response?: AxiosResponse;
        code?: string;
        details?: Record<string, string[]>;
      };
      error.response = {
        ...response,
        data: { success: false, error: errorInfo, meta },
        status: response.status,
      };
      error.code = errorInfo.Code;
      error.details = errorInfo.Details;
      throw error;
    }

    // Return normalized successful response
    return {
      ...response,
      data: {
        success: true,
        data: responseData,
        meta: meta ? {
          timestamp: meta.timestamp,
          path: meta.path
        } : undefined,
      },
    };
  }

  // If not in .NET format, return as-is
  return response;
};

const API_BASE_URL = __DEV__
  ? 'http://localhost:5083/api/v1'  // Android emulator localhost via adb reverse
  : 'https://foodtech-api.fly.dev/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    const accessToken = tokens?.accessToken;
    console.log('[API] Request to:', config.url, '| Token present:', !!accessToken);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('[API] Authorization header set');
    } else {
      console.log('[API] No token available for request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - normalize .NET ApiResponse format
api.interceptors.response.use(
  (response) => normalizeResponse(response),
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// Lazy import to avoid circular dependency
const refreshAccessToken = async (): Promise<string | null> => {
  const { useAuthStore } = await import('@/store/authStore');
  return useAuthStore.getState().refreshAccessToken();
};

const logout = async (): Promise<void> => {
  const { useAuthStore } = await import('@/store/authStore');
  return useAuthStore.getState().logout();
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        await logout();
        // Navigate to login - handled by auth guard in navigation
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;