import { api } from '@/services/api';
import { AuthTokens, RefreshResponse, ApiError } from '../types/api';
import { getTokens, setTokens, clearTokens } from './tokens';

class ApiClient {
  // Use the shared api instance which has the .NET response normalizer and interceptors
  // No additional interceptors needed - api.ts handles request/response interception

  // Typed API methods
  // Note: The api instance already normalizes .NET ApiResponse format, so response.data contains { success, data, meta }
  // We need to extract response.data.data for the actual payload
  async login(email: string, password: string) {
    const response = await api.post<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', { email, password });
    // Response is normalized: { success: true, data: { user, tokens }, meta }
    // Backend returns: { accessToken, refreshToken, user }
    // AuthStore expects: { user, tokens: { accessToken, refreshToken } }
    console.log('[apiClient.login] response.data:', JSON.stringify(response.data));
    console.log('[apiClient.login] response.data.data:', JSON.stringify(response.data.data));
    const { accessToken, refreshToken, user } = response.data.data;
    return { user, tokens: { accessToken, refreshToken } };
  }

  async register(email: string, password: string, role: 'superadmin' | 'vendor' | 'employee', name: string) {
    const response = await api.post<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', { email, password, role, name });
    const { accessToken, refreshToken, user } = response.data.data;
    return { user, tokens: { accessToken, refreshToken } };
  }

  async refreshToken(refreshToken: string) {
    const response = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  async logout() {
    const refreshToken = getTokens()?.refreshToken;
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    clearTokens();
  }

  async getMe() {
    const response = await api.get<any>('/auth/me');
    return response.data.data;
  }

  // Vendor endpoints
  async createVendorProfile(data: any) {
    const response = await api.post<any>('/vendor/profile', data);
    return response.data.data;
  }

  async getVendorProfile() {
    const response = await api.get<any>('/vendor/profile');
    return response.data.data;
  }

  async updateVendorProfile(data: any) {
    const response = await api.put<any>('/vendor/profile', data);
    return response.data.data;
  }

  async getVendorMenu() {
    const response = await api.get<any>('/vendor/menu');
    return response.data.data;
  }

  async createMenuItem(data: any) {
    const response = await api.post<any>('/vendor/menu', data);
    return response.data.data;
  }

  async updateMenuItem(id: string, data: any) {
    const response = await api.put<any>(`/vendor/menu/${id}`, data);
    return response.data.data;
  }

  async deleteMenuItem(id: string) {
    const response = await api.delete(`/vendor/menu/${id}`);
    return response.data.data;
  }

  async getVendorOrders(params?: { status?: string; page?: number; pageSize?: number }) {
    const response = await api.get<any>('/vendor/orders', { params });
    const data = response.data.data;
    // API returns orders grouped by status: { pending: [], confirmed: [], ... }
    // Flatten to array with status field for the store
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const orders: any[] = [];
      for (const [status, statusOrders] of Object.entries(data)) {
        if (Array.isArray(statusOrders)) {
          for (const order of statusOrders) {
            orders.push({ ...order, status });
          }
        }
      }
      // If status filter is applied, filter the orders
      if (params?.status) {
        return orders.filter(o => o.status === params.status);
      }
      return orders;
    }
    return data || [];
  }

  async getVendorOrder(id: string) {
    const response = await api.get<any>(`/vendor/orders/${id}`);
    return response.data.data;
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await api.put<any>(`/vendor/orders/${id}/status`, { status });
    return response.data.data;
  }

  async handoffOrder(id: string, qrToken: string) {
    const response = await api.post<any>(`/vendor/orders/${id}/handoff`, { qrToken });
    return response.data.data;
  }

  async getVendorQrCode(orderId: string) {
    const response = await api.get<any>(`/vendor/orders/${orderId}/qr`);
    return response.data.data;
  }

  // Employee endpoints
  async getApprovedVendors() {
    const response = await api.get<any>('/employee/vendors');
    return response.data.data;
  }

  async getVendorMenuForEmployee(vendorId: string) {
    const response = await api.get<any>(`/employee/vendors/${vendorId}/menu`);
    return response.data.data;
  }

  async createOrder(data: any) {
    const response = await api.post<any>('/employee/orders', data);
    return response.data.data;
  }

  async getEmployeeOrders(params?: { status?: string; page?: number; pageSize?: number }) {
    const response = await api.get<any>('/employee/orders', { params });
    return response.data.data;
  }

  async getEmployeeOrder(id: string) {
    const response = await api.get<any>(`/employee/orders/${id}`);
    return response.data.data;
  }

  async initiateUpiPayment(orderId: string, upiVpa: string) {
    const response = await api.post<any>(`/employee/orders/${orderId}/upi/initiate`, { orderId, upiVpa });
    return response.data.data;
  }

  async generateQrCode(data: any) {
    const response = await api.post<any>('/employee/orders/qr/generate', data);
    return response.data.data;
  }

  async verifyQrCode(data: any) {
    const response = await api.post<any>('/employee/orders/qr/verify', data);
    return response.data.data;
  }

  async getOrderQR(id: string) {
    const response = await api.get<any>(`/employee/orders/${id}/qr`);
    return response.data.data;
  }

  // SuperAdmin endpoints
  async getDashboardStats() {
    const response = await api.get<any>('/superadmin/analytics/dashboard');
    return response.data.data;
  }

  async getOrderAnalytics(params?: { from?: string; to?: string }) {
    const response = await api.get<any>('/superadmin/analytics/orders', { params });
    return response.data.data;
  }

  async getRevenueAnalytics(params?: { from?: string; to?: string; groupBy?: string }) {
    const response = await api.get<any>('/superadmin/analytics/revenue', { params });
    return response.data.data;
  }

  async getVendorAnalytics(params?: { from?: string; to?: string }) {
    const response = await api.get<any>('/superadmin/analytics/vendors', { params });
    return response.data.data;
  }

  async getPendingVendors() {
    const response = await api.get<any>('/superadmin/vendors/pending');
    return response.data.data;
  }

  async approveVendor(vendorId: string) {
    const response = await api.post<any>(`/superadmin/vendors/${vendorId}/approve`, { approve: true });
    return response.data.data;
  }

  async rejectVendor(vendorId: string) {
    const response = await api.post<any>(`/superadmin/vendors/${vendorId}/approve`, { approve: false });
    return response.data.data;
  }

  // Health check
  async healthCheck() {
    const response = await api.get<any>('/health');
    return response.data.data;
  }

  // Generic HTTP methods for flexibility
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;