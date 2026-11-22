export type UserRole = 'superadmin' | 'vendor' | 'employee';

export const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'employee', label: 'Employee', description: 'Order food from cafeteria vendors' },
  { value: 'vendor', label: 'Vendor', description: 'Manage cafeteria menu and orders' },
  { value: 'superadmin', label: 'Super Admin', description: 'Platform administration and analytics' },
];

export const ROLE_ROUTES: Record<UserRole, string> = {
  employee: '/employee',
  vendor: '/vendor',
  superadmin: '/superadmin',
};

export function getRoleLabel(role: UserRole): string {
  return ROLES.find(r => r.value === role)?.label || role;
}

export function getRoleDescription(role: UserRole): string {
  return ROLES.find(r => r.value === role)?.description || '';
}