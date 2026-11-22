export type UserRole = 'superadmin' | 'vendor' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  vendorProfileId?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface VendorProfile {
  id: string;
  userId: string | User;
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
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  vendorId: string | VendorProfile;
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
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'Upi' | 'Cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  menuItemId: string | MenuItem;
  name: string;
  price: number;
  quantity: number;
  dietType: 'veg' | 'non-veg';
}

export interface CartItem {
  id: string;
  menuItemId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  dietType: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  employeeId: string | User;
  vendorId: string | VendorProfile;
  vendor?: {
    id: string;
    businessName: string;
  };
  items: OrderItem[];
  itemCount?: number;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  qrCodeData: string;
  handoffAt?: string;
  handoffBy?: string;
  specialInstructions?: string;
  pickupTime?: string;
  createdAt: string;
  updatedAt?: string;
}