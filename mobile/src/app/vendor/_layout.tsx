import { Tabs } from 'expo-router';
import { VendorBottomNavigation } from '@/components/vendor/VendorBottomNavigation';
import { colors } from '@/constants/colors';

export default function VendorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={() => <VendorBottomNavigation />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{ title: 'Menu Management' }}
      />
      <Tabs.Screen
        name="menu-form"
        options={{ title: 'Add Menu Item', headerShown: true }}
      />
      <Tabs.Screen
        name="order-detail"
        options={{ title: 'Order Details', headerShown: true }}
      />
      <Tabs.Screen
        name="qr-scanner"
        options={{ title: 'QR Scanner', headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}