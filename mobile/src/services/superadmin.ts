import { apiClient } from '@/api/client';

// The apiClient generic methods already unwrap response.data.data || response.data
// So we use apiClient directly without additional extraction

// .NET SuperAdmin DTOs (camelCase after JSON serialization)
export interface SuperAdminVendorDto {
  id: string;
  userId: string;
  email: string;
  name: string;
  businessName: string;
  gstNumber: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rating: number;
  totalOrders: number;
  createdAt: string;
  address?: {
    city: string;
    state: string;
    street?: string;
    zipCode?: string;
  };
}

export interface SuperAdminUserDto {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'vendor' | 'employee';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  vendorProfileId?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface ApproveVendorRequest {
  approve: boolean;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface DashboardAnalyticsDto {
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalVendors: number;
}

export interface DailyOrderStat {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
}

export interface OrderAnalyticsDto {
  dailyStats: DailyOrderStat[];
}

export interface DailyRevenueStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueAnalyticsDto {
  dailyRevenue: DailyRevenueStat[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface VendorPerformanceItem {
  vendorId: string;
  businessName: string;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
}

export interface VendorPerformanceDto {
  vendors: VendorPerformanceItem[];
}

// Export types for UI components
export type Vendor = SuperAdminVendorDto;
export type User = SuperAdminUserDto;
export type Analytics = DashboardAnalyticsDto;
export type OrderAnalytics = OrderAnalyticsDto;
export type RevenueAnalytics = RevenueAnalyticsDto;
export type VendorPerformance = VendorPerformanceDto;

export const superadminApi = {
  // GET /api/v1/superadmin/vendors - Returns array (not paginated)
  listVendors: () =>
    apiClient.get<SuperAdminVendorDto[]>('/superadmin/vendors'),

  // Not available in .NET - would need GET /superadmin/vendors/:id
  getVendor: (id: string) =>
    apiClient.get<SuperAdminVendorDto>(`/superadmin/vendors/${id}`),

  // PATCH /api/v1/superadmin/vendors/{id}/approve
  approveVendor: (id: string, approved: boolean) =>
    apiClient.patch<SuperAdminVendorDto>(`/superadmin/vendors/${id}/approve`, { approve: approved }),

  // GET /api/v1/superadmin/users - Returns array (not paginated)
  listUsers: () =>
    apiClient.get<SuperAdminUserDto[]>('/superadmin/users'),

  // PATCH /api/v1/superadmin/users/{id}/status
  updateUserStatus: (id: string, isActive: boolean) =>
    apiClient.patch<SuperAdminUserDto>(`/superadmin/users/${id}/status`, { isActive }),

  // GET /api/v1/superadmin/analytics/dashboard
  getAnalytics: () =>
    apiClient.getDashboardStats(),

  // GET /api/v1/superadmin/analytics/orders
  getOrderAnalytics: (params?: { vendorId?: string; from?: string; to?: string }) =>
    apiClient.getOrderAnalytics(params),

  // GET /api/v1/superadmin/analytics/revenue
  getRevenueAnalytics: (params?: { vendorId?: string; from?: string; to?: string }) =>
    apiClient.getRevenueAnalytics(params),

  // GET /api/v1/superadmin/analytics/vendors - NEW in .NET
  getVendorPerformance: () =>
    apiClient.getVendorAnalytics(),
};