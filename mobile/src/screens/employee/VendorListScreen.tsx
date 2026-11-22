import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmployeeNavigationProp } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const VendorListScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const { vendors, fetchVendors, isLoading } = useEmployeeStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await fetchVendors();
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Available Vendors</Text>
          <Text style={styles.subtitle}>{vendors.length} approved vendors</Text>
        </View>

        {isLoading && vendors.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading vendors...</Text>
          </View>
        ) : vendors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront" size={48} color={colors.text.muted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No vendors available</Text>
            <Text style={styles.emptySubtitle}>Check back later for approved vendors</Text>
          </View>
        ) : (
          vendors.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={styles.vendorCard}
              onPress={() => navigation.navigate('VendorMenu', { vendorId: vendor.id, vendorName: vendor.businessName })}
            >
              <View style={[styles.vendorImage, styles.vendorImagePlaceholder]}>
                <Ionicons name="restaurant" size={32} color={colors.text.muted} />
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.businessName}</Text>
                <Text style={styles.vendorAddress}>{vendor.address?.street || ''} {vendor.address?.city}, {vendor.address?.state}</Text>
                <View style={styles.vendorMeta}>
                  <Text style={styles.vendorMenuCount}>{vendor.menuItemCount} items</Text>
                  {vendor.rating && <Text style={styles.vendorRating}>⭐ {vendor.rating.toFixed(1)}</Text>}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text.muted} style={styles.chevron} />
            </TouchableOpacity>
          ))
        )}
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
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
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
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
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
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  vendorImage: {
    width: 100,
    height: 100,
  },
  vendorImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  vendorInfo: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: 'center',
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
    flexWrap: 'wrap',
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
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});