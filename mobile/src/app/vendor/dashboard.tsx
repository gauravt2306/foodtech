'use client';

import React from 'react';
import { View, Text, StyleSheet, Platform, ToastAndroid } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendor';
import type { Order, VendorOrdersResponse } from '@/services/vendor';
import { Skeleton } from '@/components/ui/Skeleton';
import { KanbanBoard } from '@/components/vendor/KanbanBoard';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

export default function VendorDashboardScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => vendorApi.listOrders(),
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000,
  });

  // API returns grouped orders: { pending: [], confirmed: [], preparing: [], ready: [], completed: [], cancelled: [] }
  // vendorApi.listOrders() returns VendorOrdersResponse directly (unwrapped by apiClient)
  const ordersData = data as VendorOrdersResponse | undefined;

  const orders = ordersData ? [
    ...(ordersData.pending || []),
    ...(ordersData.confirmed || []),
    ...(ordersData.preparing || []),
    ...(ordersData.ready || []),
    ...(ordersData.completed || []),
    ...(ordersData.cancelled || []),
  ] : [];
  const [refreshing, setRefreshing] = React.useState(false);

  // Mutation for updating order status via drag-drop
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      vendorApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      if (Platform.OS === 'android') {
        ToastAndroid.show('Order status updated', ToastAndroid.SHORT);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update status';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isRefreshing = isFetching || refreshing;

  const handleOrderPress = (order: Order) => {
    // Navigation handled by router in the component
  };

  const handleDragEnd = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus as Order['status'] });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          {['pending', 'confirmed', 'preparing', 'ready', 'completed'].map((status, i) => (
            <View key={status} style={styles.skeletonColumn}>
              <Skeleton variant="rect" height={40} style={styles.skeletonHeader} />
              <Skeleton variant="rect" height={120} style={styles.skeletonCard} />
              <Skeleton variant="rect" height={120} style={styles.skeletonCard} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
        <Text style={styles.errorText}>Failed to load orders</Text>
        <Text style={styles.errorSubtext}>Pull to refresh</Text>
      </View>
    );
  }

  return (
    <KanbanBoard
      orders={orders}
      onOrderPress={handleOrderPress}
      onDragEnd={handleDragEnd}
      isLoading={isLoading}
      isError={isError}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexDirection: 'row',
    minWidth: 5 * 280,
  },
  skeletonColumn: {
    width: 260,
    gap: spacing.md,
  },
  skeletonHeader: {
    borderRadius: radius.xl,
    marginBottom: spacing.sm,
  },
  skeletonCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
  errorSubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
  },
});