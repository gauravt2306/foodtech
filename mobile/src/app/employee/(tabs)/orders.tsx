'use client';

import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { employeeApi, Order } from '@/services/employee';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppHeader } from '@/components/ui/AppHeader';
import { formatCurrency, formatDateTime, getRelativeTime } from '@/utils/formatters';
import { getStatusConfig, OrderStatus } from '@/constants/orderStatus';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => employeeApi.listOrders(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const orders = data || [];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isRefreshing = isFetching || refreshing;

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item.status);
    const itemCount = item.items?.length || 0;
    const updatedAt = item.handoffAt || item.createdAt;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/employee/order-detail?id=${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.orderHeader}>
          <View style={styles.vendorInfo}>
            <View style={styles.vendorNameRow}>
              <Text style={styles.vendorName}>{item.vendorName || 'Unknown Restaurant'}</Text>
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
            </View>
            <Text style={styles.orderMeta}>
              {item.orderNumber} • {formatDateTime(item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ITEMS</Text>
            <Text style={styles.detailValue}>{itemCount}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TOTAL</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.total)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.detailValue, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.updatedText}>
            Updated {getRelativeTime(updatedAt)}
          </Text>
          <TouchableOpacity style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsBtnText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.DEFAULT} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.orderCard}>
      <Skeleton variant="rect" height={40} style={styles.skeletonHeader} />
      <Skeleton variant="rect" height={50} style={styles.skeletonDetails} />
      <Skeleton variant="rect" height={30} style={styles.skeletonFooter} />
    </View>
  );

  const headerComponent = () => (
    <View style={styles.headerSection}>
      <AppHeader title="Bookings" showBack={false} showSearch={false} showProfile={false} />
      <View style={styles.headerStats}>
        <View style={styles.headerStat}>
          <Text style={styles.headerStatValue}>{orders.length}</Text>
          <Text style={styles.headerStatLabel}>Total Orders</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStat}>
          <Text style={styles.headerStatValue}>
            {orders.filter((o: { status: string }) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing').length}
          </Text>
          <Text style={styles.headerStatLabel}>Active</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStat}>
          <Text style={styles.headerStatValue}>
            {orders.filter((o: { status: string }) => o.status === 'completed').length}
          </Text>
          <Text style={styles.headerStatLabel}>Completed</Text>
        </View>
      </View>
    </View>
  );

  const footerComponent = () => (
    <View style={{ paddingBottom: 120 }} />
  );

  const dataToRender = isLoading
    ? Array(5).fill(null)
    : orders;

  const renderItem = ({ item }: { item: Order | null }) => {
    if (!item) return renderSkeleton();
    return renderOrder({ item });
  };

  const keyExtractor = (item: Order | null, index: number) => item ? item.id : `skeleton-${index}`;

  const listEmptyComponent = isError ? (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
      </View>
      <Text style={styles.emptyTitle}>Failed to load bookings</Text>
      <Text style={styles.emptySubtext}>Pull to refresh or try again later</Text>
    </View>
  ) : orders.length === 0 && !isLoading ? (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Text style={styles.emptyIcon}>📦</Text>
      </View>
      <Text style={styles.emptyTitle}>No bookings yet</Text>
      <Text style={styles.emptySubtext}>
        Your booking history will appear here once you place an order
      </Text>
    </View>
  ) : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dataToRender}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.DEFAULT]}
            progressBackgroundColor={colors.surface.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={listEmptyComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerSection: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerStat: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatValue: {
    fontFamily: typography.sansBold,
    fontSize: 24,
    color: colors.primary.DEFAULT,
  },
  headerStatLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  headerStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.default,
  },
  orderCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderMeta: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  orderDetails: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.default,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatedText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  viewDetailsBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  skeletonHeader: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  skeletonDetails: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  skeletonFooter: {
    borderRadius: radius.lg,
    width: '40%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
    minHeight: 300,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surface.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
});