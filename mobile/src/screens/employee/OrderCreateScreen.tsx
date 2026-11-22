import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { EmployeeNavigationProp, EmployeeStackParamList } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { useCartStore } from '@/store/cartStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// Type for OrderCreate route params
type OrderCreateRouteProp = RouteProp<EmployeeStackParamList, 'OrderCreate'>;

export const OrderCreateScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const route = useRoute<OrderCreateRouteProp>();
  const { createOrder, placeOrder, isLoading } = useEmployeeStore();
  const { items: cartItems, clearCart } = useCartStore();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Upi' | 'Cash'>('Upi');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<{ deliveryAddress?: string; upiId?: string }>({});

  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05); // 5% tax
  const deliveryFee = 0; // Pickup from counter - no delivery fee
  const total = subtotal + taxAmount + deliveryFee;

  const validateForm = () => {
    const newErrors: { deliveryAddress?: string; upiId?: string } = {};
    if (!deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
    if (paymentMethod === 'Upi' && !upiId.trim()) newErrors.upiId = 'UPI ID is required for UPI payment';
    else if (paymentMethod === 'Upi' && !upiId.includes('@')) newErrors.upiId = 'Invalid UPI ID format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      const orderData = {
        vendorId: route.params.vendorId,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        deliveryAddress,
        notes: notes.trim() || undefined,
        paymentMethod,
        upiId: paymentMethod === 'Upi' ? upiId.trim() : undefined,
      };

      const order = await createOrder(orderData);
      await placeOrder(order.id, { paymentMethod, upiId: paymentMethod === 'Upi' ? upiId.trim() : undefined });
      clearCart();
      navigation.goBack();
    } catch (error: any) {
      // Error handled by store
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="bag-handle" size={48} color={colors.text.muted} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from the menu first</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back to Menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Text style={styles.summaryItemName}>{item.name}</Text>
                <Text style={styles.summaryItemQty}>Qty: {item.quantity} × ₹{(item.price || 0) / 100}</Text>
              </View>
              <Text style={styles.summaryItemTotal}>₹{((item.price || 0) * item.quantity / 100).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({totalItems} items)</Text>
              <Text style={styles.priceValue}>₹{(subtotal / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (5%)</Text>
              <Text style={styles.priceValue}>₹{(taxAmount / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>₹{(deliveryFee / 100).toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={[styles.priceLabel, styles.priceTotalLabel]}>Total</Text>
              <Text style={[styles.priceValue, styles.priceTotalValue]}>₹{(total / 100).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={[styles.input, errors.deliveryAddress && styles.inputError]}
            value={deliveryAddress}
            onChangeText={text => { setDeliveryAddress(text); if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: undefined }); }}
            placeholder="Enter delivery address"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
            autoCapitalize="words"
          />
          {errors.deliveryAddress && <Text style={styles.errorText}>{errors.deliveryAddress}</Text>}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for the vendor..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={2}
            autoCapitalize="sentences"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Upi' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Upi')}
            >
              <View style={[
                styles.radioOuter,
                paymentMethod === 'Upi' && styles.radioOuterSelected,
              ]}>
                {paymentMethod === 'Upi' && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'Upi' && styles.paymentOptionTextSelected,
              ]}>UPI Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Cash' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Cash')}
            >
              <View style={[
                styles.radioOuter,
                paymentMethod === 'Cash' && styles.radioOuterSelected,
              ]}>
                {paymentMethod === 'Cash' && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'Cash' && styles.paymentOptionTextSelected,
              ]}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'Upi' && (
            <View style={styles.upiInputContainer}>
              <TextInput
                style={[styles.input, errors.upiId && styles.inputError]}
                value={upiId}
                onChangeText={text => { setUpiId(text); if (errors.upiId) setErrors({ ...errors, upiId: undefined }); }}
                placeholder="Enter UPI ID (e.g., user@paytm)"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
              />
              {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isLoading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.success.foreground} size="large" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order - ₹{(total / 100).toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.text.secondary,
  },
  emptySubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.dark,
    borderRadius: radius.lg,
  },
  backButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.md,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  summaryItemLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryItemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  summaryItemQty: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  summaryItemTotal: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.dark,
  },
  priceBreakdown: {
    gap: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  priceValue: {
    fontFamily: typography.sansMedium,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  priceTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  priceTotalLabel: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  priceTotalValue: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.primary.dark,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontFamily: typography.sans,
    fontSize: typography.md,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.bg,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.error.DEFAULT,
    marginTop: spacing.xs,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  paymentOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.DEFAULT,
  },
  paymentOptionText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  paymentOptionTextSelected: {
    color: colors.primary.DEFAULT,
  },
  upiInputContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  bottomBar: {
    padding: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    ...shadows.lg,
  },
  placeOrderButton: {
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  placeOrderButtonDisabled: {
    backgroundColor: colors.border.subtle,
  },
  placeOrderButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
});