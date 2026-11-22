import { create } from 'zustand';
import { VendorListItem, MenuItem, Order, CreateOrderRequest, OrderStatus, PaymentMethod } from '../types/api';
import { apiClient } from '../api/client';

interface EmployeeState {
  vendors: VendorListItem[];
  currentVendorMenu: MenuItem[];
  orders: Order[];
  currentOrder: Order | null;
  qrCode: { qrToken: string; expiresAt: string } | null;
  upiDeepLink: string | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchVendors: () => Promise<void>;
  fetchVendorMenu: (vendorId: string) => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  placeOrder: (orderId: string, data: { paymentMethod: string; upiId?: string }) => Promise<void>;
  fetchOrders: (params?: { status?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  initiateUpiPayment: (orderId: string, upiVpa: string) => Promise<{ upiDeepLink: string; paymentId: string }>;
  verifyUpiPayment: (paymentId: string, orderId: string) => Promise<void>;
  generateQrCode: (orderId: string) => Promise<{ qrToken: string; expiresAt: string }>;
  verifyQrCode: (qrToken: string) => Promise<{ valid: boolean; orderId?: string; vendorId?: string }>;
  clearError: () => void;
  clearCurrentOrder: () => void;
  clearQrCode: () => void;
  clearUpiDeepLink: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  vendors: [],
  currentVendorMenu: [],
  orders: [],
  currentOrder: null,
  qrCode: null,
  upiDeepLink: null,
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

  clearQrCode: () => set({ qrCode: null }),

  clearUpiDeepLink: () => set({ upiDeepLink: null }),

  fetchVendors: async () => {
    set({ isLoading: true, error: null });
    try {
      const vendors = await apiClient.getApprovedVendors();
      set({ vendors, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch vendors', isLoading: false });
      throw error;
    }
  },

  fetchVendorMenu: async (vendorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const menuItems = await apiClient.getVendorMenuForEmployee(vendorId);
      set({ currentVendorMenu: menuItems, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch vendor menu', isLoading: false });
      throw error;
    }
  },

  createOrder: async (data: CreateOrderRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createOrder(data);
      // apiClient.createOrder returns CreateOrderResponse directly: { orderId, orderNumber, subtotal, taxAmount, total, qrCodeData }
      const order: Order = {
        id: response.orderId,
        orderNumber: response.orderNumber,
        employeeId: '',
        vendorId: data.vendorId,
        items: data.items.map(item => ({ menuItemId: item.menuItemId, name: '', price: 0, quantity: item.quantity, dietType: 'veg' })),
        status: 'pending',
        subtotal: response.subtotal,
        taxAmount: response.taxAmount,
        deliveryFee: 0,
        total: response.total,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        qrCodeData: response.qrCodeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ currentOrder: order, qrCode: { qrToken: response.qrCodeData, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }, isLoading: false });
      return order;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  placeOrder: async (orderId: string, data: { paymentMethod: string; upiId?: string }) => {
    set({ isLoading: true, error: null });
    try {
      if (data.paymentMethod === 'Upi' && data.upiId) {
        // Initiate UPI payment
        await apiClient.initiateUpiPayment(orderId, data.upiId);
      }
      // For Cash, no additional action needed - order is already created
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to process payment', isLoading: false });
      throw error;
    }
  },

  fetchOrders: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getEmployeeOrders(params);
      set({
        orders: Array.isArray(response) ? response : (response.data || response),
        pagination: {
          page: 1,
          pageSize: 10,
          total: Array.isArray(response) ? response.length : 0,
          totalPages: 1,
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
      const order = await apiClient.getEmployeeOrder(id);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch order', isLoading: false });
      throw error;
    }
  },

  initiateUpiPayment: async (orderId: string, upiVpa: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.initiateUpiPayment(orderId, upiVpa);
      set({ upiDeepLink: response.upiDeepLink, isLoading: false });
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to initiate UPI payment', isLoading: false });
      throw error;
    }
  },

  verifyUpiPayment: async (paymentId: string, orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Use the payOrder endpoint for verification
      await apiClient.post(`/employee/orders/${orderId}/pay`, { paymentId });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify UPI payment', isLoading: false });
      throw error;
    }
  },

  generateQrCode: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.generateQrCode({ orderId });
      const qrCode = { qrToken: response.qrToken, expiresAt: response.expiresAt };
      set({ qrCode, isLoading: false });
      return qrCode;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate QR code', isLoading: false });
      throw error;
    }
  },

  verifyQrCode: async (qrToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.verifyQrCode({ qrToken });
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify QR code', isLoading: false });
      throw error;
    }
  },
}));