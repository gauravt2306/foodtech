import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VendorNavigationProp } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const VendorDashboardScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const { user, logout } = useAuthStore();
  const { profile, menuItems, orders, fetchProfile, fetchMenu, fetchOrders, isLoading, error } = useVendorStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await Promise.all([fetchProfile(), fetchMenu(), fetchOrders()]);
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
    logout();
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

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
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{profile?.businessName || 'Vendor'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out" size={18} color={colors.error.DEFAULT} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        {profile && !profile.isApproved && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time" size={18} color={colors.warning.dark} style={styles.pendingIcon} />
            <Text style={styles.pendingText}>Your vendor profile is pending approval</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: colors.warning.DEFAULT }]}>
            <Ionicons name="time" size={24} color={colors.warning.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.primary.DEFAULT }]}>
            <Ionicons name="restaurant" size={24} color={colors.primary.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{preparingOrders}</Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="bag-handle" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{readyOrders}</Text>
            <Text style={styles.statLabel}>Ready for Pickup</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.primary.dark }]}>
            <Ionicons name="cash" size={24} color={colors.primary.dark} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{(totalRevenue / 100).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.success.DEFAULT }]}
              onPress={() => navigation.navigate('VendorMenu')}
            >
              <Ionicons name="fast-food" size={28} color={colors.success.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Menu</Text>
              <Text style={styles.actionSubtitle}>{menuItems.length} items</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.warning.DEFAULT }]}
              onPress={() => navigation.navigate('VendorOrders')}
            >
              <Ionicons name="bag-handle" size={28} color={colors.warning.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Orders</Text>
              <Text style={styles.actionSubtitle}>{orders.length} total</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: colors.info.DEFAULT }]}
              onPress={() => navigation.navigate('MenuItemCreate') as any}
            >
              <Ionicons name="add-circle" size={28} color={colors.info.DEFAULT} style={styles.actionIcon} />
              <Text style={styles.actionTitle}>Add Item</Text>
              <Text style={styles.actionSubtitle}>New menu item</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VendorOrders') as any}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-handle" size={40} color={colors.text.muted} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Orders will appear here when customers place them</Text>
            </View>
          ) : (
            orders.slice(0, 5).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('VendorOrderDetail', { orderId: order.id } as any)}
              >
                <View style={styles.orderCardLeft}>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString()}</Text>
                </View>
                <View style={styles.orderCardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status).bg }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status).text }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>₹{(order.total / 100).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    fontSize: typography.xl,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error.bg,
    borderRadius: radius.md,
  },
  logoutIcon: {},
  logoutText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.error.DEFAULT,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.warning.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning.DEFAULT,
  },
  pendingIcon: {},
  pendingText: {
    fontFamily: typography.sansMedium,
    fontSize: typography.md,
    color: colors.warning.dark,
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
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  viewAllText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.DEFAULT,
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
  actionIcon: {},
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyIcon: {},
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  orderCardLeft: {
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
  orderCardRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    textTransform: 'capitalize',
  },
  orderAmount: {
    fontFamily: typography.sansBold,
    fontSize: typography.md,
    color: colors.primary.dark,
  },
});