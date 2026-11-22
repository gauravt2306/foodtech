import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { VendorMenuScreen } from '../screens/vendor/VendorMenuScreen';
import { MenuItemCreateScreen } from '../screens/vendor/MenuItemCreateScreen';
import { MenuItemEditScreen } from '../screens/vendor/MenuItemEditScreen';
import { VendorOrdersScreen } from '../screens/vendor/VendorOrdersScreen';
import { VendorOrderDetailScreen } from '../screens/vendor/VendorOrderDetailScreen';
import { VendorQrHandoffScreen } from '../screens/vendor/VendorQrHandoffScreen';
import { VendorStackParamList } from './types';

const Stack = createNativeStackNavigator<VendorStackParamList>();

export const VendorNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="VendorMenu" component={VendorMenuScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="MenuItemCreate" component={MenuItemCreateScreen} options={{ title: 'Add Menu Item' }} />
      <Stack.Screen name="MenuItemEdit" component={MenuItemEditScreen} options={{ title: 'Edit Menu Item' }} />
      <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="VendorOrderDetail" component={VendorOrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="VendorQrHandoff" component={VendorQrHandoffScreen} options={{ title: 'QR Handoff' }} />
    </Stack.Navigator>
  );
};