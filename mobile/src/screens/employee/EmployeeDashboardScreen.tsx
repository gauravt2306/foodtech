import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmployeeNavigationProp } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const EmployeeDashboardScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const { user, logout } = useAuthStore();
  const { vendors, fetchVendors, orders, fetchOrders, isLoading } = useEmployeeStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await Promise.all([fetchVendors(), fetchOrders()]);
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

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const activeOrders = orders.filter(o => o.status === 'preparing' || o.status === 'ready').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>Employee</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: colors.warning.DEFAULT }]}>
          <Text style={[styles.statIcon, { color: colors.warning.DEFAULT }]}>⏳</Text>
          <Text style={styles.statValue}>{pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
        <View style={[styles.statCard, { borderColor: colors.info.DEFAULT }]}>
          <Text style={[styles.statIcon, { color: colors.info.DEFAULT }]}>👨‍🍳</Text>
          <Text style={styles.statValue}>{activeOrders}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
        <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
          <Text style={[styles.statIcon, { color: colors.success.DEFAULT }]}>✅</Text>
          <Text style={styles.statValue}>{completedOrders}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { borderColor: colors.primary.DEFAULT }]}>
          <Text style={[styles.statIcon, { color: colors.primary.DEFAULT }]}>💰</Text>
          <Text style={styles.statValue}>₹{(totalSpent / 100).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: colors.primary.DEFAULT }]}
            onPress={() => navigation.navigate('VendorList')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary.DEFAULT }]}>🏪</Text>
            <Text style={styles.actionTitle}>Browse Vendors</Text>
            <Text style={styles.actionSubtitle}>{vendors.length} approved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: colors.info.DEFAULT }]}
            onPress={() => navigation.navigate('EmployeeOrders')}
          >
            <Text style={[styles.actionIcon, { color: colors.info.DEFAULT }]}>📦</Text>
            <Text style={styles.actionTitle}>My Orders</Text>
            <Text style={styles.actionSubtitle}>{orders.length} total</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: colors.role.superadmin.border }]}
            onPress={() => navigation.navigate('VendorList')}
          >
            <Text style={[styles.actionIcon, { color: colors.role.superadmin.text }]}>🍽️</Text>
            <Text style={styles.actionTitle}>Order Food</Text>
            <Text style={styles.actionSubtitle}>Place new order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#EC4899' }]}
            onPress={() => navigation.navigate('EmployeeOrders')}
          >
            <Text style={[styles.actionIcon, { color: '#EC4899' }]}>📱</Text>
            <Text style={styles.actionTitle}>QR Codes</Text>
            <Text style={styles.actionSubtitle}>View active QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Vendors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Vendors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VendorList')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {vendors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>No vendors available</Text>
            <Text style={styles.emptySubtitle}>Check back later for approved vendors</Text>
          </View>
        ) : (
          vendors.slice(0, 3).map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={styles.vendorCard}
              onPress={() => navigation.navigate('VendorMenu', { vendorId: vendor.id, vendorName: vendor.businessName })}
            >
              {vendor.imageUrl && (
                <Image source={{ uri: vendor.imageUrl }} style={styles.vendorImage} />
              )}
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.businessName}</Text>
                <Text style={styles.vendorAddress}>{vendor.address?.city}, {vendor.address?.state}</Text>
                <View style={styles.vendorMeta}>
                  <Text style={styles.vendorMenuCount}>🍽️ {vendor.menuItemCount} items</Text>
                  {vendor.rating && (
                    <Text style={styles.vendorRating}>⭐ {vendor.rating.toFixed(1)}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EmployeeOrders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
          </View>
        ) : (
          orders.slice(0, 3).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('EmployeeOrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderCardLeft}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <Text style={styles.orderVendor}>{order.vendor?.businessName || 'Unknown Vendor'}</Text>
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
    fontSize: typography['2xl'],
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
    fontSize: 24,
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
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    gap: spacing.xs,
    ...shadows.md,
  },
  actionIcon: {
    fontSize: 28,
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
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
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
  },
  vendorInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  vendorAddress: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  vendorMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  vendorMenuCount: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  vendorRating: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.warning.DEFAULT,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.muted,
    alignSelf: 'center',
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
  orderVendor: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  orderCardRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
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
    color: colors.success.DEFAULT,
  },
});