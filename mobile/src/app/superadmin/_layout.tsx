import { Tabs } from 'expo-router';
import { SuperAdminBottomNavigation } from '@/components/superadmin/SuperAdminBottomNavigation';
import { colors } from '@/constants/colors';

export default function SuperAdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={() => <SuperAdminBottomNavigation />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="vendors"
        options={{ title: 'Vendor Management' }}
      />
      <Tabs.Screen
        name="vendor-detail"
        options={{ title: 'Vendor Details', headerShown: true }}
      />
      <Tabs.Screen
        name="users"
        options={{ title: 'User Management' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics' }}
      />
    </Tabs>
  );
}