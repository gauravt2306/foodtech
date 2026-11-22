// API Types matching backend DTOs exactly

export type UserRole = 'superadmin' | 'vendor' | 'employee';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  vendorId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Vendor Types
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6
  openTime: string; // HH:mm
  closeTime: string;
  isClosed: boolean;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  address: Address;
  phone: string;
  email: string;
  imageUrl?: string;
  operatingHours: OperatingHours[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorProfileRequest {
  businessName: string;
  description?: string;
  address: Address;
  phone: string;
  email: string;
  imageUrl?: string;
  operatingHours: OperatingHours[];
}

export interface UpdateVendorProfileRequest {
  businessName?: string;
  description?: string;
  address?: Address;
  phone?: string;
  email?: string;
  imageUrl?: string;
  operatingHours?: OperatingHours[];
}

export interface VendorListItem {
  id: string;
  businessName: string;
  description?: string;
  address: Address;
  phone: string;
  imageUrl?: string;
  isApproved: boolean;
  menuItemCount: number;
  rating?: number;
}

export interface ApproveVendorRequest {
  vendorId: string;
}

// Menu Types
export type Category = 'appetizer' | 'main' | 'dessert' | 'beverage' | 'side';
export type DietType = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'halal' | 'none';

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  price: number; // in paise
  category: Category;
  dietType: DietType;
  imageUrl?: string;
  prepTimeMinutes: number;
  tags: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  category: Category;
  dietType: DietType;
  imageUrl?: string;
  prepTimeMinutes: number;
  tags: string[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: Category;
  dietType?: DietType;
  imageUrl?: string;
  prepTimeMinutes?: number;
  tags?: string[];
  isAvailable?: boolean;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'Upi' | 'Cash' | 'Card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  employeeId: string;
  vendorId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  qrCodeData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  vendor?: VendorListItem;
  employee?: User;
}

export interface CreateOrderRequest {
  vendorId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderResponse {
  order: Order;
  qrCodeData: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface HandoffOrderRequest {
  qrToken: string;
}

export interface HandoffOrderResponse {
  order: Order;
  handoffAt: string;
  handoffBy: string;
}

// UPI Types
export interface UpiPaymentInitiateRequest {
  orderId: string;
  upiVpa: string;
}

export interface UpiPaymentInitiateResponse {
  upiDeepLink: string;
  paymentId: string;
}

export interface UpiPaymentVerifyRequest {
  paymentId: string;
  orderId: string;
}

// QR Types
export interface GenerateQrCodeRequest {
  orderId: string;
}

export interface GenerateQrCodeResponse {
  qrToken: string;
  expiresAt: string;
}

export interface VerifyQrCodeRequest {
  qrToken: string;
}

export interface VerifyQrCodeResponse {
  valid: boolean;
  orderId?: string;
  vendorId?: string;
}

// Analytics Types (SuperAdmin) - matching backend DTOs
export interface DashboardStats {
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalVendors: number;
  totalEmployees?: number;
  pendingApprovals?: number;
}

export interface DailyOrderStat {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
}

export interface OrderAnalytics {
  dailyStats: DailyOrderStat[];
}

export interface DailyRevenueStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueAnalytics {
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

export interface VendorAnalytics {
  vendors: VendorPerformanceItem[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
