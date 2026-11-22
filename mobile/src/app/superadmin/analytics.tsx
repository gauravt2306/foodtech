'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Dimensions, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { superadminApi, Analytics, OrderAnalytics, RevenueAnalytics, VendorPerformance } from '@/services/superadmin';
import { Card } from '@/components/ui/Card';
import { AppHeader } from '@/components/ui/AppHeader';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart, StatCard } from '@/components/superadmin/AnalyticsCharts';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

interface CombinedAnalytics {
  overview: Analytics;
  orders: OrderAnalytics;
  revenue: RevenueAnalytics;
  vendorPerformance: VendorPerformance;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

export default function SuperAdminAnalyticsScreen() {
  const [dateRange, setDateRange] = React.useState<'7d' | '30d' | '90d'>('7d');

  const { data: overviewData, isLoading: overviewLoading, isError: overviewError, refetch: refetchOverview } = useQuery({
    queryKey: ['superadmin-analytics-overview'],
    queryFn: () => superadminApi.getAnalytics(),
    staleTime: 60 * 1000,
  });

  const { data: ordersData, isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useQuery({
    queryKey: ['superadmin-analytics-orders', dateRange],
    queryFn: () => superadminApi.getOrderAnalytics({
      from: dateRange === '7d' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
                 dateRange === '30d' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
                 new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
    staleTime: 60 * 1000,
  });

  const { data: revenueData, isLoading: revenueLoading, isError: revenueError, refetch: refetchRevenue } = useQuery({
    queryKey: ['superadmin-analytics-revenue', dateRange],
    queryFn: () => superadminApi.getRevenueAnalytics({
      from: dateRange === '7d' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
                 dateRange === '30d' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
                 new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
    staleTime: 60 * 1000,
  });

  const { data: vendorPerformanceData, isLoading: vendorPerfLoading, isError: vendorPerfError, refetch: refetchVendorPerf } = useQuery({
    queryKey: ['superadmin-analytics-vendor-performance'],
    queryFn: () => superadminApi.getVendorPerformance(),
    staleTime: 60 * 1000,
  });

  const isLoading = overviewLoading || ordersLoading || revenueLoading || vendorPerfLoading;
  const isError = overviewError || ordersError || revenueError || vendorPerfError;

  // apiClient already unwraps response: response.data.data || response.data
  // So the data is directly the DTO, not nested in .data
  const analytics: CombinedAnalytics | null = overviewData && ordersData && revenueData && vendorPerformanceData ? {
    overview: overviewData,
    orders: ordersData,
    revenue: revenueData,
    vendorPerformance: vendorPerformanceData,
  } : null;

  const handleRefresh = () => {
    refetchOverview();
    refetchOrders();
    refetchRevenue();
    refetchVendorPerf();
  };

  const DATE_RANGE_OPTIONS = [
    { value: '7d' as const, label: 'Last 7 Days' },
    { value: '30d' as const, label: 'Last 30 Days' },
    { value: '90d' as const, label: 'Last 90 Days' },
  ];

  const renderDateRangeButton = (option: typeof DATE_RANGE_OPTIONS[0], key: string) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.dateRangeBtn,
        dateRange === option.value && styles.dateRangeBtnActive,
      ]}
      onPress={() => setDateRange(option.value)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.dateRangeBtnText,
        dateRange === option.value && styles.dateRangeBtnTextActive,
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Analytics" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[colors.primary.DEFAULT]} progressBackgroundColor={colors.background.secondary} />
          }
        >
          <View style={styles.dateRangeContainer}>
            {DATE_RANGE_OPTIONS.map(opt => renderDateRangeButton(opt, opt.value))}
          </View>
          <View style={styles.statsGrid}>
            {Array(4).fill(0).map((_, i) => (
              <View key={i} style={styles.statCard}>
                <Skeleton variant="rect" height={44} width={44} style={styles.skeletonIcon} />
                <Skeleton variant="rect" height={16} width="60%" />
                <Skeleton variant="rect" height={28} width="80%" />
              </View>
            ))}
          </View>
          <Card style={styles.sectionCard} padding="lg">
            <Skeleton variant="rect" height={24} width="60%" style={styles.skeletonSectionTitle} />
            <View style={{ width: CHART_WIDTH, height: 220 }}>
              <Skeleton variant="rect" height={220} width={CHART_WIDTH} />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !analytics) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AppHeader title="Analytics" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
          <Text style={styles.errorText}>Failed to load analytics</Text>
          <Text style={styles.errorSubtext}>Pull to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Transform API data to match expected structure - defensive checks for undefined
  // RevenueAnalyticsDto has dailyRevenue: DailyRevenueStat[] with date, revenue, orders
  const revenueByDay = analytics?.revenue?.dailyRevenue?.map((d: any) => ({ key: d.date, label: formatDate(d.date).split(',')[0], value: d.revenue })) || [];
  // OrderAnalyticsDto has dailyStats: DailyOrderStat[] with date, totalOrders, totalRevenue, byStatus
  const ordersByDay = analytics?.orders?.dailyStats?.map((d: any) => ({ key: d.date, label: formatDate(d.date).split(',')[0], value: d.totalOrders })) || [];
  // Aggregate orders by status from dailyStats
  const ordersByStatus = analytics?.orders?.dailyStats?.reduce((acc: any[], d: any) => {
    Object.entries(d.byStatus || {}).forEach(([status, count]) => {
      const existing = acc.find(s => s.key === status);
      if (existing) {
        existing.value += count as number;
      } else {
        acc.push({ key: status, label: status.charAt(0).toUpperCase() + status.slice(1), value: count as number, color: getStatusColor(status) });
      }
    });
    return acc;
  }, []) || [];

  // Calculate trends (mock for now)
  const revenueTrend = revenueByDay.length >= 2
    ? ((revenueByDay[revenueByDay.length - 1].value - revenueByDay[revenueByDay.length - 2].value) / (revenueByDay[revenueByDay.length - 2].value || 1)) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Analytics" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[colors.primary.DEFAULT]} progressBackgroundColor={colors.background.secondary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateRangeContainer}>
          {DATE_RANGE_OPTIONS.map(opt => renderDateRangeButton(opt, opt.value))}
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(analytics?.overview?.totalRevenue || 0)}
            icon="cash-outline"
            color={colors.primary.DEFAULT}
            bgColor={colors.primaryLight}
            trend={{ value: Math.abs(revenueTrend), isPositive: revenueTrend >= 0 }}
          />
          <StatCard
            label="Revenue (MTD)"
            value={formatCurrency(analytics?.overview?.totalRevenue || 0)}
            icon="trending-up-outline"
            color={colors.success.DEFAULT}
            bgColor={colors.successLight}
          />
          <StatCard
            label="Total Orders"
            value={formatNumber(analytics?.overview?.totalOrders || 0)}
            icon="bag-handle-outline"
            color={colors.info.DEFAULT}
            bgColor={colors.infoLight}
          />
          <StatCard
            label="Avg Order Value"
            value={formatCurrency(
              (analytics?.overview?.totalOrders || 0) > 0
                ? (analytics?.overview?.totalRevenue || 0) / (analytics?.overview?.totalOrders || 1)
                : 0
            )}
            icon="calculator-outline"
            color={colors.warning.DEFAULT}
            bgColor={colors.warningLight}
          />
        </View>

        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue by Day</Text>
          </View>
          <BarChart
            data={revenueByDay.slice(-7)}
            title=""
            color={colors.primary.DEFAULT}
            formatValue={formatCurrency}
          />
        </Card>

        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Orders by Day</Text>
          </View>
          <LineChart
            data={ordersByDay.slice(-7)}
            title=""
            color={colors.info.DEFAULT}
            formatValue={formatNumber}
            fillColor={colors.info.DEFAULT}
          />
        </Card>

        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Orders by Status</Text>
          </View>
          <BarChart
            data={ordersByStatus}
            title=""
            color={colors.warning.DEFAULT}
            formatValue={formatNumber}
          />
        </Card>

        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Vendors by Revenue</Text>
          </View>
          <View style={styles.vendorList}>
            {analytics?.vendorPerformance?.vendors?.slice(0, 5).map((vendor: any, index: number) => (
              <TouchableOpacity
                key={vendor.vendorId}
                style={styles.vendorRow}
                activeOpacity={0.85}
              >
                <View style={styles.vendorRankContainer}>
                  <Text style={styles.vendorRank}>#{index + 1}</Text>
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{vendor.businessName}</Text>
                  <Text style={styles.vendorMeta}>
                    {formatNumber(vendor.totalOrders)} orders
                  </Text>
                </View>
                <View style={styles.vendorRevenue}>
                  <Text style={styles.vendorRevenueLabel}>Revenue</Text>
                  <Text style={styles.vendorRevenueValue}>{formatCurrency(vendor.totalRevenue)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={styles.exportSection}>
          <CTAButton size="md" fullWidth onPress={() => {}}>
            <Ionicons name="download" size={20} color={colors.primary.foreground} style={styles.exportIcon} />
            <Text style={styles.exportBtnText}>Export Full Report (CSV)</Text>
          </CTAButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: colors.status.pending,
    confirmed: colors.status.confirmed,
    preparing: colors.status.preparing,
    ready: colors.status.ready,
    completed: colors.status.completed,
    cancelled: colors.status.cancelled,
  };
  return statusColors[status] || colors.text.muted;
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
  dateRangeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dateRangeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  dateRangeBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary.DEFAULT,
  },
  dateRangeBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRangeBtnTextActive: {
    color: colors.primary.DEFAULT,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
    gap: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 22,
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
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  vendorList: {
    gap: spacing.sm,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
  },
  vendorRankContainer: {
    width: 32,
    alignItems: 'center',
  },
  vendorRank: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.primary.DEFAULT,
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
    color: colors.text.muted,
  },
  vendorRevenue: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  vendorRevenueLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  vendorRevenueValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.primary.DEFAULT,
  },
  skeletonIcon: {
    borderRadius: radius.xl,
    marginRight: spacing.md,
  },
  skeletonSectionTitle: {
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  exportSection: {
    paddingTop: spacing.md,
  },
  exportIcon: {
    marginRight: spacing.sm,
  },
  exportBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.primary.foreground,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  errorSubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
});