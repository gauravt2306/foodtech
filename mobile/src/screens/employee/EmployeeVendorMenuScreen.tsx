import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { EmployeeNavigationProp, EmployeeStackParamList } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { useCartStore } from '@/store/cartStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// Type for VendorMenu route params
type VendorMenuRouteProp = RouteProp<EmployeeStackParamList, 'VendorMenu'>;

export const EmployeeVendorMenuScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const route = useRoute<VendorMenuRouteProp>();
  const { currentVendorMenu, fetchVendorMenu, isLoading } = useEmployeeStore();
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      await fetchVendorMenu(route.params.vendorId);
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => clearCart();
  }, [route.params.vendorId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async (item: any) => {
    try {
      addItem({
        id: `cart-${item.id}-${Date.now()}`,
        vendorId: route.params.vendorId,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        dietType: item.dietType
      });
    } catch (error: any) {
      // Error handled by store
    }
  };

  const handleUpdateQuantity = async (item: any, delta: number) => {
    const currentQty = getItemQuantity(item.id);
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      try {
        removeItem(item.id);
      } catch (error: any) {
        // Error handled by store
      }
    } else {
      try {
        updateQuantity(item.id, newQty);
      } catch (error: any) {
        // Error handled by store
      }
    }
  };

  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.vendorName}>{route.params.vendorName}</Text>
        </View>

        {isLoading && currentVendorMenu.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : currentVendorMenu.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={48} color={colors.text.muted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No menu items available</Text>
            <Text style={styles.emptySubtitle}>This vendor hasn't added any items yet</Text>
          </View>
        ) : (
          currentVendorMenu.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                <Ionicons name="fast-food" size={32} color={colors.text.muted} />
              </View>
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemTags}>
                    {getDietTypeLabel(item.dietType) && (
                      <Text style={[styles.tag, { backgroundColor: getDietTypeColor(item.dietType).bg, color: getDietTypeColor(item.dietType).text }]}>
                        {getDietTypeLabel(item.dietType)}
                      </Text>
                    )}
                    {item.tags?.map((tag: string) => (
                      <Text key={tag} style={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                </View>
                {item.description && (
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>₹{(item.price / 100).toFixed(2)}</Text>
                  {item.isAvailable ? (
                    <View style={styles.quantityControl}>
                      {getItemQuantity(item.id) > 0 ? (
                        <>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleUpdateQuantity(item, -1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.qtyButtonText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{getItemQuantity(item.id)}</Text>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleUpdateQuantity(item, 1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(item)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addButtonText}>+ Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartBarInfo}>
            <Text style={styles.cartBarItems}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
            <Text style={styles.cartBarTotal}>₹{(cartTotal / 100).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('OrderCreate', { vendorId: route.params.vendorId, vendorName: route.params.vendorName } as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const getDietTypeLabel = (dietType: string) => {
  switch (dietType) {
    case 'vegetarian': return 'Veg';
    case 'vegan': return 'Vegan';
    case 'gluten_free': return 'GF';
    case 'dairy_free': return 'DF';
    case 'halal': return 'Halal';
    default: return '';
  }
};

const getDietTypeColor = (dietType: string) => {
  switch (dietType) {
    case 'vegetarian': return { bg: colors.success.bg, text: colors.success.dark };
    case 'vegan': return { bg: colors.primaryLight, text: colors.primary.dark };
    case 'gluten_free': return { bg: colors.warning.bg, text: colors.warning.dark };
    case 'dairy_free': return { bg: colors.error.bg, text: colors.error.dark };
    case 'halal': return { bg: colors.info.bg, text: colors.info.dark };
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  vendorName: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
    flex: 1,
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
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  itemImage: {
    width: 90,
    height: 90,
  },
  itemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  itemInfo: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
    flex: 1,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  itemDescription: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.primary.dark,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.primary.foreground,
    lineHeight: 24,
  },
  qtyValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.md,
  },
  addButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.primary.foreground,
  },
  unavailableText: {
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
    color: colors.error.dark,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    ...shadows.lg,
  },
  cartBarInfo: {
    gap: spacing.xs,
  },
  cartBarItems: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  cartBarTotal: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.success.DEFAULT,
  },
  checkoutButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.lg,
  },
  checkoutButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
});