import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { EmployeeNavigationProp, EmployeeStackParamList } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { Order, OrderStatus } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const EmployeeOrderDetailScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const route = useRoute<RouteProp<EmployeeStackParamList, 'EmployeeOrderDetail'>>();
  const { currentOrder, fetchOrder, isLoading, error, clearCurrentOrder } = useEmployeeStore();

  useEffect(() => {
    fetchOrder(route.params.orderId);
    return () => clearCurrentOrder();
  }, [route.params.orderId]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { bg: colors.warning.bg, text: colors.warning.dark, icon: 'time' };
      case 'confirmed': return { bg: colors.info.bg, text: colors.info.dark, icon: 'checkmark-circle' };
      case 'preparing': return { bg: colors.primaryLight, text: colors.primary.dark, icon: 'restaurant' };
      case 'ready': return { bg: colors.success.bg, text: colors.success.dark, icon: 'bag-handle' };
      case 'completed': return { bg: colors.background.secondary, text: colors.text.secondary, icon: 'checkmark-circle' };
      case 'cancelled': return { bg: colors.error.bg, text: colors.error.dark, icon: 'close-circle' };
      default: return { bg: colors.background.secondary, text: colors.text.muted, icon: 'help-circle' };
    }
  };

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Your order has been placed and is awaiting confirmation from the vendor.';
      case 'confirmed': return 'The vendor has confirmed your order and will start preparing it soon.';
      case 'preparing': return 'Your order is being prepared in the kitchen.';
      case 'ready': return 'Your order is ready for pickup! Show the QR code to the vendor.';
      case 'completed': return 'Order completed successfully. Enjoy your meal!';
      case 'cancelled': return 'This order has been cancelled.';
      default: return 'Unknown status';
    }
  };

  if (isLoading && !currentOrder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const order = currentOrder;
  const statusStyle = getStatusColor(order.status);
  const vendorName = order.vendor?.businessName || 'Unknown Vendor';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={16} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Status Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <Text style={styles.statusDescription}>{getStatusDescription(order.status)}</Text>
          <View style={styles.progressSteps}>
            {(['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((step, index) => {
              const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[];
              const isCompleted = statusOrder.indexOf(step) <= statusOrder.indexOf(order.status);
              const isCurrent = step === order.status;
              return (
                <View key={step} style={styles.progressStep}>
                  <View style={[
                    styles.progressCircle,
                    isCompleted && styles.progressCircleCompleted,
                    isCurrent && styles.progressCircleCurrent,
                  ]}>
                    {isCompleted && <Ionicons name="checkmark" size={16} color={colors.primary.foreground} />}
                    {!isCompleted && <Text style={styles.progressNumber}>{index + 1}</Text>}
                  </View>
                  <Text style={[
                    styles.progressLabel,
                    isCompleted && styles.progressLabelCompleted,
                    isCurrent && styles.progressLabelCurrent,
                  ]}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Text>
                  {index < 4 && (
                    <View style={[
                      styles.progressLine,
                      isCompleted && styles.progressLineCompleted,
                    ]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Business Name</Text>
              <Text style={styles.infoValue}>{vendorName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{order.vendor?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Order Time</Text>
              <Text style={styles.infoValue}>{new Date(order.createdAt).toLocaleTimeString()}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemImagePlaceholder} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.specialInstructions && (
                  <Text style={styles.itemInstructions}>Note: {item.specialInstructions}</Text>
                )}
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{(item.price / 100).toFixed(2)} each</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{(order.subtotal / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>₹{(order.taxAmount / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>₹{(order.deliveryFee / 100).toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={[styles.priceLabel, styles.priceTotalLabel]}>Total</Text>
              <Text style={[styles.priceValue, styles.priceTotalValue]}>₹{(order.total / 100).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Method</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{order.paymentStatus}</Text>
            </View>
            {order.paymentId && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Payment ID</Text>
                <Text style={styles.infoValue}>{order.paymentId}</Text>
              </View>
            )}
            {order.qrCodeData && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>QR Code</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{order.qrCodeData.substring(0, 20)}...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Special Instructions */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Actions */}
        {order.status === 'ready' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => navigation.navigate('QrCodeDisplay', { orderId: order.id, qrToken: order.qrCodeData || '', expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() } as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={20} color={colors.primary.foreground} style={styles.qrButtonIcon} />
              <Text style={styles.qrButtonText}>View QR Code for Pickup</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
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
  statusDescription: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    lineHeight: 20,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleCompleted: {
    borderColor: colors.success.DEFAULT,
    backgroundColor: colors.success.DEFAULT,
  },
  progressCircleCurrent: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
    borderWidth: 3,
  },
  progressNumber: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  progressLabel: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    width: 60,
  },
  progressLabelCompleted: {
    color: colors.success.DEFAULT,
    fontFamily: typography.sansSemiBold,
  },
  progressLabelCurrent: {
    color: colors.primary.DEFAULT,
    fontFamily: typography.sansBold,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border.default,
    marginTop: 15,
  },
  progressLineCompleted: {
    backgroundColor: colors.success.DEFAULT,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.primary,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.md,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  itemInstructions: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.warning.DEFAULT,
    fontStyle: 'italic',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemQty: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
  itemPrice: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.primary.DEFAULT,
  },
  priceBreakdown: {
    gap: spacing.sm,
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
    fontFamily: typography.sansSemiBold,
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
    color: colors.primary.DEFAULT,
  },
  notesText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.primary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionsSection: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  qrButtonIcon: {
    marginRight: spacing.xs,
  },
  qrButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
});