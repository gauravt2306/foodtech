import api from './api';
import { apiClient } from '@/api/client';

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

// .NET Vendor DTOs (camelCase after JSON serialization)
export interface VendorProfileDto {
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
}

export interface MenuItemDto {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number; // in paise
  category: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
  dietType: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
  imageUrl?: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  tags: string[];
  createdAt: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number; // in paise
  category: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
  dietType: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
  imageUrl?: string;
  prepTimeMinutes: number;
  tags: string[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
  dietType?: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
  imageUrl?: string;
  isAvailable?: boolean;
  prepTimeMinutes?: number;
  tags?: string[];
}

export interface OrderItemDto {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietType: 'veg' | 'non-veg';
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  employeeId: string;
  vendorId: string;
  items: OrderItemDto[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Upi' | 'Cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  qrCodeData: string;
  handoffAt?: string;
  handoffBy?: string;
  specialInstructions?: string;
  pickupTime?: string;
  createdAt: string;
}

export interface VendorOrdersResponse {
  pending: OrderDto[];
  confirmed: OrderDto[];
  preparing: OrderDto[];
  ready: OrderDto[];
  completed: OrderDto[];
  cancelled: OrderDto[];
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

export interface HandoffOrderRequest {
  qrToken: string;
}

// Export types for UI components
export type Vendor = VendorProfileDto;
export type MenuItem = MenuItemDto;
export type Order = OrderDto;
export type OrderItem = OrderItemDto;

export const vendorApi = {
  // GET /api/v1/vendor/profile
  getProfile: () =>
    api.get<ApiResponse<VendorProfileDto>>('/vendor/profile'),

  // PATCH /api/v1/vendor/profile
  updateProfile: (data: Partial<VendorProfileDto>) =>
    api.patch<ApiResponse<VendorProfileDto>>('/vendor/profile', data),

  // POST /api/v1/vendor/menu
  createMenuItem: (data: CreateMenuItemRequest) =>
    api.post<ApiResponse<MenuItemDto>>('/vendor/menu', data),

  // GET /api/v1/vendor/menu - Returns array (not paginated), optional category filter
  listMenuItems: (category?: string) =>
    api.get<ApiResponse<MenuItemDto[]>>('/vendor/menu', {
      params: category ? { category } : undefined
    }),

  // Not available in .NET - would need GET /vendor/menu/:id
  getMenuItem: (id: string) =>
    api.get<ApiResponse<MenuItemDto>>(`/vendor/menu/${id}`),

  // PATCH /api/v1/vendor/menu/{id}
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) =>
    api.patch<ApiResponse<MenuItemDto>>(`/vendor/menu/${id}`, data),

  // DELETE /api/v1/vendor/menu/{id}
  deleteMenuItem: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/vendor/menu/${id}`),

  // Toggle availability - use PATCH /api/v1/vendor/menu/{id} with isAvailable
  toggleAvailability: (id: string, isAvailable: boolean) =>
    api.patch<ApiResponse<MenuItemDto>>(`/vendor/menu/${id}`, { isAvailable }),

  // GET /api/v1/vendor/orders - Returns grouped orders (not paginated)
  listOrders: () =>
    apiClient.getVendorOrders(),

  // Not available in .NET - would need GET /vendor/orders/:id
  getOrder: (id: string) =>
    api.get<any>(`/vendor/orders/${id}`).then(res => res.data.data),

  // PATCH /api/v1/vendor/orders/{id}/status
  updateOrderStatus: (id: string, status: OrderDto['status']) =>
    api.patch<ApiResponse<OrderDto>>(`/vendor/orders/${id}/status`, { status }),

  // POST /api/v1/vendor/orders/{id}/handoff
  handoffOrder: (id: string, qrToken: string) =>
    api.post<ApiResponse<OrderDto>>(`/vendor/orders/${id}/handoff`, { qrToken }),
};