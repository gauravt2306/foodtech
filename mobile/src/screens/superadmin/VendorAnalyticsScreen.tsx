import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, FlatList, TextInput, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SuperAdminNavigationProp } from '@/navigation/types';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const VendorAnalyticsScreen = () => {
  const navigation = useNavigation<SuperAdminNavigationProp>();
  const { vendorAnalytics, fetchVendorAnalytics, isLoading } = useSuperAdminStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [from, to] = getDateRange(selectedPeriod);
      await fetchVendorAnalytics({ from, to });
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

  const filteredVendors = vendorAnalytics?.vendors?.filter(vendor =>
    vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading && !vendorAnalytics) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  const vendors = filteredVendors;
  const vendorList = vendorAnalytics?.vendors || [];
  const totalVendors = vendorList.length;
  const totalOrders = vendorList.reduce((sum, v) => sum + v.totalOrders, 0);
  const totalRevenue = vendorList.reduce((sum, v) => sum + v.totalRevenue, 0);
  const avgRating = vendorList.reduce((sum, v) => sum + v.rating, 0) / (totalVendors || 1) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.role.superadmin.border]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vendor Analytics</Text>
          <Text style={styles.subtitle}>Vendor performance and engagement metrics</Text>
        </View>

        {/* Search & Period Selector */}
        <View style={styles.section}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search vendors..."
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
            />
          </View>
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

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: colors.role.superadmin.border }]}>
            <Ionicons name="storefront" size={24} color={colors.role.superadmin.text} style={styles.statIcon} />
            <Text style={styles.statValue}>{totalVendors}</Text>
            <Text style={styles.statLabel}>Total Vendors</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="bag-handle" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.success.DEFAULT }]}>
            <Ionicons name="cash" size={24} color={colors.success.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>₹{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.info.DEFAULT }]}>
            <Ionicons name="star" size={24} color={colors.info.DEFAULT} style={styles.statIcon} />
            <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Vendor List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vendor Performance</Text>
            <Text style={styles.vendorCount}>{vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</Text>
          </View>

          {vendors.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront" size={40} color={colors.text.muted} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No vendors found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'No vendor data available for this period'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={vendors}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vendorItem}
                  onPress={() => Alert.alert(item.businessName, `Total Orders: ${item.totalOrders}\nTotal Revenue: ₹${item.totalRevenue.toFixed(2)}\nRating: ${item.rating.toFixed(1)}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.vendorAvatar, styles.vendorAvatarPlaceholder]}>
                      <Ionicons name="storefront" size={24} color={colors.text.muted} style={styles.avatarPlaceholder} />
                    </View>
                  <View style={styles.vendorInfo}>
                    <View style={styles.vendorNameRow}>
                      <Text style={styles.vendorName}>{item.businessName}</Text>
                    </View>
                    <View style={styles.vendorStats}>
                      <View style={styles.vendorStat}>
                        <Text style={styles.vendorStatValue}>{item.totalOrders}</Text>
                        <Text style={styles.vendorStatLabel}>Orders</Text>
                      </View>
                      <View style={styles.vendorStat}>
                        <Text style={styles.vendorStatValue}>₹{item.totalRevenue.toFixed(0)}</Text>
                        <Text style={styles.vendorStatLabel}>Revenue</Text>
                      </View>
                      <View style={styles.vendorStat}>
                        <Text style={styles.vendorStatValue}>
                          {item.rating ? item.rating.toFixed(1) : '—'}
                        </Text>
                        <Text style={styles.vendorStatLabel}>Rating</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.vendorId}
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.primary,
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
    backgroundColor: colors.role.superadmin.border,
    borderColor: colors.role.superadmin.border,
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
  vendorCount: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    gap: spacing.md,
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
  vendorItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  vendorAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
  },
  vendorAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {},
  vendorInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  vendorNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
    flex: 1,
  },
  vendorStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  vendorStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  vendorStatValue: {
    fontFamily: typography.sansBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  vendorStatLabel: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.xs,
  },
});