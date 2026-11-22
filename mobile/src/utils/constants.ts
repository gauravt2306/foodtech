export const APP_CONFIG = {
  name: 'FoodTech',
  version: '1.0.0',
  apiTimeout: 15000,
  qrTokenExpiry: 30000, // 30 seconds
  pollingInterval: 10000, // 10 seconds
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

export const STORAGE_KEYS = {
  auth: 'auth-storage',
  cart: 'cart-storage',
  userPreferences: 'user-preferences',
} as const;

export const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast', icon: '☕' },
  { value: 'lunch', label: 'Lunch', icon: '🍛' },
  { value: 'snacks', label: 'Snacks', icon: '🍿' },
  { value: 'beverages', label: 'Beverages', icon: '🥤' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
] as const;

export const DIET_TYPES = [
  { value: 'veg', label: 'Vegetarian', icon: '🌱', color: '#22C55E' },
  { value: 'non-veg', label: 'Non-Vegetarian', icon: '🍗', color: '#EF4444' },
  { value: 'vegan', label: 'Vegan', icon: '🌿', color: '#3B82F6' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾', color: '#F59E0B' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cash', label: 'Cash on Pickup', icon: '💵' },
] as const;

export function getCategoryLabel(category: string): string {
  return CATEGORIES.find(c => c.value === category)?.label || category;
}

export function getDietTypeInfo(dietType: string) {
  return DIET_TYPES.find(d => d.value === dietType) || DIET_TYPES[0];
}