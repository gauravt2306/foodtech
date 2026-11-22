import { create } from 'zustand';
import { DashboardStats, OrderAnalytics, RevenueAnalytics, VendorAnalytics, VendorListItem } from '../types/api';
import { apiClient } from '../api/client';

interface SuperAdminState {
  dashboardStats: DashboardStats | null;
  orderAnalytics: OrderAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  vendorAnalytics: VendorAnalytics | null;
  pendingVendors: VendorListItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchOrderAnalytics: (params?: { from?: string; to?: string }) => Promise<void>;
  fetchRevenueAnalytics: (params?: { from?: string; to?: string; groupBy?: string }) => Promise<void>;
  fetchVendorAnalytics: (params?: { from?: string; to?: string }) => Promise<void>;
  fetchPendingVendors: () => Promise<void>;
  approveVendor: (vendorId: string) => Promise<void>;
  rejectVendor: (vendorId: string) => Promise<void>;
  clearError: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  dashboardStats: null,
  orderAnalytics: null,
  revenueAnalytics: null,
  vendorAnalytics: null,
  pendingVendors: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiClient.getDashboardStats();
      set({ dashboardStats: stats, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch dashboard stats', isLoading: false });
      throw error;
    }
  },

  fetchOrderAnalytics: async (params?: { from?: string; to?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await apiClient.getOrderAnalytics(params);
      set({ orderAnalytics: analytics, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch order analytics', isLoading: false });
      throw error;
    }
  },

  fetchRevenueAnalytics: async (params?: { from?: string; to?: string; groupBy?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await apiClient.getRevenueAnalytics(params);
      set({ revenueAnalytics: analytics, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch revenue analytics', isLoading: false });
      throw error;
    }
  },

  fetchVendorAnalytics: async (params?: { from?: string; to?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await apiClient.getVendorAnalytics(params);
      set({ vendorAnalytics: analytics, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch vendor analytics', isLoading: false });
      throw error;
    }
  },

  fetchPendingVendors: async () => {
    set({ isLoading: true, error: null });
    try {
      const vendors = await apiClient.getPendingVendors();
      set({ pendingVendors: vendors, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch pending vendors', isLoading: false });
      throw error;
    }
  },

  approveVendor: async (vendorId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.approveVendor(vendorId);
      set((state) => ({
        pendingVendors: state.pendingVendors.filter((v) => v.id !== vendorId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve vendor', isLoading: false });
      throw error;
    }
  },

  rejectVendor: async (vendorId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.rejectVendor(vendorId);
      set((state) => ({
        pendingVendors: state.pendingVendors.filter((v) => v.id !== vendorId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject vendor', isLoading: false });
      throw error;
    }
  },
}));