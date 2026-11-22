import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SuperAdminNavigationProp } from '@/navigation/types';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const SuperAdminDashboardScreen = () => {
  const navigation = useNavigation<SuperAdminNavigationProp>();
  const { user, logout } = useAuthStore();
  const { dashboardStats, fetchDashboardStats, isLoading } = useSuperAdminStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await fetchDashboardStats();
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  if (isLoading && !dashboardStats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  const stats = dashboardStats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Super Admin Dashboard</Text>
            <Text style={styles.nameText}>System Overview</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: colors.primary.DEFAULT }]}>
            <Ionicons name="storefront" size={24} color={colors.primary.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats?.totalVendors || 0}</Text>
            <Text style={styles.statLabel}>Total Vendors</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.warning.DEFAULT }]}>
            <Ionicons name="time" size={24} color={colors.warning.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats?.pendingApprovals || 0}</Text>
            <Text style={styles.statLabel}>Pending Approval</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="bag-handle" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="cash" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{((stats?.totalRevenue || 0)).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.warning.DEFAULT }]}
              onPress={() => navigation.navigate('PendingVendors')}
            >
              <Ionicons name="time" size={28} color={colors.warning.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Review Vendors</Text>
              <Text style={styles.actionSubtitle}>{stats?.pendingApprovals || 0} pending approval</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.info.DEFAULT }]}
              onPress={() => navigation.navigate('OrderAnalytics')}
            >
              <Ionicons name="analytics" size={28} color={colors.info.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Order Analytics</Text>
              <Text style={styles.actionSubtitle}>View order trends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.success.DEFAULT }]}
              onPress={() => navigation.navigate('RevenueAnalytics')}
            >
              <Ionicons name="cash" size={28} color={colors.success.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Revenue Analytics</Text>
              <Text style={styles.actionSubtitle}>Track revenue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.role.superadmin.border }]}
              onPress={() => navigation.navigate('VendorAnalytics')}
            >
              <Ionicons name="storefront" size={28} color={colors.role.superadmin.text} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Vendor Analytics</Text>
              <Text style={styles.actionSubtitle}>Performance metrics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <View style={[styles.healthIndicator, { backgroundColor: colors.success.DEFAULT }]} />
              <Text style={styles.healthLabel}>API Status</Text>
              <Text style={styles.healthValue}>Operational</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={[styles.healthIndicator, { backgroundColor: colors.success.DEFAULT }]} />
              <Text style={styles.healthLabel}>Database</Text>
              <Text style={styles.healthValue}>Connected</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={[styles.healthIndicator, { backgroundColor: colors.success.DEFAULT }]} />
              <Text style={styles.healthLabel}>Auth Service</Text>
              <Text style={styles.healthValue}>Active</Text>
            </View>
            <View style={styles.healthCard}>
              <View style={[styles.healthIndicator, { backgroundColor: colors.warning.DEFAULT }]} />
              <Text style={styles.healthLabel}>Pending Reviews</Text>
              <Text style={styles.healthValue}>{(stats?.pendingApprovals || 0)} vendors</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Approval Rate</Text>
              <Text style={styles.summaryValue}>
                {stats && stats.totalVendors > 0
                  ? `${(((stats.totalVendors - (stats.pendingApprovals || 0)) / stats.totalVendors) * 100).toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Avg Order Value</Text>
              <Text style={styles.summaryValue}>
                {stats && stats.totalOrders > 0
                  ? `₹${((stats.totalRevenue / stats.totalOrders)).toFixed(2)}`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Orders per Vendor</Text>
              <Text style={styles.summaryValue}>
                {stats && stats.totalVendors > 0
                  ? `${(stats.totalOrders / stats.totalVendors).toFixed(1)}`
                  : 'N/A'}
              </Text>
            </View>
          </View>
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
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  nameText: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error.bg,
    borderRadius: radius.md,
  },
  logoutText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.error.dark,
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
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  actionSubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  healthCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  healthLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  healthValue: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  summaryLabel: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.DEFAULT,
  },
});