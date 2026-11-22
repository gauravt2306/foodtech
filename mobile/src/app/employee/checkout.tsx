'use client';

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { employeeApi, CreateOrderInput } from '@/services/employee';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';
import { CTAButton } from '@/components/ui/CTAButton';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, radius, typography } from '@/constants/colors';

const PICKUP_OPTIONS = [
  { value: 'ASAP', label: 'ASAP', sublabel: 'Ready in ~15 minutes' },
  { value: '15min', label: '15 minutes', sublabel: '' },
  { value: '30min', label: '30 minutes', sublabel: '' },
  { value: '45min', label: '45 minutes', sublabel: '' },
  { value: '1hour', label: '1 hour', sublabel: '' },
] as const;

const PAYMENT_METHODS = [
  { value: 'Upi', label: 'UPI', sublabel: 'Google Pay, PhonePe, Paytm', icon: '📱' },
  { value: 'Cash', label: 'Cash on Pickup', sublabel: 'Pay at the counter', icon: '💵' },
] as const;

export default function CheckoutScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, subtotal, tax, deliveryFee, total, clearCart } = useCartStore();

  const [pickupTime, setPickupTime] = React.useState<typeof PICKUP_OPTIONS[number]['value']>('ASAP');
  const [paymentMethod, setPaymentMethod] = React.useState<typeof PAYMENT_METHODS[number]['value']>('Upi');
  const [specialInstructions, setSpecialInstructions] = React.useState('');
  const [upiId, setUpiId] = React.useState('');

  const vendorId = items[0]?.vendorId || '';

  const checkoutMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => employeeApi.createOrder(data),
    onSuccess: (order) => {
      // employeeApi.createOrder returns the unwrapped CreateOrderResponse directly
      if (paymentMethod === 'Upi') {
        router.push(`/employee/payment?orderId=${order.orderId}&amount=${order.total}&orderNumber=${order.orderNumber}`);
      } else {
        router.push(`/employee/order-detail?id=${order.orderId}`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || error.response?.data?.errorInfo?.Message || error.message || 'Failed to create order. Please try again.';
      Alert.alert('Checkout Failed', message);
    },
  });

  const handlePlaceOrder = () => {
    if (items.length === 0 || !vendorId) return;
    checkoutMutation.mutate({
      vendorId,
      items: items.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      paymentMethod,
      pickupTime,
      specialInstructions: specialInstructions.trim(),
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Checkout" showBack={true} showSearch={false} showProfile={false} />
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Text style={styles.emptyIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to proceed to checkout</Text>
          <CTAButton onPress={() => router.replace('/employee/(tabs)/home')}>Browse Restaurants</CTAButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={88}
    >
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Checkout" showBack={true} showSearch={false} showProfile={false} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroGradient} />
            <View style={styles.heroContent}>
              <View style={styles.heroIconWrapper}>
                <Ionicons name="bag-handle" size={28} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.heroTitle}>Review Your Order</Text>
              <Text style={styles.heroSubtitle}>{items.length} items from {new Set(items.map(i => i.vendorId)).size} restaurant</Text>
            </View>
          </View>

          {/* Order Items Summary */}
          <Card style={styles.itemsCard} padding="md">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
            </View>
            {items.map(item => (
              <View key={item.id} style={styles.orderItemRow}>
                <View style={styles.itemImageContainer}>
                  {item.imageUrl ? (
                    <View style={styles.itemImage}>
                      <Text style={styles.placeholderText}>🍛</Text>
                    </View>
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>🍛</Text>
                    </View>
                  )}
                  <Badge variant={item.dietType === 'veg' ? 'veg' : item.dietType === 'non-veg' ? 'nonveg' : item.dietType === 'vegan' ? 'vegan' : 'gf'} size="sm" style={styles.dietBadge}>
                    {item.dietType === 'veg' ? 'VEG' : item.dietType === 'non-veg' ? 'NON-VEG' : item.dietType.toUpperCase()}
                  </Badge>
                </View>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.orderItemMeta}>
                    <Text style={styles.orderItemQty}>{item.quantity} × {formatCurrency(item.price)}</Text>
                  </View>
                </View>
                <Text style={styles.orderItemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </Card>

          {/* Pickup Time */}
          <Card style={styles.sectionCard} padding="md">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pickup Time</Text>
            </View>
            <View style={styles.pickupOptions}>
              {PICKUP_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickupOption,
                    pickupTime === option.value && styles.pickupOptionSelected,
                  ]}
                  onPress={() => setPickupTime(option.value)}
                >
                  <View style={styles.pickupOptionContent}>
                    <Text style={styles.pickupOptionLabel}>{option.label}</Text>
                    {option.sublabel && <Text style={styles.pickupOptionSublabel}>{option.sublabel}</Text>}
                  </View>
                  <View style={[
                    styles.pickupRadio,
                    pickupTime === option.value && styles.pickupRadioSelected,
                  ]} />
                  {pickupTime === option.value && (
                    <View style={styles.pickupRadioInner} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Payment Method */}
          <Card style={styles.sectionCard} padding="md">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            <View style={styles.paymentOptions}>
              {PAYMENT_METHODS.map(method => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method.value && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod(method.value)}
                >
                  <View style={styles.paymentIconWrapper}>
                    <Text style={styles.paymentIcon}>{method.icon}</Text>
                  </View>
                  <View style={styles.paymentOptionContent}>
                    <Text style={styles.paymentOptionLabel}>{method.label}</Text>
                    <Text style={styles.paymentOptionSublabel}>{method.sublabel}</Text>
                  </View>
                  <View style={[
                    styles.paymentRadio,
                    paymentMethod === method.value && styles.paymentRadioSelected,
                  ]} />
                  {paymentMethod === method.value && (
                    <View style={styles.paymentRadioInner} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* UPI ID Input (only for UPI) */}
          {paymentMethod === 'Upi' && (
            <Card style={styles.sectionCard} padding="md">
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>UPI ID</Text>
              </View>
              <TextInput
                style={styles.upiInput}
                placeholder="Enter UPI ID (e.g., name@upi)"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                autoComplete="off"
                returnKeyType="done"
              />
              <View style={styles.upiHintContainer}>
                <Ionicons name="information-circle" size={14} color={colors.primary.DEFAULT} style={styles.upiHintIcon} />
                <Text style={styles.upiHint}>{"We'll redirect you to complete the payment after order placement"}</Text>
              </View>
            </Card>
          )}

          {/* Special Instructions */}
          <Card style={styles.sectionCard} padding="md">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
            </View>
            <TextInput
              style={styles.instructionsInput}
              placeholder="e.g., No onions, extra spicy, etc."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>

          {/* Price Summary */}
          <Card style={styles.summaryCard} padding="lg">
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.pickupNoteContainer}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success.DEFAULT} style={styles.pickupNoteIcon} />
                <Text style={styles.pickupNote}>Pickup from counter • No delivery fee</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
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
          </Card>

          {/* Place Order Button */}
          <View style={styles.checkoutSection}>
            <CTAButton
              size="lg"
              fullWidth
              loading={checkoutMutation.isPending}
              onPress={handlePlaceOrder}
            >
              Place Order • {formatCurrency(total)}
            </CTAButton>
            <Text style={styles.secureText}>🔒 Secure checkout • Your order will be confirmed instantly</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 140,
    gap: spacing.lg,
  },
  heroSection: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  heroTitle: {
    fontFamily: typography.sansBold,
    fontSize: 24,
    color: colors.text.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  itemsCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  itemImageContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 1,
  },
  orderItemInfo: {
    flex: 1,
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    minWidth: 0,
  },
  orderItemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  orderItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderItemQty: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  orderItemTotal: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.text.primary,
    minWidth: 70,
    textAlign: 'right',
  },
  sectionCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  pickupOptions: {
    gap: spacing.sm,
  },
  pickupOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pickupOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
  },
  pickupOptionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  pickupOptionLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  pickupOptionSublabel: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  pickupRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupRadioSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  pickupRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  paymentOptions: {
    gap: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  paymentOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
  },
  paymentIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  paymentIcon: {
    fontSize: 22,
  },
  paymentOptionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentOptionLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  paymentOptionSublabel: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  paymentRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRadioSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  paymentRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  upiInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: typography.sans,
  },
  upiHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  upiHintIcon: {
    marginTop: 1,
  },
  upiHint: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  instructionsInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: typography.sans,
    minHeight: 80,
  },
  summaryCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  pickupNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.success.DEFAULT,
  },
  pickupNoteIcon: {
    marginTop: 1,
  },
  pickupNote: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.success.DEFAULT,
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
  checkoutSection: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secureText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
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