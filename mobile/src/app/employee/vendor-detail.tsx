'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, RefreshControl, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { employeeApi, MenuItem } from '@/services/employee';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { CTAButton } from '@/components/ui/CTAButton';
import { colors, spacing, radius, typography } from '@/constants/colors';

const CATEGORIES = [
  { key: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { key: 'lunch', label: 'Lunch', icon: '🍽️' },
  { key: 'snacks', label: 'Snacks', icon: '🍿' },
  { key: 'beverages', label: 'Beverages', icon: '☕' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

interface SectionData {
  title: string;
  data: MenuItem[];
  key: CategoryKey;
}

function MenuItemComponent({ item, onPress, onAdd }: { item: MenuItem; onPress: () => void; onAdd: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.menuItemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.menuItemImage} />
        ) : (
          <View style={[styles.menuItemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🍛</Text>
          </View>
        )}
        <Badge
          variant={item.dietType === 'veg' ? 'veg' : item.dietType === 'non-veg' ? 'nonveg' : item.dietType === 'vegan' ? 'vegan' : 'gf'}
          size="sm"
          style={styles.dietBadge}
        >
          {item.dietType === 'veg' ? 'VEG' : item.dietType === 'non-veg' ? 'NON-VEG' : item.dietType.toUpperCase()}
        </Badge>
        {!item.isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.menuItemMeta}>
            <Text style={styles.menuItemPrep}>
              <Ionicons name="time" size={12} color={colors.text.tertiary} />
              {item.prepTimeMinutes} min
            </Text>
            {item.tags.length > 0 && (
              <Text style={styles.menuItemTag}>{item.tags[0]}</Text>
            )}
          </View>
        </View>
        <CTAButton
          size="sm"
          onPress={onAdd}
          disabled={!item.isAvailable}
          fullWidth
        >
          Add
        </CTAButton>
      </View>
    </TouchableOpacity>
  );
}

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vendorMenu', id],
    queryFn: () => employeeApi.getVendorMenu(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const vendorData = data;
  const vendor = vendorData ? {
    id: vendorData.vendorId,
    businessName: vendorData.businessName,
    rating: vendorData.rating,
    menuItemCount: vendorData.menuItems?.length || 0,
    operatingHours: vendorData.operatingHours,
    address: vendorData.address,
    imageUrl: vendorData.imageUrl,
    cuisineType: vendorData.cuisineType,
  } : null;
  const menuItems = vendorData?.menuItems || [];
  const menu = menuItems.reduce((acc: Record<CategoryKey, MenuItem[]>, item: MenuItem) => {
    const cat = item.category.toLowerCase() as CategoryKey;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<CategoryKey, MenuItem[]>);
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryKey>('breakfast');
  const [refreshing, setRefreshing] = React.useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async (item: { item: MenuItem; uniqueId: string }) => {
      addItem({
        id: item.uniqueId,
        menuItemId: item.item.id,
        vendorId: vendor?.id || id!,
        name: item.item.name,
        price: item.item.price,
        quantity: 1,
        dietType: item.item.dietType,
        imageUrl: item.item.imageUrl,
      });
      return item.item.name;
    },
    onSuccess: (itemName) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast(`${itemName} added to bag`, 'success');
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const idCounter = React.useRef(0);

  const handleAddToCart = (item: MenuItem) => {
    idCounter.current += 1;
    const uniqueId = `${item.id}-${idCounter.current}`;
    addToCartMutation.mutate({ item, uniqueId });
  };

  // Build sections for SectionList
  const sections: SectionData[] = React.useMemo(() => {
    return CATEGORIES.map(cat => ({
      key: cat.key,
      title: cat.label,
      data: menu[cat.key] || [],
    })).filter(section => section.data.length > 0);
  }, [menu]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Loading..." showBack={true} />
        <View style={styles.scrollContent}>
          <Skeleton variant="card" height={200} style={styles.skeletonVendor} />
          {CATEGORIES.map(cat => (
            <View key={cat.key} style={styles.categorySection}>
              <Skeleton variant="text" height={24} style={styles.skeletonCategory} />
              <View style={styles.menuList}>
                {Array(3).fill(null).map((_, i) => (
                  <Skeleton key={`skeleton-${cat.key}-${i}`} variant="rect" height={140} style={styles.skeletonItem} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Error" showBack={true} />
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Text style={styles.emptyText}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Failed to load restaurant</Text>
          <Text style={styles.emptySubtext}>Pull to refresh or go back</Text>
          <CTAButton size="sm" onPress={() => router.back()}>Go Back</CTAButton>
        </View>
      </SafeAreaView>
    );
  }

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: MenuItem }) => (
    <MenuItemComponent
      item={item}
      onPress={() => {}}
      onAdd={() => handleAddToCart(item)}
    />
  );

  const listHeader = (
    <View style={styles.listHeader}>
      {/* Hero Image */}
      <View style={styles.heroImageContainer}>
        <Image
          source={{
            uri: vendor.imageUrl || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient} />
        <View style={styles.heroContent}>
          <View style={styles.vendorBadge}>
            <Text style={styles.vendorBadgeText}>{vendor.cuisineType || 'Multi-Cuisine'}</Text>
          </View>
          <Text style={styles.heroName}>{vendor.businessName}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="star" size={14} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} />
              <Text style={styles.heroMetaText}>{vendor.rating?.toFixed(1) || '4.5'}</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="restaurant" size={14} color={colors.text.tertiary} />
              <Text style={styles.heroMetaText}>{vendor.menuItemCount || 0} items</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="location" size={14} color={colors.text.tertiary} />
              <Text style={styles.heroMetaText}>
                {vendor.address?.city}, {vendor.address?.state}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Operating Hours & Address Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="time" size={20} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Operating Hours</Text>
            <Text style={styles.infoValue}>
              {vendor.operatingHours?.open || '08:00'} - {vendor.operatingHours?.close || '22:00'}
            </Text>
          </View>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="location" size={20} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {vendor.address?.street}, {vendor.address?.city} - {vendor.address?.zipCode}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryTab,
              selectedCategory === cat.key && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryLabel,
              selectedCategory === cat.key && styles.categoryLabelActive,
            ]}>
              {cat.label}
            </Text>
            <View
              style={[
                styles.categoryIndicator,
                selectedCategory === cat.key && styles.categoryIndicatorActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={vendor.businessName}
        showBack={true}
        showSearch={false}
        showProfile={false}
      />
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyText}>🍽️</Text>
            </View>
            <Text style={styles.emptyTitle}>Menu not available</Text>
            <Text style={styles.emptySubtext}>{`This restaurant hasn't added any items yet`}</Text>
          </View>
        }
        contentContainerStyle={styles.sectionListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} progressBackgroundColor={colors.surface.DEFAULT} />
        }
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  listHeader: {
    backgroundColor: colors.surface.DEFAULT,
  },
  sectionListContent: {
    paddingBottom: 140,
  },
  heroImageContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlay,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  vendorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  vendorBadgeText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroName: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    lineHeight: 36,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.xs,
  },
  heroMetaText: {
    fontFamily: typography.sansMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  infoCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.md,
  },
  categoryTabs: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  categoryLabelActive: {
    color: colors.primary.DEFAULT,
  },
  categoryIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border.default,
  },
  categoryIndicatorActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  menuItem: {
    width: '48%',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  menuItemImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: colors.surfaceVariant,
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
  },
  dietBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontFamily: typography.sansSemiBold,
    color: colors.text.tertiary,
    fontSize: 14,
  },
  menuItemContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  menuItemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  menuItemDesc: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  menuItemPrice: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemPrep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  menuItemTag: {
    fontFamily: typography.sansSemiBold,
    fontSize: 10,
    color: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  emptyCategory: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
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
  emptyText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  skeletonVendor: {
    margin: spacing.lg,
    borderRadius: radius['2xl'],
  },
  skeletonCategory: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    width: '30%',
    borderRadius: radius.sm,
  },
  skeletonItem: {
    margin: spacing.sm,
    borderRadius: radius['2xl'],
    width: '47%',
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  menuList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
});