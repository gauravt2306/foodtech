'use client';

import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendor';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietType: string;
  imageUrl?: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  tags: string[];
}

export default function VendorMenuScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['vendor-menu'],
    queryFn: () => vendorApi.listMenuItems(),
    staleTime: 30 * 1000,
  });

  const menuItems = data?.data?.data || [];
  const refreshing = isFetching;

  const handleRefresh = () => {
    refetch();
  };

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      vendorApi.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update availability';
      Alert.alert('Error', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to delete item';
      Alert.alert('Error', message);
    },
  });

  const handleToggleAvailability = (item: MenuItem) => {
    toggleAvailabilityMutation.mutate({ id: item.id, isAvailable: !item.isAvailable });
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
      ]
    );
  };

  const handleEdit = (item: MenuItem) => {
    router.push({
      pathname: '/vendor/menu-form',
      params: { id: item.id },
    });
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleEdit(item)}
      activeOpacity={0.85}
    >
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🍛</Text>
          </View>
        )}
        <Badge variant={item.dietType === 'veg' ? 'veg' : item.dietType === 'non-veg' ? 'nonveg' : item.dietType === 'vegan' ? 'vegan' : 'gf'}>
          {item.dietType === 'veg' ? 'VEG' : item.dietType === 'non-veg' ? 'NON-VEG' : item.dietType.toUpperCase()}
        </Badge>
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                item.isAvailable && styles.toggleBtnActive,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleAvailability(item);
              }}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.toggleBtnText,
                item.isAvailable && styles.toggleBtnTextActive,
              ]}>
                {item.isAvailable ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error.DEFAULT} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={1}>{item.description}</Text>

        <View style={styles.itemMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Prep Time</Text>
            <Text style={styles.metaValue}>{item.prepTimeMinutes} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.metaValue}>{formatCurrency(item.price)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={styles.menuItem}>
      <View style={styles.itemImageContainer}>
        <Skeleton variant="rect" height={72} width={72} style={styles.skeletonImage} />
      </View>
      <View style={styles.itemContent}>
        <Skeleton variant="rect" height={24} width="60%" style={styles.skeletonText} />
        <Skeleton variant="rect" height={16} width="80%" style={styles.skeletonText} />
        <Skeleton variant="rect" height={16} width="40%" style={styles.skeletonText} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <FlatList
          data={Array(5)}
          renderItem={renderSkeleton}
          keyExtractor={(_, i) => `skeleton-${i}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.skeletonText}>Loading menu...</Text></View>}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
        <Text style={styles.emptyTitle}>Failed to load menu</Text>
        <Text style={styles.emptySubtext}>Pull to refresh</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🍽️</Text>
            <Text style={styles.emptyTitle}>No menu items yet</Text>
            <Text style={styles.emptySubtext}>Add your first item to get started</Text>
            <Button variant="primary" onPress={() => router.push('/vendor/menu-form')} style={styles.addBtn}>
              Add Menu Item
            </Button>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/vendor/menu-form')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.primary.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  menuItem: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  itemImageContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.DEFAULT,
  },
  toggleBtnActive: {
    backgroundColor: colors.successLight,
    borderColor: colors.success.DEFAULT,
  },
  toggleBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleBtnTextActive: {
    color: colors.success.DEFAULT,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  itemDescription: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  metaItem: {
    gap: spacing.xs,
  },
  metaLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.text.primary,
  },
  skeletonImage: {
    borderRadius: radius.lg,
  },
  skeletonText: {
    borderRadius: radius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  addBtn: {
    marginTop: spacing.lg,
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snacks: 'Snacks',
    beverages: 'Beverages',
    dinner: 'Dinner',
  };
  return labels[category] || category;
}