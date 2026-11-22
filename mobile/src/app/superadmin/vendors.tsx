'use client';

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi, Vendor as ApiVendor } from '@/services/superadmin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppHeader } from '@/components/ui/AppHeader';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

// Extend Vendor with the userId object type from the API
interface Vendor extends Omit<ApiVendor, 'userId'> {
  userId?: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isActive?: boolean;
  };
}

export default function SuperAdminVendorsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['superadmin-vendors'],
    queryFn: () => superadminApi.listVendors(),
    staleTime: 30 * 1000,
  });

  const vendors = (data as Vendor[]) || [];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const isRefreshing = isFetching || refreshing;

  const approveMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      superadminApi.approveVendor(id, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-vendors'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update vendor status';
      Alert.alert('Error', message);
    },
  });

  const handleApprove = (vendor: Vendor) => {
    if (vendor.isApproved) return;

    Alert.alert(
      'Approve Vendor',
      `Approve "${vendor.businessName}"? They will be able to manage their menu and receive orders.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveMutation.mutate({ id: vendor.id, approve: true }) },
      ]
    );
  };

  const handleReject = (vendor: Vendor) => {
    if (!vendor.isApproved) return;

    Alert.alert(
      'Reject Vendor',
      `Reject "${vendor.businessName}"? They will lose access to vendor features.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => approveMutation.mutate({ id: vendor.id, approve: false }) },
      ]
    );
  };

  const renderVendor = ({ item }: { item: Vendor }) => {
    const owner = typeof item.userId === 'object' ? item.userId : null;

    return (
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() => router.push(`/superadmin/vendor-detail?id=${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.vendorHeader}>
          <View style={styles.vendorInfo}>
            <Text style={styles.businessName}>{item.businessName}</Text>
            {owner && (
              <Text style={styles.ownerInfo}>
                {owner.name} • {owner.email}
              </Text>
            )}
            <Text style={styles.locationInfo}>
              📍 {item.address?.city}, {item.address?.state}
            </Text>
          </View>
          <Badge variant={item.isApproved ? 'veg' : 'nonveg'} size="lg">
            {item.isApproved ? 'APPROVED' : 'PENDING'}
          </Badge>
        </View>

        <View style={styles.vendorStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>RATING</Text>
            <Text style={styles.statValue}>⭐ {item.rating?.toFixed(1) || '0.0'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ORDERS</Text>
            <Text style={styles.statValue}>{formatNumber(item.totalOrders)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SINCE</Text>
            <Text style={styles.statValue}>{formatDate('2024-01-01')}</Text>
          </View>
        </View>

        {!item.isApproved && (
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={(e) => { e.stopPropagation(); handleApprove(item); }}
            activeOpacity={0.8}
          >
            <Text style={styles.approveBtnText}>Approve Vendor</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.vendorCard}>
      <Skeleton variant="rect" height={60} style={styles.skeletonHeader} />
      <Skeleton variant="rect" height={50} style={styles.skeletonStats} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Vendor Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <FlatList
          data={Array(5)}
          renderItem={renderSkeleton}
          keyExtractor={(_, i) => `skeleton-${i}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>Loading vendors...</Text></View>}
        />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Vendor Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
          <Text style={styles.emptyTitle}>Failed to load vendors</Text>
          <Text style={styles.emptySubtext}>Pull to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vendors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Vendor Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>🏪</Text>
          <Text style={styles.emptyTitle}>No vendors registered</Text>
          <Text style={styles.emptySubtext}>Vendors will appear here once they register</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Vendor Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
      <FlatList
        data={vendors}
        renderItem={renderVendor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.DEFAULT]}
            progressBackgroundColor={colors.background.secondary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🏪</Text>
            <Text style={styles.emptyTitle}>No vendors registered</Text>
            <Text style={styles.emptySubtext}>Vendors will appear here once they register</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  vendorCard: {
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
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  vendorInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  businessName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ownerInfo: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  locationInfo: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
  vendorStats: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
  },
  approveBtn: {
    backgroundColor: colors.success.bgMedium,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success.border,
  },
  approveBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.success.DEFAULT,
  },
  skeletonHeader: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  skeletonStats: {
    borderRadius: radius.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
});