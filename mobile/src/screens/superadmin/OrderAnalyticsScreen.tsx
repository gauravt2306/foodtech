import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SuperAdminNavigationProp } from '@/navigation/types';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type PeriodOption = '7d' | '30d' | '90d';

const getPeriodDates = (period: PeriodOption): { from: string; to: string } => {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let fromDate = new Date(now);

  switch (period) {
    case '7d':
      fromDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      fromDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      fromDate.setDate(now.getDate() - 90);
      break;
  }

  const from = fromDate.toISOString().split('T')[0];
  return { from, to };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return { bg: colors.warning.bg, text: colors.warning.dark };
    case 'confirmed': return { bg: colors.info.bg, text: colors.info.dark };
    case 'preparing': return { bg: colors.primaryLight, text: colors.primary.dark };
    case 'ready': return { bg: colors.success.bg, text: colors.success.dark };
    case 'completed': return { bg: colors.background.secondary, text: colors.text.secondary };
    case 'cancelled': return { bg: colors.error.bg, text: colors.error.dark };
    default: return { bg: colors.background.secondary, text: colors.text.muted };
  }
};

export const OrderAnalyticsScreen = () => {
  const navigation = useNavigation<SuperAdminNavigationProp>();
  const { orderAnalytics, fetchOrderAnalytics, isLoading } = useSuperAdminStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('30d');

  const loadData = async () => {
    try {
      const dates = getPeriodDates(selectedPeriod);
      await fetchOrderAnalytics(dates);
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  if (isLoading && !orderAnalytics) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  const analytics = orderAnalytics;
  const dailyStats = analytics?.dailyStats || [];

  // Calculate totals from daily stats
  const totalOrders = dailyStats.reduce((sum, day) => sum + day.totalOrders, 0);
  const totalRevenue = dailyStats.reduce((sum, day) => sum + day.totalRevenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Aggregate status breakdown
  const statusMap: Record<string, number> = {};
  dailyStats.forEach(day => {
    Object.entries(day.byStatus).forEach(([status, count]) => {
      statusMap[status] = (statusMap[status] || 0) + count;
    });
  });
  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order Analytics</Text>
          <Text style={styles.subtitle}>Order trends and performance metrics</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.section}>
          <View style={styles.periodSelector}>
            {periodOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === option.value && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(option.value as PeriodOption)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === option.value && styles.periodButtonTextActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: colors.primary.DEFAULT }]}>
            <Ionicons name="bag-handle" size={24} color={colors.primary.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="cash" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.warning.DEFAULT }]}>
            <Ionicons name="analytics" size={24} color={colors.warning.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{avgOrderValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Order Value</Text>
          </View>
        </View>

        {/* Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Trend</Text>
          <View style={styles.chartContainer}>
            {dailyStats.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="analytics" size={48} color={colors.text.muted} style={styles.emptyChartIcon} />
                <Text style={styles.emptyChartText}>No data available for this period</Text>
              </View>
            ) : (
              <View style={styles.trendBars}>
                {dailyStats.map((point, index) => (
                  <View key={index} style={styles.trendBarWrapper}>
                    <View style={[
                      styles.trendBar,
                      {
                        height: Math.max((point.totalOrders / Math.max(...dailyStats.map(t => t.totalOrders || 1))) * 150, 8),
                      },
                    ]} />
                    <Text style={styles.trendBarLabel}>{point.date}</Text>
                    <Text style={styles.trendBarValue}>{point.totalOrders} orders</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Status Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status Breakdown</Text>
          <View style={styles.statusBreakdownGrid}>
            {statusBreakdown.length === 0 ? (
              <View style={styles.emptyBreakdown}>
                <Ionicons name="information-circle" size={48} color={colors.text.muted} style={styles.emptyBreakdownIcon} />
                <Text style={styles.emptyBreakdownText}>No status data available</Text>
              </View>
            ) : (
              statusBreakdown.map((item, index) => (
                <View key={index} style={styles.statusItem}>
                  <View style={[
                    styles.statusColorBar,
                    { backgroundColor: getStatusColor(item.status).bg },
                  ]} />
                  <View style={styles.statusItemInfo}>
                    <Text style={[
                      styles.statusItemLabel,
                      { color: getStatusColor(item.status).text },
                    ]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                    <View style={styles.statusItemStats}>
                      <Text style={styles.statusItemCount}>{item.count} orders</Text>
                      <Text style={styles.statusItemPercentage}>
                        {totalOrders > 0
                          ? `${((item.count / totalOrders) * 100).toFixed(1)}%`
                          : '0%'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Daily Stats List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Statistics</Text>
          {dailyStats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={48} color={colors.text.muted} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No daily data available</Text>
            </View>
          ) : (
            <FlatList
              data={dailyStats.slice().reverse()} // Show latest first
              renderItem={({ item }) => (
                <View style={styles.dailyStatItem}>
                  <Text style={styles.dailyStatDate}>{item.date}</Text>
                  <View style={styles.dailyStatStats}>
                    <Text style={styles.dailyStatOrders}>{item.totalOrders} orders</Text>
                    <Text style={styles.dailyStatRevenue}>₹{item.totalRevenue.toFixed(2)}</Text>
                  </View>
                </View>
              )}
              keyExtractor={item => item.date}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>
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
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  periodButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  periodButtonTextActive: {
    color: colors.primary.foreground,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.md,
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    minHeight: 200,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyChartIcon: {},
  emptyChartText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  trendBarWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendBar: {
    width: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.primary.DEFAULT,
    minHeight: 8,
  },
  trendBarLabel: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  trendBarValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.primary,
  },
  statusBreakdownGrid: {
    gap: spacing.sm,
  },
  emptyBreakdown: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyBreakdownIcon: {},
  emptyBreakdownText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  statusColorBar: {
    width: 4,
    height: 40,
    borderRadius: radius.sm,
  },
  statusItemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  statusItemLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
  },
  statusItemStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusItemCount: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.secondary,
  },
  statusItemPercentage: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.primary.DEFAULT,
  },
  emptyState: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  emptyIcon: {},
  emptyText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  dailyStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dailyStatDate: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  dailyStatStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dailyStatOrders: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  dailyStatRevenue: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.DEFAULT,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.xs,
  },
});