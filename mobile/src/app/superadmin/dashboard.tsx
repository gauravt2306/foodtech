'use client';

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '@/services/superadmin';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface AnalyticsData {
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
}

export default function SuperAdminDashboardScreen() {
  console.log('[SuperAdminDashboard] Component mounted');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['superadmin-analytics'],
    queryFn: async () => {
      console.log('[SuperAdminDashboard] Calling superadminApi.getAnalytics()');
      const result = await superadminApi.getAnalytics();
      console.log('[SuperAdminDashboard] API result:', JSON.stringify(result ?? 'undefined').substring(0, 500));
      return result;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  console.log('[SuperAdminDashboard] Render:', { isLoading, isError, hasData: !!data });

  // Debug: log the full data structure
  console.log('[SuperAdminDashboard] Full data:', JSON.stringify(data ?? 'undefined', null, 2).substring(0, 1000));

  const analytics = data as AnalyticsData | undefined;
  console.log('[SuperAdminDashboard] Analytics extracted:', analytics);

  // Add a useEffect to track mount
  React.useEffect(() => {
    console.log('[SuperAdminDashboard] useEffect mounted - component is on screen');
  }, []);
  const refreshing = isFetching;
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.push(`/superadmin/${route}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const KPI_CARDS = [
    {
      key: 'totalVendors',
      label: 'Total Vendors',
      value: analytics?.totalVendors || 0,
      icon: 'storefront-outline',
      color: colors.primary.DEFAULT,
      bgColor: colors.primaryLight,
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: 'bag-handle-outline',
      color: colors.warning.DEFAULT,
      bgColor: '#FEF3C7',
    },
    {
      key: 'totalRevenue',
      label: 'Revenue (Total)',
      value: analytics?.totalRevenue || 0,
      icon: 'cash-outline',
      color: colors.primary.DEFAULT,
      bgColor: colors.primaryLight,
      isCurrency: true,
    },
    {
      key: 'paidOrders',
      label: 'Paid Orders',
      value: analytics?.paidOrders || 0,
      icon: 'checkmark-circle-outline',
      color: colors.success.DEFAULT,
      bgColor: '#DCFCE7',
    },
  ];

  const renderKPICard = (card: typeof KPI_CARDS[0], key: string) => (
    <TouchableOpacity key={key} style={styles.kpiCard} activeOpacity={0.85}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIconContainer, { backgroundColor: card.bgColor }]}>
          <Ionicons name={card.icon as any} size={24} color={card.color} />
        </View>
      </View>
      <View style={styles.kpiContent}>
        <Text style={styles.kpiLabel}>{card.label}</Text>
        <Text style={styles.kpiValue}>
          {card.isCurrency ? formatCurrency(card.value) : formatNumber(card.value)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary.DEFAULT]} />
          }
        >
          <View style={styles.kpiGrid}>
            {KPI_CARDS.map((card, index) => (
              <View key={card.key} style={styles.kpiCard}>
                <Skeleton variant="rect" height={40} style={styles.skeletonIcon} />
                <Skeleton variant="rect" height={20} style={styles.skeletonLabel} />
                <Skeleton variant="rect" height={32} style={styles.skeletonValue} />
              </View>
            ))}
          </View>
          <Card style={styles.sectionCard} padding="lg">
            <Skeleton variant="rect" height={24} width="60%" style={styles.skeletonSectionTitle} />
            {Array(3).fill(0).map((_, i) => (
              <View key={i} style={styles.skeletonVendorRow}>
                <Skeleton variant="rect" height={40} width={40} style={styles.skeletonAvatar} />
                <View style={styles.skeletonVendorInfo}>
                  <Skeleton variant="rect" height={16} width="70%" />
                  <Skeleton variant="rect" height={12} width="50%" />
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <Text style={styles.errorSubtext}>Pull to refresh</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary.DEFAULT]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Super Admin Dashboard</Text>
          <Text style={styles.nameText}>System Overview</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        {KPI_CARDS.map((card) => renderKPICard(card, card.key))}
      </View>

      <Card style={styles.sectionCard} padding="lg">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
        </View>
        <View style={styles.todayGrid}>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>Total Orders</Text>
            <Text style={styles.todayValue}>{formatNumber(analytics?.totalOrders || 0)}</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>Total Revenue</Text>
            <Text style={styles.todayValue}>{formatCurrency(analytics?.totalRevenue || 0)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard} padding="lg">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
        </View>
        <View style={styles.todayGrid}>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>Total Vendors</Text>
            <Text style={styles.todayValue}>{formatNumber(analytics?.totalVendors || 0)}</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>Paid Orders</Text>
            <Text style={styles.todayValue}>{formatNumber(analytics?.paidOrders || 0)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard} padding="lg">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => handleNavigate('vendors')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="person-add" size={24} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.actionLabel}>Manage Vendors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => handleNavigate('users')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="people" size={24} color={colors.info.DEFAULT} />
            </View>
            <Text style={styles.actionLabel}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => handleNavigate('analytics')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="analytics" size={24} color={colors.success.DEFAULT} />
            </View>
            <Text style={styles.actionLabel}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => Alert.alert('Export Reports', 'Report export feature coming soon')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="download" size={24} color={colors.warning.DEFAULT} />
            </View>
            <Text style={styles.actionLabel}>Export Reports</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    width: '48%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  kpiHeader: {
    marginBottom: spacing.md,
  },
  kpiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiContent: {
    gap: spacing.xs,
  },
  kpiLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontFamily: typography.sansBold,
    fontSize: 24,
    color: colors.text.primary,
  },
  sectionCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  todayGrid: {
    flexDirection: 'row',
  },
  todayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  todayLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  todayValue: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  todayDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.default,
  },
  vendorList: {
    gap: spacing.md,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  vendorRankContainer: {
    width: 32,
    alignItems: 'center',
  },
  vendorRank: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  vendorInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  vendorMeta: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  vendorRevenue: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  vendorRevenueLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  vendorRevenueValue: {
    fontFamily: typography.sansBold,
    fontSize: 15,
    color: colors.primary.DEFAULT,
  },
  emptyState: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionBtn: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    width: '48%',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  actionLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.text.primary,
    textAlign: 'center',
  },
  skeletonIcon: {
    borderRadius: radius.xl,
    width: 44,
    height: 44,
    marginBottom: spacing.md,
  },
  skeletonLabel: {
    borderRadius: radius.sm,
    width: '60%',
  },
  skeletonValue: {
    borderRadius: radius.sm,
    width: '40%',
  },
  skeletonSectionTitle: {
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  skeletonAvatar: {
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  skeletonVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  skeletonVendorInfo: {
    flex: 1,
    gap: spacing.md,
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
    color: colors.text.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  nameText: {
    fontFamily: typography.sansBold,
    fontSize: 24,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.error.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  logoutText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.error.DEFAULT,
  },
});