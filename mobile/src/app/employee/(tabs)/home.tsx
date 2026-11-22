'use client';

import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { employeeApi } from '@/services/employee';
import { Skeleton } from '@/components/ui/Skeleton';
import { RestaurantCard } from '@/components/vendor/RestaurantCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { VendorListItemDto } from '@/services/employee';
import { Ionicons } from '@expo/vector-icons';

console.log('[EmployeeHome] Component mounted', { timestamp: Date.now() });

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => employeeApi.listVendors(),
    staleTime: 5 * 60 * 1000,
  });

  const vendors = data || [];
  const [refreshing, setRefreshing] = React.useState(false);

  console.log('[HomeScreen] Render:', { isLoading, isError, vendorsCount: vendors.length });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderVendor = ({ item }: { item: VendorListItemDto }) => (
    <RestaurantCard
      vendor={item}
      onPress={() => {
        console.log('[HomeScreen] Navigating to vendor detail:', item.id);
        router.push(`/employee/vendor-detail?id=${item.id}`);
      }}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      <Skeleton variant="rect" height={80} width={80} style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <Skeleton variant="text" height={20} width="60%" style={styles.skeletonTitle} />
        <Skeleton variant="text" height={12} width="40%" style={styles.skeletonSubtitle} />
        <Skeleton variant="text" height={12} width="80%" style={styles.skeletonMeta} />
      </View>
    </View>
  );

  const headerComponent = () => (
    <>
      <AppHeader
        title="FoodTech"
        subtitle="Corporate Dining"
        showBack={false}
        showSearch={true}
        showProfile={true}
      />
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.welcomeSection}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Good morning</Text>
              <View style={styles.greetingIcon}>
                <Ionicons name="sunny" size={24} color={colors.primary.DEFAULT} />
              </View>
            </View>
            <Text style={styles.welcomeSubtitle}>
              Discover dining options for your team
            </Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{vendors.length}</Text>
              <Text style={styles.statLabel}>Active Venues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.5+</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>Cuisines</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Featured Restaurant */}
      {vendors.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Today</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
          <RestaurantCard
            vendor={vendors[0]}
            onPress={() => router.push(`/employee/vendor-detail?id=${vendors[0].id}`)}
            style={styles.featuredCard}
          />
        </View>
      )}

      {/* All Restaurants Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Restaurants</Text>
        <Text style={styles.sectionSubtitle}>{vendors.length} venues available</Text>
      </View>
    </>
  );

  const footerComponent = () => (
    <View style={{ paddingBottom: 120 }} />
  );

  const renderItem = ({ item }: { item: VendorListItemDto | null }) => {
    if (!item) return renderSkeleton();
    return renderVendor({ item });
  };

  const dataToRender = isLoading
    ? Array(3).fill(null)
    : vendors.length === 0
    ? []
    : vendors;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dataToRender}
        renderItem={renderItem}
        keyExtractor={(item, index) => item ? item.id : `skeleton-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.DEFAULT]}
            progressBackgroundColor={colors.surface.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={
          isError ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
              </View>
              <Text style={styles.emptyTitle}>Failed to load restaurants</Text>
              <Text style={styles.emptySubtitle}>Pull to refresh or try again later</Text>
            </View>
          ) : vendors.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Text style={styles.emptyIcon}>🍽️</Text>
              </View>
              <Text style={styles.emptyTitle}>No restaurants available</Text>
              <Text style={styles.emptySubtitle}>Check back later for new dining options</Text>
            </View>
          ) : undefined
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
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.surface.DEFAULT,
  },
  heroContent: {
    gap: spacing.lg,
  },
  welcomeSection: {
    gap: spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    lineHeight: 36,
  },
  greetingIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: typography.sansBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.default,
  },
  featuredSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  featuredCard: {
    marginHorizontal: -spacing.lg,
    borderRadius: radius['2xl'],
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
  },
  skeletonImage: {
    borderRadius: radius.xl,
  },
  skeletonContent: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonTitle: {
    borderRadius: radius.sm,
  },
  skeletonSubtitle: {
    borderRadius: radius.sm,
  },
  skeletonMeta: {
    borderRadius: radius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
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
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});