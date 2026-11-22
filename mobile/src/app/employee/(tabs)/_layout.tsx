import { Tabs } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types/models';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { colors } from '@/constants/colors';
import { View, StyleSheet } from 'react-native';

console.log('[EmployeeTabsLayout] Render');

export default function EmployeeTabsLayout() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={() => <BottomNavigation />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Bookings',
        }}
      />
      <Tabs.Screen
        name="concierge"
        options={{
          title: 'Concierge',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Tab bar is hidden, using custom BottomNavigation instead
});