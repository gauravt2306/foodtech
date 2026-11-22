import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '@/types/models';

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  recalculate: () => void;
}

const TAX_RATE = 0.05; // 5% GST

const recalculate = (state: CartState) => {
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = 0; // Pickup from counter - no delivery fee
  const total = subtotal + tax;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, tax, deliveryFee, total, itemCount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,

      addItem: (item) => set((state) => {
        // Clear cart if adding item from a different vendor (multi-vendor orders not supported)
        let newItems: CartItem[];
        if (state.items.length > 0 && state.items[0].vendorId !== item.vendorId) {
          newItems = [item];
        } else {
          const existingIndex = state.items.findIndex(i => i.menuItemId === item.menuItemId);
          if (existingIndex >= 0) {
            newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
          } else {
            newItems = [...state.items, item];
          }
        }
        const calculated = recalculate({ ...state, items: newItems });
        return { items: newItems, ...calculated };
      }),

      removeItem: (itemId) => set((state) => {
        const newItems = state.items.filter(item => item.id !== itemId);
        const calculated = recalculate({ ...state, items: newItems });
        return { items: newItems, ...calculated };
      }),

      updateQuantity: (itemId, quantity) => set((state) => {
        let newItems: CartItem[];
        if (quantity <= 0) {
          newItems = state.items.filter(item => item.id !== itemId);
        } else {
          newItems = state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
        }
        const calculated = recalculate({ ...state, items: newItems });
        return { items: newItems, ...calculated };
      }),

      clearCart: () => set({ items: [], subtotal: 0, tax: 0, deliveryFee: 0, total: 0, itemCount: 0 }),

      recalculate: () => set((state) => {
        const calculated = recalculate(state);
        return { ...calculated };
      }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist items, computed values will be recalculated on rehydration
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const calculated = recalculate(state);
          state.subtotal = calculated.subtotal;
          state.tax = calculated.tax;
          state.deliveryFee = calculated.deliveryFee;
          state.total = calculated.total;
          state.itemCount = calculated.itemCount;
        }
      },
    }
  )
);