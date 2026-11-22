import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmployeeNavigationProp } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { OrderStatus } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const EmployeeOrdersScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const { orders, fetchOrders, isLoading, pagination } = useEmployeeStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const statusOptions: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  const loadData = async () => {
    try {
      await fetchOrders({ status: selectedStatus === 'all' ? undefined : selectedStatus });
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const loadMore = async () => {
    if (pagination.page < pagination.totalPages) {
      try {
        await fetchOrders({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          page: pagination.page + 1,
        });
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { bg: colors.warning.bg, text: colors.warning.dark, icon: 'time' };
      case 'confirmed': return { bg: colors.info.bg, text: colors.info.dark, icon: 'checkmark-circle' };
      case 'preparing': return { bg: colors.primaryLight, text: colors.primary.dark, icon: 'restaurant' };
      case 'ready': return { bg: colors.success.bg, text: colors.success.dark, icon: 'bag-handle' };
      case 'completed': return { bg: colors.background.secondary, text: colors.text.secondary, icon: 'checkmark-circle' };
      case 'cancelled': return { bg: colors.error.bg, text: colors.error.dark, icon: 'close-circle' };
      default: return { bg: colors.background.secondary, text: colors.text.muted, icon: 'help-circle' };
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusStyle = getStatusColor(item.status);
    const vendorName = item.vendor?.businessName || 'Unknown Vendor';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('EmployeeOrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vendor</Text>
            <Text style={styles.detailValue}>{vendorName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items</Text>
            <Text style={styles.detailValue}>{item.items?.length || 0} items</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{item.paymentMethod?.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={[styles.detailValue, styles.amountText]}>₹{(item.total / 100).toFixed(2)}</Text>
          </View>
        </View>

        {item.status === 'ready' && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate('QrCodeDisplay', { orderId: item.id, qrToken: item.qrCodeData || '', expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() } as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={16} color={colors.primary.foreground} style={styles.qrButtonIcon} />
            <Text style={styles.qrButtonText}>View QR Code</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {statusOptions.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                selectedStatus === status && styles.filterChipActive,
                status !== 'all' && { borderColor: getStatusColor(status as OrderStatus).text }
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.filterChipText,
                selectedStatus === status && styles.filterChipTextActive,
                status !== 'all' && { color: getStatusColor(status as OrderStatus).text }
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-handle" size={48} color={colors.text.muted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterScroll: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  filterChipTextActive: {
    color: colors.primary.foreground,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    padding: spacing['2xl'],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdContainer: {
    flex: 1,
  },
  orderNumber: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
  },
  orderDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  detailValue: {
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
    color: colors.text.primary,
  },
  amountText: {
    fontFamily: typography.sansBold,
    color: colors.success.DEFAULT,
    fontSize: typography.md,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.md,
  },
  qrButtonIcon: {
    marginRight: spacing.xs,
  },
  qrButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.primary.foreground,
  },
});