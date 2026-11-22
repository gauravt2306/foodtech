import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmployeeDashboardScreen } from '../screens/employee/EmployeeDashboardScreen';
import { VendorListScreen } from '../screens/employee/VendorListScreen';
import { EmployeeVendorMenuScreen } from '../screens/employee/EmployeeVendorMenuScreen';
import { OrderCreateScreen } from '../screens/employee/OrderCreateScreen';
import { EmployeeOrdersScreen } from '../screens/employee/EmployeeOrdersScreen';
import { EmployeeOrderDetailScreen } from '../screens/employee/EmployeeOrderDetailScreen';
import { UpiPaymentScreen } from '../screens/employee/UpiPaymentScreen';
import { QrCodeDisplayScreen } from '../screens/employee/QrCodeDisplayScreen';
import { EmployeeStackParamList } from './types';

const Stack = createNativeStackNavigator<EmployeeStackParamList>();

export const EmployeeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="VendorList" component={VendorListScreen} options={{ title: 'Vendors' }} />
      <Stack.Screen name="VendorMenu" component={EmployeeVendorMenuScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="OrderCreate" component={OrderCreateScreen} options={{ title: 'Create Order' }} />
      <Stack.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="EmployeeOrderDetail" component={EmployeeOrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="UpiPayment" component={UpiPaymentScreen} options={{ title: 'UPI Payment' }} />
      <Stack.Screen name="QrCodeDisplay" component={QrCodeDisplayScreen} options={{ title: 'QR Code' }} />
    </Stack.Navigator>
  );
};