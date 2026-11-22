import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelect: undefined;
};

// Employee Tab Navigator
export type EmployeeTabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

// Employee Stack (nested screens)
export type EmployeeStackParamList = {
  Tabs: NavigatorScreenParams<EmployeeTabParamList>;
  VendorDetail: { vendorId: string };
  Checkout: undefined;
  Payment: { orderId: string; total: number };
  OrderDetail: { orderId: string };
  QRModal: { orderId: string; qrCodeData: string };
};

// Vendor Stack
export type VendorStackParamList = {
  Dashboard: undefined;
  Menu: undefined;
  MenuForm: { itemId?: string };
  OrderDetail: { orderId: string };
  QRScanner: { orderId: string };
  Profile: undefined;
};

// SuperAdmin Stack
export type SuperAdminStackParamList = {
  Dashboard: undefined;
  Vendors: undefined;
  VendorDetail: { vendorId: string };
  Users: undefined;
  Analytics: undefined;
};

// Root Stack (for role-based routing)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Employee: NavigatorScreenParams<EmployeeStackParamList>;
  Vendor: NavigatorScreenParams<VendorStackParamList>;
  SuperAdmin: NavigatorScreenParams<SuperAdminStackParamList>;
};

// Screen props types
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type EmployeeTabScreenProps<T extends keyof EmployeeTabParamList> = BottomTabScreenProps<EmployeeTabParamList, T>;
export type EmployeeStackScreenProps<T extends keyof EmployeeStackParamList> = NativeStackScreenProps<EmployeeStackParamList, T>;
export type VendorStackScreenProps<T extends keyof VendorStackParamList> = NativeStackScreenProps<VendorStackParamList, T>;
export type SuperAdminStackScreenProps<T extends keyof SuperAdminStackParamList> = NativeStackScreenProps<SuperAdminStackParamList, T>;