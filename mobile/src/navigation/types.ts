// Navigation types for type-safe routing
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Auth Stack
export type AuthStackParamList = {
  Login: { preSelectedRole?: 'vendor' | 'employee' | 'superadmin' };
  Register: { preSelectedRole?: 'vendor' | 'employee' | 'superadmin' };
  RoleSelect: undefined;
};

// Vendor Stack
export type VendorStackParamList = {
  VendorDashboard: undefined;
  VendorMenu: undefined;
  MenuItemCreate: undefined;
  MenuItemEdit: { itemId: string };
  VendorOrders: undefined;
  VendorOrderDetail: { orderId: string };
  VendorQrHandoff: { orderId: string };
};

// Employee Stack
export type EmployeeStackParamList = {
  EmployeeDashboard: undefined;
  VendorList: undefined;
  VendorMenu: { vendorId: string; vendorName: string };
  OrderCreate: { vendorId: string };
  EmployeeOrders: undefined;
  EmployeeOrderDetail: { orderId: string };
  UpiPayment: { orderId: string; total: number };
  QrCodeDisplay: { orderId: string; qrToken: string; expiresAt: string };
};

// SuperAdmin Stack
export type SuperAdminStackParamList = {
  SuperAdminDashboard: undefined;
  PendingVendors: undefined;
  OrderAnalytics: undefined;
  RevenueAnalytics: undefined;
  VendorAnalytics: undefined;
};

// Root Stack (role-based)
export type RootStackParamList = {
  Auth: undefined;
  Vendor: undefined;
  Employee: undefined;
  SuperAdmin: undefined;
};

// Navigation prop types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type VendorNavigationProp = NativeStackNavigationProp<VendorStackParamList>;
export type EmployeeNavigationProp = NativeStackNavigationProp<EmployeeStackParamList>;
export type SuperAdminNavigationProp = NativeStackNavigationProp<SuperAdminStackParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;