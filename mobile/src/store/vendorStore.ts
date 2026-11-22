import { create } from 'zustand';
import { VendorProfile, MenuItem, Order, CreateMenuItemRequest, UpdateMenuItemRequest, CreateVendorProfileRequest, UpdateVendorProfileRequest, OrderStatus } from '../types/api';
import { apiClient } from '../api/client';

interface VendorState {
  profile: VendorProfile | null;
  menuItems: MenuItem[];
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchProfile: () => Promise<void>;
  createProfile: (data: CreateVendorProfileRequest) => Promise<void>;
  updateProfile: (data: UpdateVendorProfileRequest) => Promise<void>;
  fetchMenu: () => Promise<void>;
  createMenuItem: (data: CreateMenuItemRequest) => Promise<MenuItem>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  fetchOrders: (params?: { status?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  handoffOrder: (id: string, qrToken: string) => Promise<{ handoffAt?: string; handoffBy?: string; message?: string; order?: any }>;
  getQrCode: (orderId: string) => Promise<{ qrToken: string; expiresAt: string }>;
  clearError: () => void;
  clearCurrentOrder: () => void;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  profile: null,
  menuItems: [],
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },

  clearError: () => set({ error: null }),

  clearCurrentOrder: () => set({ currentOrder: null }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await apiClient.getVendorProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch profile', isLoading: false });
      throw error;
    }
  },

  createProfile: async (data: CreateVendorProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await apiClient.createVendorProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to create profile', isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: UpdateVendorProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await apiClient.updateVendorProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const menuItems = await apiClient.getVendorMenu();
      set({ menuItems, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch menu', isLoading: false });
      throw error;
    }
  },

  createMenuItem: async (data: CreateMenuItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const menuItem = await apiClient.createMenuItem(data);
      set((state) => ({ menuItems: [...state.menuItems, menuItem], isLoading: false }));
      return menuItem;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create menu item', isLoading: false });
      throw error;
    }
  },

  updateMenuItem: async (id: string, data: UpdateMenuItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const menuItem = await apiClient.updateMenuItem(id, data);
      set((state) => ({
        menuItems: state.menuItems.map((item) => (item.id === id ? menuItem : item)),
        isLoading: false,
      }));
      return menuItem;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update menu item', isLoading: false });
      throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteMenuItem(id);
      set((state) => ({
        menuItems: state.menuItems.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete menu item', isLoading: false });
      throw error;
    }
  },

  fetchOrders: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getVendorOrders(params);
      set({
        orders: response.data || response,
        pagination: {
          page: response.page || 1,
          pageSize: response.pageSize || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch orders', isLoading: false });
      throw error;
    }
  },

  fetchOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiClient.getVendorOrder(id);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch order', isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiClient.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? order : o)),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update order status', isLoading: false });
      throw error;
    }
  },

  handoffOrder: async (id: string, qrToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.handoffOrder(id, qrToken);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? response.order : o)),
        currentOrder: state.currentOrder?.id === id ? response.order : state.currentOrder,
        isLoading: false,
      }));
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to handoff order', isLoading: false });
      throw error;
    }
  },

  getQrCode: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getVendorQrCode(orderId);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get QR code', isLoading: false });
      throw error;
    }
  },
}));
