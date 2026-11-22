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

// .NET Employee DTOs (camelCase after JSON serialization)
export interface VendorListItemDto {
  id: string;
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
  rating: number;
  totalOrders: number;
  menuItemCount: number;
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

export interface EmployeeVendorMenuDto {
  vendorId: string;
  businessName: string;
  menuItems: MenuItemDto[];
}

export interface OrderItemDto {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietType: 'veg' | 'non-veg';
}

export interface CreateOrderRequest {
  vendorId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
  paymentMethod: 'Upi' | 'Cash';
  specialInstructions?: string;
  pickupTime?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  qrCodeData: string;
}

export interface EmployeeOrderDto {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  items: OrderItemDto[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: 'Upi' | 'Cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  qrCodeData: string;
  handoffAt?: string;
  specialInstructions?: string;
  pickupTime?: string;
  createdAt: string;
}

export interface PayOrderRequest {
  paymentId: string;
  upiTransactionId?: string;
  upiVpa?: string;
  payerName?: string;
}

export interface UpiPaymentInitiateRequest {
  orderId: string;
  upiVpa: string;
}

export interface UpiPaymentInitiateResponse {
  upiDeepLink: string;
  orderId: string;
  amount: number;
  transactionRef: string;
}

export interface QrCodeResponse {
  qrToken: string;
}

// Export types for UI components
export type Vendor = VendorListItemDto;
export type MenuItem = MenuItemDto;
export type Order = EmployeeOrderDto;
export type OrderItem = OrderItemDto;
export type CreateOrderInput = CreateOrderRequest;

export const employeeApi = {
  // GET /api/v1/employee/vendors - Returns array (not paginated)
  listVendors: () =>
    apiClient.getApprovedVendors(),

  // Not available in .NET - would need GET /employee/vendors/:id
  getVendor: (id: string) =>
    apiClient.get<ApiResponse<VendorListItemDto>>(`/employee/vendors/${id}`),

  // GET /api/v1/employee/vendors/{id}/menu
  getVendorMenu: (id: string) =>
    apiClient.getVendorMenuForEmployee(id),

  // POST /api/v1/employee/orders
  createOrder: (data: CreateOrderRequest) =>
    apiClient.createOrder(data),

  // GET /api/v1/employee/orders - Returns array (not paginated)
  listOrders: () =>
    apiClient.getEmployeeOrders(),

  // Not available in .NET - would need GET /employee/orders/:id
  getOrder: (id: string) =>
    apiClient.getEmployeeOrder(id),

  // POST /api/v1/employee/orders/{id}/pay
  payOrder: (id: string, data: PayOrderRequest) =>
    apiClient.post<ApiResponse<EmployeeOrderDto>>(`/employee/orders/${id}/pay`, data),

  // POST /api/v1/employee/orders/{id}/upi/initiate - NEW in .NET
  initiateUpiPayment: (id: string, upiVpa: string) =>
    apiClient.initiateUpiPayment(id, upiVpa),

  // GET /api/v1/employee/orders/{id}/qr
  getOrderQR: (id: string) =>
    apiClient.getOrderQR(id),
};