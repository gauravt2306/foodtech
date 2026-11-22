import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SuperAdminNavigationProp } from '@/navigation/types';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const RevenueAnalyticsScreen = () => {
  const navigation = useNavigation<SuperAdminNavigationProp>();
  const { revenueAnalytics, fetchRevenueAnalytics, isLoading } = useSuperAdminStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const loadData = async () => {
    try {
      const [from, to] = getDateRange(selectedPeriod);
      await fetchRevenueAnalytics({ from, to });
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

  const getDateRange = (period: '7d' | '30d' | '90d') => {
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    const fromDate = new Date(now);
    if (period === '7d') fromDate.setDate(now.getDate() - 7);
    else if (period === '30d') fromDate.setDate(now.getDate() - 30);
    else fromDate.setDate(now.getDate() - 90);
    const from = fromDate.toISOString().split('T')[0];
    return [from, to];
  };

  if (isLoading && !revenueAnalytics) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  const analytics = revenueAnalytics;
  const dailyRevenue = analytics?.dailyRevenue || [];
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const avgOrderValue = analytics?.averageOrderValue || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.success.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Revenue Analytics</Text>
          <Text style={styles.subtitle}>Revenue trends and payment insights</Text>
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
                onPress={() => setSelectedPeriod(option.value as '7d' | '30d' | '90d')}
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
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="cash" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.info.DEFAULT }]}>
            <Ionicons name="bag-handle" size={24} color={colors.info.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.role.superadmin.border }]}>
            <Ionicons name="analytics" size={24} color={colors.role.superadmin.text} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{avgOrderValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Order Value</Text>
          </View>
        </View>

        {/* Revenue Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <View style={styles.chartContainer}>
            {dailyRevenue.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="analytics" size={48} color={colors.text.muted} style={styles.emptyChartIcon} />
                <Text style={styles.emptyChartText}>No data available for this period</Text>
              </View>
            ) : (
              <View style={styles.trendBars}>
                {dailyRevenue.map((point, index) => (
                  <View key={index} style={styles.trendBarWrapper}>
                    <View style={[
                      styles.trendBar,
                      {
                        height: Math.max((point.revenue / Math.max(...dailyRevenue.map(t => t.revenue || 1))) * 150, 8),
                      },
                    ]} />
                    <Text style={styles.trendBarLabel}>{point.date}</Text>
                    <Text style={styles.trendBarValue}>₹{point.revenue.toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Daily Revenue List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Revenue</Text>
          {dailyRevenue.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={48} color={colors.text.muted} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No daily revenue data available</Text>
            </View>
          ) : (
            <FlatList
              data={dailyRevenue.slice().reverse()} // Show latest first
              renderItem={({ item }) => (
                <View style={styles.dailyRevenueItem}>
                  <Text style={styles.dailyRevenueDate}>{item.date}</Text>
                  <View style={styles.dailyRevenueStats}>
                    <Text style={styles.dailyRevenueOrders}>{item.orders} orders</Text>
                    <Text style={styles.dailyRevenueValue}>₹{item.revenue.toFixed(2)}</Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
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
    gap: spacing.lg,
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
    backgroundColor: colors.success.DEFAULT,
    borderColor: colors.success.DEFAULT,
  },
  periodButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  periodButtonTextActive: {
    color: colors.success.foreground,
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
    textAlign: 'center',
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingHorizontal: spacing.sm,
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
    backgroundColor: colors.success.DEFAULT,
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
  emptyState: {
    padding: spacing.lg,
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
    textAlign: 'center',
  },
  dailyRevenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dailyRevenueDate: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  dailyRevenueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dailyRevenueOrders: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  dailyRevenueValue: {
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