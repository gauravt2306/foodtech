import api from './api';

// .NET API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorInfo?: {
    Code: string;
    Message: string;
    Details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    path: string;
  };
}

// .NET Auth DTOs (camelCase after JSON serialization)
interface UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  vendorProfileId?: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

interface MeResponse {
  user: UserDto;
  vendorProfile?: {
    id: string;
    userId: string;
    businessName: string;
    gstNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    operatingHours: {
      open: string;
      close: string;
    };
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    rating: number;
    totalOrders: number;
    createdAt: string;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'employee' | 'vendor';
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      phone: data.phone,
    }),

  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  // Not implemented in .NET backend - keeping for compatibility but will fail gracefully
  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<ApiResponse<MeResponse>>('/auth/me'),

  // Not implemented in .NET backend
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Helper to extract tokens from .NET response format
export const extractTokens = (response: ApiResponse<AuthResponse> | ApiResponse<{ accessToken: string; refreshToken: string }>) => {
  if (response.success && response.data) {
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }
  return null;
};

// Helper to extract user from .NET response format
export const extractUser = (response: ApiResponse<AuthResponse> | ApiResponse<MeResponse>) => {
  if (response.success && response.data) {
    // AuthResponse has user directly, MeResponse has user property
    return 'user' in response.data ? response.data.user : response.data;
  }
  return null;
};