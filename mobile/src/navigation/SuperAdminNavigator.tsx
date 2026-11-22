import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SuperAdminDashboardScreen } from '../screens/superadmin/SuperAdminDashboardScreen';
import { PendingVendorsScreen } from '../screens/superadmin/PendingVendorsScreen';
import { OrderAnalyticsScreen } from '../screens/superadmin/OrderAnalyticsScreen';
import { RevenueAnalyticsScreen } from '../screens/superadmin/RevenueAnalyticsScreen';
import { VendorAnalyticsScreen } from '../screens/superadmin/VendorAnalyticsScreen';
import { SuperAdminStackParamList } from './types';

const Stack = createNativeStackNavigator<SuperAdminStackParamList>();

export const SuperAdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#7C2D12' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="PendingVendors" component={PendingVendorsScreen} options={{ title: 'Pending Approvals' }} />
      <Stack.Screen name="OrderAnalytics" component={OrderAnalyticsScreen} options={{ title: 'Order Analytics' }} />
      <Stack.Screen name="RevenueAnalytics" component={RevenueAnalyticsScreen} options={{ title: 'Revenue Analytics' }} />
      <Stack.Screen name="VendorAnalytics" component={VendorAnalyticsScreen} options={{ title: 'Vendor Analytics' }} />
    </Stack.Navigator>
  );
};