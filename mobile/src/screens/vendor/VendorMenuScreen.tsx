import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VendorNavigationProp } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { Category, DietType } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const VendorMenuScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const { menuItems, fetchMenu, createMenuItem, deleteMenuItem, isLoading, error } = useVendorStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await fetchMenu();
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

  const handleDelete = (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMenuItem(itemId),
        },
      ]
    );
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'appetizer': return colors.warning.DEFAULT;
      case 'main': return colors.primary.DEFAULT;
      case 'dessert': return colors.error.DEFAULT; // Use error (red/pink) for dessert
      case 'beverage': return colors.info.DEFAULT;
      case 'side': return colors.primary.dark; // Use primary dark for side
      default: return colors.text.muted;
    }
  };

  const getDietTypeLabel = (dietType: DietType) => {
    switch (dietType) {
      case 'vegetarian': return 'Veg';
      case 'vegan': return 'Vegan';
      case 'gluten_free': return 'GF';
      case 'dairy_free': return 'DF';
      case 'halal': return 'Halal';
      case 'none': return '';
      default: return '';
    }
  };

  const getDietTypeColor = (dietType: DietType) => {
    switch (dietType) {
      case 'vegetarian': return { bg: colors.success.bg, text: colors.success.dark };
      case 'vegan': return { bg: colors.primaryLight, text: colors.primary.dark };
      case 'gluten_free': return { bg: colors.warning.bg, text: colors.warning.dark };
      case 'dairy_free': return { bg: colors.error.bg, text: colors.error.dark };
      case 'halal': return { bg: colors.info.bg, text: colors.info.dark };
      default: return { bg: colors.background.secondary, text: colors.text.muted };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Menu Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MenuItemCreate') as any}
          >
            <Ionicons name="add" size={18} color={colors.primary.foreground} style={styles.addButtonIcon} />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={48} color={colors.text.muted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No menu items yet</Text>
            <Text style={styles.emptySubtitle}>Add your first menu item to get started</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={() => navigation.navigate('MenuItemCreate') as any}>
              <Text style={styles.emptyActionText}>Add Menu Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate('MenuItemEdit', { itemId: item.id } as any)}
              >
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Ionicons name="fast-food" size={32} color={colors.text.muted} />
                </View>
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                  {item.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                  )}
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemPrice}>₹{(item.price / 100).toFixed(2)}</Text>
                    <View style={styles.itemTags}>
                      {getDietTypeLabel(item.dietType) && (
                        <View style={[styles.dietTag, { backgroundColor: getDietTypeColor(item.dietType).bg }]}>
                          <Text style={[styles.dietTagText, { color: getDietTypeColor(item.dietType).text }]}>
                            {getDietTypeLabel(item.dietType)}
                          </Text>
                        </View>
                      )}
                      {item.prepTimeMinutes > 0 && (
                        <View style={styles.prepTag}>
                          <Ionicons name="time" size={12} color={colors.primary.DEFAULT} style={styles.prepTagIcon} />
                          <Text style={styles.prepTagText}>{item.prepTimeMinutes} min</Text>
                        </View>
                      )}
                      {item.tags?.length > 0 && (
                        <View style={styles.tagsTag}>
                          <Text style={styles.tagsTagText}>{item.tags.slice(0, 2).join(', ')}{item.tags.length > 2 ? '...' : ''}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemFooter}>
                    <TouchableOpacity
                      style={[styles.availabilityToggle, item.isAvailable && styles.availabilityToggleActive]}
                      onPress={() => createMenuItem({ ...item, isAvailable: !item.isAvailable } as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.availabilityText}>{item.isAvailable ? 'Available' : 'Unavailable'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id, item.name)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash" size={18} color={colors.error.DEFAULT} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.md,
  },
  addButtonIcon: {},
  addButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
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
    marginBottom: spacing.lg,
  },
  emptyAction: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.md,
  },
  emptyActionText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  menuList: {
    gap: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadows.md,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  itemContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  categoryText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.primary.foreground,
    textTransform: 'capitalize',
  },
  itemDescription: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  itemPrice: {
    fontFamily: typography.sansBold,
    fontSize: typography.md,
    color: colors.primary.dark,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dietTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  dietTagText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
  },
  prepTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.info.bg,
    borderRadius: radius.full,
  },
  prepTagIcon: {},
  prepTagText: {
    fontFamily: typography.sansMedium,
    fontSize: typography.xs,
    color: colors.info.dark,
  },
  tagsTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
  },
  tagsTagText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  availabilityToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  availabilityToggleActive: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.DEFAULT,
  },
  availabilityText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});