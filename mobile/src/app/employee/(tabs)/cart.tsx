'use client';

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView, Alert } from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { employeeApi, CreateOrderInput } from '@/services/employee';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AppHeader } from '@/components/ui/AppHeader';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { CTAButton } from '@/components/ui/CTAButton';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.subtotal);
  const tax = useCartStore(state => state.tax);
  const total = useCartStore(state => state.total);
  const clearCart = useCartStore(state => state.clearCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  const checkoutMutation = useMutation({
    mutationFn: (data: CreateOrderInput) =>
      employeeApi.createOrder(data),
    onSuccess: (order) => {
      // employeeApi.createOrder returns the unwrapped CreateOrderResponse directly
      clearCart();
      router.push(`/employee/order-detail?id=${order.orderId}`);
    },
    onError: (error: any) => {
      Alert.alert('Checkout Failed', error.response?.data?.error?.message || error.message || 'Failed to create order. Please try again.');
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;
    const vendorId = items[0].vendorId;
    const pickupTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    checkoutMutation.mutate({
      vendorId,
      items: items.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      paymentMethod: 'Upi', // Backend enum expects capitalized 'Upi'/'Cash'
      pickupTime,
      specialInstructions: '',
    });
  };

  const renderItem = ({ item }: { item: typeof items[0] }) => (
    <View style={styles.cartItem} key={item.id}>
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🍛</Text>
          </View>
        )}
        <Badge variant={item.dietType === 'veg' ? 'veg' : item.dietType === 'non-veg' ? 'nonveg' : item.dietType === 'vegan' ? 'vegan' : 'gf'} size="sm" style={styles.dietBadge}>
          {item.dietType === 'veg' ? 'VEG' : item.dietType === 'non-veg' ? 'NON-VEG' : item.dietType.toUpperCase()}
        </Badge>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.quantitySection}>
        <QuantitySelector
          value={item.quantity}
          onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
          onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
          min={1}
          max={10}
          size="sm"
        />
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeItem(item.id)}
          activeOpacity={0.7}
          accessibilityLabel="Remove item"
        >
          <Ionicons name="trash-bin" size={18} color={colors.status.cancelled} />
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalLabel}>Total</Text>
        <Text style={styles.itemTotalValue}>{formatCurrency(item.price * item.quantity)}</Text>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Your Bag" showBack={false} showSearch={false} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyIcon}>🛍️</Text>
            </View>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptySubtext}>Explore restaurants and add items to get started</Text>
            <CTAButton onPress={() => router.replace('/employee/(tabs)/home')}>
              Explore Restaurants
            </CTAButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Your Bag" showBack={false} showSearch={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.contentContainer}>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={undefined}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          {/* Footer - Sticky at bottom */}
          <View style={styles.footer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <Text style={styles.summarySubtitle}>{items.length} items from {new Set(items.map(i => i.vendorId)).size} restaurant</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST (5%)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
                <Text style={[styles.summaryValue, styles.totalValue]}>{formatCurrency(total)}</Text>
              </View>

              <View style={styles.pickupNoteContainer}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} style={styles.pickupNoteIcon} />
                <Text style={styles.pickupNote}>Pickup from counter • No delivery fee</Text>
              </View>

              {items.length > 0 && (
                <CTAButton
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={clearCart}
                  disabled={checkoutMutation.isPending}
                  style={styles.clearCartBtn}
                >
                  Clear Bag
                </CTAButton>
              )}

              <CTAButton
                size="lg"
                fullWidth
                loading={checkoutMutation.isPending}
                onPress={handleCheckout}
                style={styles.checkoutBtn}
              >
                Proceed to Checkout • {formatCurrency(total)}
              </CTAButton>
              <Text style={styles.secureText}>🔒 Secure checkout via UPI or Cash on Pickup</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  list: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.lg + 20, // Safe area
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  cartItem: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
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
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  dietBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  itemPrice: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  removeBtn: {
    marginLeft: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.error.bg,
    borderWidth: 1,
    borderColor: colors.error.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 70,
    flexShrink: 0,
  },
  itemTotalLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemTotalValue: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  summaryCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  summaryHeader: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  summaryTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  summarySubtitle: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 15,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  totalValue: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.primary.DEFAULT,
  },
  pickupNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  pickupNoteIcon: {
    marginTop: 1,
  },
  pickupNote: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.success.DEFAULT,
    textAlign: 'center',
  },
  clearCartBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  checkoutBtn: {
    marginTop: spacing.sm,
  },
  secureText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 280,
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
    fontSize: 24,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});